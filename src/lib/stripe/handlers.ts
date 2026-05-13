import Stripe from "stripe";
import { createElement } from "react";
import { createAdminClient } from "@/lib/supabase/admin";
import { trackRevenueEvent } from "@/lib/analytics/track-server";
import { sendEmail } from "@/lib/email/send";
import {
  formatDate,
  formatMoney,
  getInvoiceContext,
  getPlanContext,
  getSubscriptionEmailRecipient,
} from "@/lib/email/context";
import { PaymentFailed } from "@/emails/billing/PaymentFailed";
import { Receipt } from "@/emails/billing/Receipt";
import { SubscriptionCanceled } from "@/emails/billing/SubscriptionCanceled";
import { SubscriptionReactivated } from "@/emails/billing/SubscriptionReactivated";
import { SubscriptionUpgraded } from "@/emails/billing/SubscriptionUpgraded";
import { TrialConverted } from "@/emails/billing/TrialConverted";
import { TrialEnding } from "@/emails/billing/TrialEnding";
import { PLANS, type BillingInterval, type PaidBillingPlan } from "@/lib/stripe/products";
import { stripe } from "@/lib/stripe/server";

type DbError = { message: string };
type QueryResult<T> = Promise<{ data: T | null; error: DbError | null }>;

type QueryBuilder<T = Record<string, unknown>> = {
  select(columns?: string): QueryBuilder<T>;
  eq(column: string, value: unknown): QueryBuilder<T>;
  in(column: string, values: readonly string[]): QueryBuilder<T>;
  order(column: string, options?: Record<string, unknown>): QueryBuilder<T>;
  limit(count: number): QueryBuilder<T>;
  maybeSingle(): QueryResult<T>;
  single(): QueryResult<T>;
  insert(values: unknown): QueryBuilder<T>;
  update(values: Record<string, unknown>): QueryBuilder<T>;
  upsert(values: Record<string, unknown>, options?: Record<string, unknown>): QueryBuilder<T>;
  then<TResult1 = { data: T[] | null; error: DbError | null }, TResult2 = never>(
    onfulfilled?:
      | ((value: { data: T[] | null; error: DbError | null }) => TResult1 | PromiseLike<TResult1>)
      | null,
    onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null
  ): PromiseLike<TResult1 | TResult2>;
};

type AdminDb = {
  from<T = Record<string, unknown>>(table: string): QueryBuilder<T>;
};

type OwnerContext = {
  userId: string | null;
  orgId: string | null;
  customerId: string;
};

type SubscriptionRow = {
  id: string;
  user_id: string | null;
  org_id: string | null;
  plan: PaidBillingPlan | "enterprise";
  status: string;
  stripe_subscription_id: string;
  billing_interval: BillingInterval;
  current_period_end: string;
  quantity: number | null;
  cancel_at_period_end?: boolean | null;
};

type CustomerMetadata = {
  user_id?: string;
  org_id?: string;
};

type InvoiceLine = {
  period?: {
    start?: number;
    end?: number;
  };
};

const ACTIVE_STATUSES = new Set(["active", "trialing"]);
const TERMINAL_STATUSES = new Set(["canceled", "unpaid", "incomplete_expired"]);

function adminDb() {
  return createAdminClient() as unknown as AdminDb;
}

function unixToIso(timestamp: number | null | undefined) {
  if (!timestamp) return null;
  return new Date(timestamp * 1000).toISOString();
}

function requireIso(timestamp: number | null | undefined) {
  return unixToIso(timestamp) ?? new Date().toISOString();
}

function getCustomerId(customer: string | Stripe.Customer | Stripe.DeletedCustomer | null) {
  if (!customer) throw new Error("Stripe customer missing from object");
  return typeof customer === "string" ? customer : customer.id;
}

function getSubscriptionPeriod(subscription: Stripe.Subscription) {
  const item = subscription.items.data[0] as unknown as Record<string, unknown> | undefined;
  return {
    start: requireIso(typeof item?.current_period_start === "number" ? item.current_period_start : null),
    end: requireIso(typeof item?.current_period_end === "number" ? item.current_period_end : null),
  };
}

function getInvoiceSubscriptionId(invoice: Stripe.Invoice) {
  const value = (invoice as unknown as Record<string, unknown>).subscription;
  if (typeof value === "string") return value;
  if (value && typeof value === "object" && "id" in value) {
    const id = (value as { id?: unknown }).id;
    return typeof id === "string" ? id : null;
  }

  const parent = (invoice as unknown as { parent?: { subscription_details?: { subscription?: unknown } } }).parent;
  return typeof parent?.subscription_details?.subscription === "string"
    ? parent.subscription_details.subscription
    : null;
}

function getInvoiceCustomerId(invoice: Stripe.Invoice) {
  const value = invoice.customer;
  if (!value) return null;
  return typeof value === "string" ? value : value.id;
}

function getInvoicePeriod(invoice: Stripe.Invoice) {
  const line = invoice.lines?.data?.[0] as unknown as InvoiceLine | undefined;
  return {
    start: unixToIso(line?.period?.start),
    end: unixToIso(line?.period?.end),
  };
}

function planFromPriceId(priceId: string | null | undefined): PaidBillingPlan | "enterprise" | null {
  if (!priceId) return null;
  if (
    priceId === PLANS.pro.stripePriceIds.monthly ||
    priceId === PLANS.pro.stripePriceIds.yearly
  ) {
    return "pro";
  }

  if (
    priceId === PLANS.team.stripePriceIds.monthly ||
    priceId === PLANS.team.stripePriceIds.yearly ||
    priceId === PLANS.team.stripePriceIds.seatMonthly ||
    priceId === PLANS.team.stripePriceIds.seatYearly
  ) {
    return "team";
  }

  if (
    priceId === PLANS.business.stripePriceIds.monthly ||
    priceId === PLANS.business.stripePriceIds.yearly ||
    priceId === PLANS.business.stripePriceIds.seatMonthly ||
    priceId === PLANS.business.stripePriceIds.seatYearly
  ) {
    return "business";
  }

  return null;
}

function intervalFromPrice(price: Stripe.Price): BillingInterval {
  return price.recurring?.interval === "year" ? "year" : "month";
}

function getBaseItem(subscription: Stripe.Subscription) {
  return (
    subscription.items.data.find((item) => {
      const plan = planFromPriceId(item.price.id);
      const isSeat =
        item.price.id === PLANS.team.stripePriceIds.seatMonthly ||
        item.price.id === PLANS.team.stripePriceIds.seatYearly ||
        item.price.id === PLANS.business.stripePriceIds.seatMonthly ||
        item.price.id === PLANS.business.stripePriceIds.seatYearly;
      return (plan === "pro" || plan === "team" || plan === "business") && !isSeat;
    }) ?? subscription.items.data[0]
  );
}

function getSeatItem(subscription: Stripe.Subscription) {
  return subscription.items.data.find((item) => {
    return (
      item.price.id === PLANS.team.stripePriceIds.seatMonthly ||
      item.price.id === PLANS.team.stripePriceIds.seatYearly ||
      item.price.id === PLANS.business.stripePriceIds.seatMonthly ||
      item.price.id === PLANS.business.stripePriceIds.seatYearly
    );
  });
}

function appUrl(path: string) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  return `${baseUrl}${path}`;
}

function planFeatures(plan: PaidBillingPlan | "enterprise") {
  if (plan === "team") return "Team workspace, Mini-HRIS, bulk employee import, and advanced analytics.";
  if (plan === "business") return "Business HRIS, unlimited employees, custom reports, custom workflows, helpdesk, surveys, branding, and priority support.";
  if (plan === "enterprise") return "Enterprise controls, support, and custom workspace features.";
  return "Unlimited generations, premium templates, full Copilot access, and document history.";
}

function getFailureReason(invoice: Stripe.Invoice) {
  const paymentIntent = (invoice as unknown as { payment_intent?: Stripe.PaymentIntent | string | null }).payment_intent;
  if (paymentIntent && typeof paymentIntent !== "string") {
    return paymentIntent.last_payment_error?.decline_code ?? paymentIntent.last_payment_error?.code ?? "payment_failed";
  }
  return "payment_failed";
}

async function sendBillingEmail(args: {
  subscription: SubscriptionRow | null;
  type:
    | "trial_ending"
    | "trial_ended"
    | "payment_failed"
    | "payment_receipt"
    | "subscription_canceled"
    | "subscription_upgraded"
    | "subscription_reactivated";
  subject: string;
  react: React.ReactElement;
}) {
  if (!args.subscription) return;
  const recipient = await getSubscriptionEmailRecipient(args.subscription);
  if (!recipient) return;

  try {
    await sendEmail({
      to: recipient.email,
      userId: recipient.id,
      type: args.type,
      subject: args.subject,
      react: args.react,
    });
  } catch (err) {
    console.error(`Failed to send ${args.type} email`, err);
  }
}

async function getCustomerMetadata(customerId: string): Promise<CustomerMetadata> {
  const customer = await stripe.customers.retrieve(customerId);
  if (customer.deleted) return {};
  return customer.metadata as CustomerMetadata;
}

async function findOwnerFromCustomer(customerId: string): Promise<OwnerContext> {
  const db = adminDb();
  const metadata = await getCustomerMetadata(customerId);

  if (metadata.org_id) {
    return { userId: metadata.user_id ?? null, orgId: metadata.org_id, customerId };
  }

  if (metadata.user_id) {
    return { userId: metadata.user_id, orgId: null, customerId };
  }

  const { data: profile } = await db
    .from<{ id: string }>("profiles")
    .select("id")
    .eq("stripe_customer_id", customerId)
    .maybeSingle();

  if (profile) {
    return { userId: profile.id, orgId: null, customerId };
  }

  const { data: org } = await db
    .from<{ id: string; created_by: string | null }>("organisations")
    .select("id, created_by")
    .eq("stripe_customer_id", customerId)
    .maybeSingle();

  if (org) {
    return { userId: org.created_by, orgId: org.id, customerId };
  }

  throw new Error(`No Atlas owner found for Stripe customer ${customerId}`);
}

async function protectDocumentsForUsers(userIds: string[]) {
  if (userIds.length === 0) return;
  const db = adminDb();
  await db
    .from("generated_documents")
    .update({ retention_override: true })
    .in("user_id", userIds);
}

async function setAccessForSubscription(
  owner: OwnerContext,
  plan: PaidBillingPlan | "enterprise",
  status: string
) {
  const db = adminDb();

  if (ACTIVE_STATUSES.has(status)) {
    if (plan === "pro" && owner.userId) {
      await db.from("profiles").update({ role: "pro" }).eq("id", owner.userId);
      await protectDocumentsForUsers([owner.userId]);
    }

    if ((plan === "team" || plan === "business") && owner.orgId) {
      await db.from("organisations").update({ plan }).eq("id", owner.orgId);
      await syncOrgMemberProfileRoles(owner.orgId, plan);
      if (owner.userId) {
        await db.from("profiles").update({ role: plan === "business" ? "business_admin" : "team_admin" }).eq("id", owner.userId);
      }
      const { data: members } = await db
        .from("org_members")
        .select("user_id")
        .eq("org_id", owner.orgId);
      const memberIds = (members ?? []).map((m) => m.user_id).filter(Boolean) as string[];
      await protectDocumentsForUsers(memberIds);
    }

    if (plan === "enterprise") {
      if (owner.userId) {
        await db.from("profiles").update({ role: "enterprise" }).eq("id", owner.userId);
        await protectDocumentsForUsers([owner.userId]);
      }
      if (owner.orgId) {
        await db.from("organisations").update({ plan: "enterprise" }).eq("id", owner.orgId);
      }
    }
  }

  if (TERMINAL_STATUSES.has(status) && owner.userId) {
    await db.from("profiles").update({ role: "free" }).eq("id", owner.userId);
  }
}

async function syncOrgMemberProfileRoles(orgId: string, plan: "team" | "business") {
  const db = createAdminClient();
  const { data: members } = await db
    .from("org_members")
    .select("user_id, roles")
    .eq("org_id", orgId);

  const adminRole = plan === "business" ? "business_admin" : "team_admin";
  const memberRole = plan === "business" ? "business_member" : "team_member";

  await Promise.all(
    (members ?? [])
      .filter((member) => Boolean(member.user_id))
      .map((member) => {
        const roles = Array.isArray(member.roles) ? member.roles : [];
        const nextRole = roles.includes("workspace_owner") ? adminRole : memberRole;
        return db.from("profiles").update({ role: nextRole }).eq("id", member.user_id);
      })
  );
}

export async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  console.log(`Stripe checkout completed: ${session.id}`);
}

export async function handleSubscriptionUpsert(subscription: Stripe.Subscription) {
  const db = adminDb();
  const customerId = getCustomerId(subscription.customer);
  const owner = await findOwnerFromCustomer(customerId);
  const baseItem = getBaseItem(subscription);
  const seatItem = getSeatItem(subscription);
  const plan =
    (subscription.metadata.plan as PaidBillingPlan | undefined) ??
    planFromPriceId(baseItem.price.id);

  if (plan !== "pro" && plan !== "team" && plan !== "business" && plan !== "enterprise") {
    throw new Error(`Unsupported Stripe price for subscription ${subscription.id}`);
  }

  const orgId = subscription.metadata.org_id || owner.orgId;
  const userId = subscription.metadata.user_id || owner.userId;
  const rowOwner =
    (plan === "team" || plan === "business") && orgId
      ? { org_id: orgId, user_id: null }
      : { user_id: userId, org_id: null };

  if (!rowOwner.user_id && !rowOwner.org_id) {
    throw new Error(`Subscription ${subscription.id} has no Atlas owner`);
  }

  const { data: previous } = await db
    .from<SubscriptionRow>("subscriptions")
    .select("id, user_id, org_id, plan, status, stripe_subscription_id, billing_interval, current_period_end, quantity, cancel_at_period_end")
    .eq("stripe_subscription_id", subscription.id)
    .maybeSingle();

  const period = getSubscriptionPeriod(subscription);
  const planConfig = plan === "business" ? PLANS.business : plan === "team" ? PLANS.team : null;
  const quantity =
    planConfig
      ? planConfig.includedSeats + (seatItem?.quantity ?? 0)
      : baseItem.quantity ?? 1;

  const { error } = await db
    .from("subscriptions")
    .upsert(
      {
        ...rowOwner,
        stripe_subscription_id: subscription.id,
        stripe_customer_id: customerId,
        stripe_price_id: baseItem.price.id,
        stripe_seat_price_id: seatItem?.price.id ?? null,
        plan,
        billing_interval: intervalFromPrice(baseItem.price),
        status: subscription.status,
        quantity,
        current_period_start: period.start,
        current_period_end: period.end,
        cancel_at_period_end: subscription.cancel_at_period_end,
        canceled_at: unixToIso(subscription.canceled_at),
        trial_end: unixToIso(subscription.trial_end),
        legacy_pricing: subscription.metadata.legacy_pricing === "true",
        legacy_until: subscription.metadata.legacy_until || null,
        legacy_price_summary: subscription.metadata.legacy_price_summary || null,
      },
      { onConflict: "stripe_subscription_id" }
    )
    .select("id")
    .single();

  if (error) throw new Error(error.message);

  await setAccessForSubscription(
    { userId: userId ?? null, orgId: orgId ?? null, customerId },
    plan,
    subscription.status
  );

  const planContext = await getPlanContext(subscription.id);
  if (!planContext) return;

  const currentRow = planContext.subscription;
  // Track new subscription (no previous record = first activation)
  if (!previous && ACTIVE_STATUSES.has(subscription.status) && userId) {
    void trackRevenueEvent(userId, "subscription_started", {
      plan,
      interval: intervalFromPrice(baseItem.price),
      in_trial: subscription.status === "trialing",
    });
  }

  if (previous?.status === "trialing" && subscription.status === "active") {
    await sendBillingEmail({
      subscription: currentRow,
      type: "trial_ended",
      subject: `Welcome to Atlas HR ${planContext.planName} - payment confirmed`,
      react: createElement(TrialConverted, {
        planName: planContext.planName,
        nextBilling: planContext.nextBilling,
        amount: planContext.amount,
        invoiceUrl: "",
        dashboardUrl: appUrl("/dashboard"),
      }),
    });
    if (userId) {
      void trackRevenueEvent(userId, "trial_converted", {
        plan,
        interval: intervalFromPrice(baseItem.price),
      });
    }
  }

  if (previous && previous.plan !== plan && ACTIVE_STATUSES.has(subscription.status)) {
    await sendBillingEmail({
      subscription: currentRow,
      type: "subscription_upgraded",
      subject: `Welcome to ${planContext.planName}`,
      react: createElement(SubscriptionUpgraded, {
        newPlanName: planContext.planName,
        newFeatures: planFeatures(plan),
        prorated: "Any prorated charge will appear on your next invoice.",
        dashboardUrl: appUrl("/dashboard"),
      }),
    });
  }

  if (previous && !previous.cancel_at_period_end && subscription.cancel_at_period_end) {
    await sendBillingEmail({
      subscription: currentRow,
      type: "subscription_canceled",
      subject: "Your Atlas HR subscription is scheduled to cancel",
      react: createElement(SubscriptionCanceled, {
        planName: planContext.planName,
        periodEnd: planContext.nextBilling,
        immediate: false,
        billingUrl: appUrl("/settings/billing"),
        feedbackUrl: appUrl("/settings/billing"),
      }),
    });
  }

  if (previous && previous.status === "canceled" && ACTIVE_STATUSES.has(subscription.status)) {
    await sendBillingEmail({
      subscription: currentRow,
      type: "subscription_reactivated",
      subject: `Welcome back to Atlas HR ${planContext.planName}`,
      react: createElement(SubscriptionReactivated, {
        planName: planContext.planName,
        nextBilling: planContext.nextBilling,
        dashboardUrl: appUrl("/dashboard"),
      }),
    });
    if (userId) {
      void trackRevenueEvent(userId, "subscription_reactivated", { plan });
    }
  }
}

export async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const db = adminDb();
  const customerId = getCustomerId(subscription.customer);
  const owner = await findOwnerFromCustomer(customerId);
  const canceledAt = unixToIso(subscription.canceled_at) ?? new Date().toISOString();

  await db
    .from("subscriptions")
    .update({
      status: "canceled",
      cancel_at_period_end: subscription.cancel_at_period_end,
      canceled_at: canceledAt,
    })
    .eq("stripe_subscription_id", subscription.id);

  const { data: row } = await db
    .from<SubscriptionRow>("subscriptions")
    .select("id, user_id, org_id, plan, status, stripe_subscription_id, billing_interval, current_period_end, quantity")
    .eq("stripe_subscription_id", subscription.id)
    .maybeSingle();

  await setAccessForSubscription(owner, row?.plan ?? "pro", "canceled");

  if (row?.user_id) {
    const startedAt = row.current_period_end
      ? new Date(row.current_period_end).getTime() - 30 * 24 * 60 * 60 * 1000
      : Date.now();
    const daysActive = Math.floor((Date.now() - startedAt) / (1000 * 60 * 60 * 24));
    void trackRevenueEvent(row.user_id, "subscription_canceled", {
      plan: row.plan,
      days_active: daysActive,
    });
  }

  await sendBillingEmail({
    subscription: row,
    type: "subscription_canceled",
    subject: "Your Atlas HR subscription is canceled",
    react: createElement(SubscriptionCanceled, {
      planName: row ? PLANS[row.plan].name : "Pro",
      periodEnd: formatDate(subscription.ended_at ?? subscription.canceled_at),
      immediate: true,
      billingUrl: appUrl("/settings/billing"),
      feedbackUrl: appUrl("/settings/billing"),
    }),
  });
}

export async function handleInvoicePaid(invoice: Stripe.Invoice) {
  const db = adminDb();
  const stripeSubscriptionId = getInvoiceSubscriptionId(invoice);
  const customerId = getInvoiceCustomerId(invoice);
  const period = getInvoicePeriod(invoice);
  let subscription: SubscriptionRow | null = null;

  if (stripeSubscriptionId) {
    const { data } = await db
      .from<SubscriptionRow>("subscriptions")
      .select("id, user_id, org_id, plan, status, stripe_subscription_id, billing_interval, current_period_end, quantity")
      .eq("stripe_subscription_id", stripeSubscriptionId)
      .maybeSingle();
    subscription = data;
  }

  const owner = customerId ? await findOwnerFromCustomer(customerId) : null;

  await db.from("invoices").upsert(
    {
      stripe_invoice_id: invoice.id,
      subscription_id: subscription?.id ?? null,
      user_id: subscription?.user_id ?? owner?.userId ?? null,
      org_id: subscription?.org_id ?? owner?.orgId ?? null,
      amount_paid: invoice.amount_paid,
      amount_due: invoice.amount_due,
      currency: invoice.currency,
      status: invoice.status ?? "paid",
      invoice_pdf: invoice.invoice_pdf,
      hosted_invoice_url: invoice.hosted_invoice_url,
      period_start: period.start,
      period_end: period.end,
    },
    { onConflict: "stripe_invoice_id" }
  );

  if (subscription && subscription.status === "past_due") {
    await db
      .from("subscriptions")
      .update({ status: "active" })
      .eq("id", subscription.id);

    const ownerContext: OwnerContext = {
      userId: subscription.user_id,
      orgId: subscription.org_id,
      customerId: customerId ?? "",
    };
    await setAccessForSubscription(ownerContext, subscription.plan, "active");
  }

  const planContext = stripeSubscriptionId ? await getPlanContext(stripeSubscriptionId) : null;
  const invoiceContext = await getInvoiceContext(invoice);

  await sendBillingEmail({
    subscription,
    type: "payment_receipt",
    subject: `Your Atlas HR receipt - ${invoiceContext.amountPaid}`,
    react: createElement(Receipt, {
      amount: invoiceContext.amountPaid,
      lineItems: invoiceContext.lines,
      paymentMethod: invoiceContext.paymentMethod,
      periodStart: invoiceContext.periodStart,
      periodEnd: invoiceContext.periodEnd,
      tax: invoiceContext.tax,
      invoicePdf: invoiceContext.invoicePdf,
    }),
  });

  if (planContext && subscription?.status === "trialing") {
    await sendBillingEmail({
      subscription,
      type: "trial_ended",
      subject: `Welcome to Atlas HR ${planContext.planName} - payment confirmed`,
      react: createElement(TrialConverted, {
        planName: planContext.planName,
        nextBilling: planContext.nextBilling,
        amount: invoiceContext.amountPaid,
        invoiceUrl: invoiceContext.hostedInvoiceUrl,
        dashboardUrl: appUrl("/dashboard"),
      }),
    });
  }
}

export async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  const db = adminDb();
  const stripeSubscriptionId = getInvoiceSubscriptionId(invoice);
  let subscription: SubscriptionRow | null = null;

  if (stripeSubscriptionId) {
    await db
      .from("subscriptions")
      .update({ status: "past_due" })
      .eq("stripe_subscription_id", stripeSubscriptionId);

    const { data } = await db
      .from<SubscriptionRow>("subscriptions")
      .select("id, user_id, org_id, plan, status, stripe_subscription_id, billing_interval, current_period_end, quantity")
      .eq("stripe_subscription_id", stripeSubscriptionId)
      .maybeSingle();
    subscription = data;
  }

  const planContext = stripeSubscriptionId ? await getPlanContext(stripeSubscriptionId) : null;
  const retryAt = (invoice as unknown as { next_payment_attempt?: number | null }).next_payment_attempt;
  const portalUrl = appUrl("/settings/billing");

  if (subscription?.user_id) {
    const attemptNumber =
      (invoice as unknown as { attempt_count?: number }).attempt_count ?? 1;
    void trackRevenueEvent(subscription.user_id, "payment_failed", {
      plan: subscription.plan,
      attempt_number: attemptNumber,
    });
  }

  await sendBillingEmail({
    subscription,
    type: "payment_failed",
    subject: "Action required: Atlas HR payment failed",
    react: createElement(PaymentFailed, {
      amount: formatMoney(invoice.amount_due, invoice.currency),
      planName: planContext?.planName ?? "Atlas HR",
      declineReason: getFailureReason(invoice),
      retryDate: formatDate(retryAt),
      portalUrl,
    }),
  });
}

export async function handleTrialWillEnd(subscription: Stripe.Subscription) {
  const db = adminDb();
  const { data: row } = await db
    .from<SubscriptionRow>("subscriptions")
    .select("id, user_id, org_id, plan, status, stripe_subscription_id, billing_interval, current_period_end, quantity")
    .eq("stripe_subscription_id", subscription.id)
    .maybeSingle();
  const planContext = await getPlanContext(subscription.id);

  await sendBillingEmail({
    subscription: row,
    type: "trial_ending",
    subject: `Your Atlas HR ${planContext?.planName ?? "Pro"} trial ends in 3 days`,
    react: createElement(TrialEnding, {
      firstName: "there",
      planName: planContext?.planName ?? "Pro",
      endDate: formatDate(subscription.trial_end),
      amount: planContext?.amount ?? "$0.00",
      interval: planContext?.interval ?? "month",
      dashboardUrl: appUrl("/dashboard"),
      billingUrl: appUrl("/settings/billing"),
    }),
  });
}
