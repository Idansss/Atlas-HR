"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, useTransition, Suspense } from "react";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import {
  signUpWithPassword,
  updateProfile,
  signInWithOAuth,
} from "@/app/(auth)/actions";
import { createClient } from "@/lib/supabase/client";
import { track } from "@/lib/analytics/track";
import { Combobox } from "@/components/ui/combobox";
import { MultiSelect } from "@/components/ui/multi-select";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { COMPANY_SIZES, GOALS, INDUSTRIES } from "@/lib/constants";
import COUNTRIES from "@/lib/data/countries.json";
import type { Profile } from "@/types/database";

const LS_KEY = "atlas-signup-wizard";

const DEFAULT_FORM = {
  name: "", email: "", password: "", beta_code: "",
  job_title: "", country: "", company_size: "", industry: "",
};

const COUNTRY_OPTIONS = COUNTRIES.map((country) => ({ value: country, label: country }));
const COMPANY_SIZE_OPTIONS = COMPANY_SIZES.map((size) => ({ value: size, label: size }));
const INDUSTRY_OPTIONS = INDUSTRIES.map((industry) => ({
  value: industry.label,
  label: industry.label,
}));
const GOAL_OPTIONS = GOALS.map((goal) => ({ value: goal, label: goal }));

function detectStep(profile: Profile): number {
  if (profile.onboarding_completed) return 4;
  if (profile.job_title) return 3;
  return 2;
}

function readLS(): Partial<typeof DEFAULT_FORM> | null {
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

const inputCls =
  "w-full rounded-xl border border-[--border] bg-[--bg-input] px-3 py-2.5 text-sm text-[--text-primary] outline-none focus:border-[--accent] focus:ring-1 focus:ring-[--accent] placeholder:text-[--text-tertiary] transition-colors";

function SignUpWizard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const paramStep = parseInt(searchParams.get("step") ?? "0");
  const betaRequired = process.env.NEXT_PUBLIC_BETA_SIGNUP_REQUIRED === "true";
  const calendlyUrl = process.env.NEXT_PUBLIC_BETA_ONBOARDING_CALENDLY_URL;

  const [step, setStep] = useState(paramStep >= 2 && paramStep <= 3 ? paramStep : 1);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(searchParams.get("error"));
  const [isPending, startTransition] = useTransition();
  const [oauthPending, setOauthPending] = useState<string | null>(null);
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);

  // Pre-fill from localStorage on first render (SSR-safe)
  const [form, setForm] = useState<typeof DEFAULT_FORM>(() => {
    if (typeof window !== "undefined") {
      const saved = readLS();
      if (saved) return { ...DEFAULT_FORM, ...saved, beta_code: searchParams.get("code") ?? saved.beta_code ?? "" };
    }
    return { ...DEFAULT_FORM, beta_code: searchParams.get("code") ?? "" };
  });

  // Persist to localStorage whenever form values change
  useEffect(() => {
    localStorage.setItem(LS_KEY, JSON.stringify(form));
  }, [form]);

  // Track signup_started once when step 1 is first shown
  useEffect(() => {
    if (step === 1) {
      const source = (new URLSearchParams(window.location.search).get("source") ?? "direct") as
        | "pricing" | "landing" | "invite" | "direct";
      track("signup_started", { source: form.beta_code ? "invite" : source });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Detect auth state on load — resume wizard if authenticated + incomplete
  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (!profile) return;

      const detectedStep = detectStep(profile);
      if (detectedStep === 4) {
        router.replace("/dashboard");
        return;
      }
      // Profile data takes precedence over localStorage for already-saved fields
      setForm((f) => ({
        ...f,
        name: profile.full_name ?? f.name,
        email: user.email ?? f.email,
        job_title: profile.job_title ?? f.job_title,
        country: profile.country ?? f.country,
        company_size: profile.company_size ?? f.company_size,
        industry: profile.industry ?? f.industry,
      }));
      if (profile.goals?.length) setSelectedGoals(profile.goals);
      setStep(detectedStep);
    });
  }, [router]);

  // ── Step 1: Create account ───────────────────────────────────────────────
  async function handleStep1(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await signUpWithPassword({
        email: form.email,
        password: form.password,
        fullName: form.name,
        betaCode: form.beta_code,
      });
      if (!result.ok) {
        setError(result.error ?? null);
        return;
      }
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/verify-email");
        return;
      }
      setStep(2);
    });
  }

  // ── Step 2: Profile details ──────────────────────────────────────────────
  async function handleStep2(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await updateProfile({
        job_title: form.job_title || null,
        country: form.country || null,
        company_size: form.company_size || null,
        industry: form.industry || null,
      });
      if (!result.ok) { setError(result.error ?? null); return; }
      setStep(3);
    });
  }

  // ── Step 3: Goals ────────────────────────────────────────────────────────
  async function handleStep3(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await updateProfile({
        goals: selectedGoals,
        onboarding_completed: true,
      });
      if (!result.ok) { setError(result.error ?? null); return; }
      track("signup_completed", {
        source: (new URLSearchParams(window.location.search).get("source") ?? "direct"),
        country: form.country || undefined,
        industry: form.industry || undefined,
        company_size: form.company_size || undefined,
        goals_count: selectedGoals.length,
      });
      localStorage.removeItem(LS_KEY);
      router.push("/dashboard");
    });
  }

  async function handleSkip() {
    startTransition(async () => {
      await updateProfile({ onboarding_completed: true });
      localStorage.removeItem(LS_KEY);
      router.push("/dashboard");
    });
  }

  async function handleOAuth(provider: "google" | "linkedin_oidc") {
    setError(null);
    setOauthPending(provider);
    track("oauth_initiated", { provider: provider === "linkedin_oidc" ? "linkedin" : "google" });
    const result = await signInWithOAuth({ provider, betaCode: form.beta_code });
    if (result && !result.ok) {
      setError(result.error ?? null);
      setOauthPending(null);
    }
  }

  return (
    <div className="flex justify-center px-4 py-8 sm:py-10">
      <div className="w-full max-w-sm px-4">
        {/* Header */}
        <div className="mb-6 text-center">
          <div className="mx-auto mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-[--accent] text-white font-bold">
            A
          </div>
          <h1 className="text-2xl font-bold text-[--text-primary]">
            {step === 1 && "Create your account"}
            {step === 2 && "Tell us about yourself"}
            {step === 3 && "What are your goals?"}
          </h1>
          <div className="mt-3 flex items-center justify-center gap-1.5">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`h-1.5 rounded-full transition-all ${
                  s <= step ? "w-8 bg-[--accent]" : "w-4 bg-[--border]"
                }`}
              />
            ))}
          </div>
        </div>

        {error && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-400">
            {error}
          </div>
        )}

        {/* ── Step 1 ── */}
        {step === 1 && (
          <>
            <form onSubmit={handleStep1} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-[--text-primary]">Full name</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                  autoComplete="name"
                  placeholder="Jane Smith"
                  className={inputCls}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-[--text-primary]">Work email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                  autoComplete="email"
                  placeholder="you@company.com"
                  className={inputCls}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-[--text-primary]">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    required
                    minLength={8}
                    autoComplete="new-password"
                    placeholder="8+ characters"
                    className={`${inputCls} pr-10`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[--text-tertiary]"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-[--text-primary]">
                  Beta invite code{betaRequired ? "" : " (optional)"}
                </label>
                <input
                  type="text"
                  value={form.beta_code}
                  onChange={(e) => setForm({ ...form, beta_code: e.target.value.toUpperCase().replace(/\s+/g, "") })}
                  required={betaRequired}
                  autoComplete="off"
                  placeholder="BETA-ABC123"
                  className={inputCls}
                />
                <p className="mt-1.5 text-xs text-[--text-tertiary]">
                  Beta users get three months of Pro access in exchange for honest feedback.
                </p>
              </div>

              <button
                type="submit"
                disabled={isPending}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-[--accent] py-3 text-sm font-semibold text-white hover:bg-[--accent-hover] disabled:opacity-60 transition-colors"
              >
                {isPending && <Loader2 size={15} className="animate-spin" />}
                Create account
              </button>
            </form>

            <div className="my-6 flex items-center gap-3">
              <div className="h-px flex-1 bg-[--border]" />
              <span className="text-xs text-[--text-tertiary]">or</span>
              <div className="h-px flex-1 bg-[--border]" />
            </div>

            <div className="space-y-3">
              {(
                [
                  { provider: "google", label: "Google" },
                  { provider: "linkedin_oidc", label: "LinkedIn" },
                ] as const
              ).map(({ provider, label }) => (
                <button
                  key={provider}
                  type="button"
                  disabled={!!oauthPending}
                  onClick={() => handleOAuth(provider)}
                  className="w-full flex items-center justify-center gap-2 rounded-xl border border-[--border] py-2.5 text-sm font-medium text-[--text-primary] hover:bg-[--bg-hover] disabled:opacity-60 transition-colors"
                >
                  {oauthPending === provider && <Loader2 size={14} className="animate-spin" />}
                  Sign up with {label}
                </button>
              ))}
            </div>

            <p className="mt-6 text-center text-sm text-[--text-secondary]">
              Already have an account?{" "}
              <Link href="/sign-in" className="font-medium text-[--accent] hover:underline">
                Sign in
              </Link>
            </p>
          </>
        )}

        {/* ── Step 2 ── */}
        {step === 2 && (
          <form onSubmit={handleStep2} className="space-y-4">
            {form.beta_code && (
              <div className="rounded-xl border border-[--accent]/30 bg-[--accent-soft] px-4 py-3 text-sm text-[--text-primary]">
                <p className="font-semibold">Welcome to the private beta.</p>
                <p className="mt-1 text-[--text-secondary]">
                  Start with one document generator, ask Atlas Copilot one real HR question, save an article,
                  browse templates, then send feedback from the in-app widget.
                </p>
                {calendlyUrl && (
                  <Link href={calendlyUrl} className="mt-2 inline-block font-medium text-[--accent] hover:underline">
                    Schedule a 30-minute onboarding call
                  </Link>
                )}
              </div>
            )}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-[--text-primary]">Your HR role</label>
              <input
                type="text"
                value={form.job_title}
                onChange={(e) => setForm({ ...form, job_title: e.target.value })}
                placeholder="e.g. HR Manager, HRBP, People Lead"
                className={inputCls}
              />
            </div>
            <div>
              <label htmlFor="country" className="mb-1.5 block text-sm font-medium text-[--text-primary]">Country</label>
              <Combobox
                id="country"
                options={COUNTRY_OPTIONS}
                value={form.country}
                onValueChange={(country) => setForm({ ...form, country })}
                placeholder="Start typing your country..."
                searchPlaceholder="Search countries..."
                emptyMessage="No countries found."
              />
            </div>
            <div>
              <label htmlFor="company_size" className="mb-1.5 block text-sm font-medium text-[--text-primary]">Company size</label>
              <Select
                value={form.company_size || null}
                onValueChange={(companySize) => setForm({ ...form, company_size: companySize ?? "" })}
                items={COMPANY_SIZE_OPTIONS}
              >
                <SelectTrigger id="company_size">
                  <SelectValue placeholder="Select..." />
                </SelectTrigger>
                <SelectContent>
                  {COMPANY_SIZE_OPTIONS.map((size) => (
                    <SelectItem key={size.value} value={size.value}>
                      {size.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label htmlFor="industry" className="mb-1.5 block text-sm font-medium text-[--text-primary]">Industry</label>
              <Select
                value={form.industry || null}
                onValueChange={(industry) => setForm({ ...form, industry: industry ?? "" })}
                items={INDUSTRY_OPTIONS}
              >
                <SelectTrigger id="industry">
                  <SelectValue placeholder="Select..." />
                </SelectTrigger>
                <SelectContent>
                  {INDUSTRY_OPTIONS.map((industry) => (
                    <SelectItem key={industry.value} value={industry.value}>
                      {industry.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-[--accent] py-3 text-sm font-semibold text-white hover:bg-[--accent-hover] disabled:opacity-60 transition-colors"
            >
              {isPending && <Loader2 size={15} className="animate-spin" />}
              Continue
            </button>
            <button
              type="button"
              onClick={handleSkip}
              disabled={isPending}
              className="w-full text-center text-sm text-[--text-tertiary] hover:text-[--text-secondary] transition-colors"
            >
              Skip for now
            </button>
          </form>
        )}

        {/* ── Step 3 ── */}
        {step === 3 && (
          <form onSubmit={handleStep3} className="space-y-4">
            <div>
              <label htmlFor="goals" className="mb-1.5 block text-sm font-medium text-[--text-primary]">Goals</label>
              <MultiSelect
                id="goals"
                aria-label="Goals"
                options={GOAL_OPTIONS}
                value={selectedGoals}
                onValueChange={setSelectedGoals}
                placeholder="Select all that apply..."
                searchPlaceholder="Search goals..."
                emptyMessage="No goals found."
              />
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-[--accent] py-3 text-sm font-semibold text-white hover:bg-[--accent-hover] disabled:opacity-60 transition-colors"
            >
              {isPending && <Loader2 size={15} className="animate-spin" />}
              Finish setup
            </button>
            <button
              type="button"
              onClick={handleSkip}
              disabled={isPending}
              className="w-full text-center text-sm text-[--text-tertiary] hover:text-[--text-secondary] transition-colors"
            >
              Skip for now
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default function SignUpPage() {
  return (
    <Suspense fallback={<div className="flex justify-center px-4 py-8 sm:py-10"><div className="h-64 w-80 animate-pulse rounded-xl bg-[--bg-hover]" /></div>}>
      <SignUpWizard />
    </Suspense>
  );
}
