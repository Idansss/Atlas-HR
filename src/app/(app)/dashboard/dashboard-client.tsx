"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  ArrowRight,
  BarChart3,
  Bookmark,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  Clock,
  FileText,
  Globe,
  LineChart,
  Sparkles,
  TrendingUp,
  UserCheck,
  Users,
  Wrench,
} from "lucide-react";
import { useCopilot } from "@/stores/copilot-store";

const BRIEFS = [
  {
    title: "Your handbook was last reviewed 14 months ago",
    action: "Review now",
    href: "/tools/onboarding-checklist",
    type: "warning" as const,
  },
  {
    title: "5 community questions matching your interests",
    action: "See questions",
    href: "/community",
    type: "info" as const,
  },
  {
    title: "New article: Remote work best practices in Nigeria",
    action: "Read article",
    href: "/knowledge/remote-and-hybrid-work",
    type: "info" as const,
  },
];

const QUICK_ACTIONS = [
  { label: "Generate a document", icon: FileText, href: "/tools" },
  { label: "Browse templates", icon: BookOpen, href: "/templates" },
  { label: "Explore knowledge", icon: TrendingUp, href: "/knowledge" },
  { label: "Join community", icon: Users, href: "/community" },
];

const REPORTS = [
  { slug: "headcount", label: "Headcount", description: "Growth, distribution, and net change." },
  { slug: "turnover", label: "Turnover", description: "Exits, monthly rate, and risk patterns." },
  { slug: "hiring", label: "Hiring", description: "Open-role and funnel placeholders for ATS-lite." },
  { slug: "leave", label: "Leave", description: "Utilization, approvals, and upcoming absence." },
  { slug: "demographics", label: "Demographics", description: "Tenure, employment type, and distribution." },
  { slug: "compensation", label: "Compensation", description: "Restricted compensation analytics." },
  { slug: "compliance", label: "Compliance", description: "Document and policy readiness." },
];

const ITEM_TYPE_ICONS: Record<string, typeof FileText> = {
  article: BookOpen,
  template: FileText,
  tool: Wrench,
};

type DashboardTab = "workspace" | "for-you" | "reports";

interface RecentDoc {
  id: string;
  title: string | null;
  tool_name: string;
  created_at: string;
}

interface SavedItem {
  id: string;
  item_type: "article" | "template" | "tool";
  item_slug: string;
  saved_at: string;
}

interface Profile {
  full_name: string | null;
  country: string | null;
}

interface WorkspaceDashboard {
  orgId: string;
  orgName: string;
  roles: string[];
  defaultTab: "workspace" | "for-you";
  employeeCount: number;
  activeCount: number;
  onLeaveCount: number;
  terminatedThisMonth: number;
  pendingLeaveApprovals: number;
  leaveTodayCount: number;
  leaveThisWeekCount: number;
  newHiresNext7: number;
  probationDueCount: number;
  contractsExpiringCount: number;
  headcountTrend: { label: string; count: number }[];
  departmentCounts: { department: string; count: number }[];
  activity: { id: string; label: string; at: string; type: string }[];
}

interface Props {
  profile: Profile | null;
  recentDocs: RecentDoc[];
  savedItems: SavedItem[];
  workspace: WorkspaceDashboard | null;
}

function timeGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "Yesterday";
  return `${days}d ago`;
}

function savedItemLabel(item: SavedItem): string {
  return item.item_slug
    .split("/")
    .pop()!
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function savedItemHref(item: SavedItem): string {
  if (item.item_type === "article") return `/knowledge/${item.item_slug}`;
  if (item.item_type === "template") return `/templates/${item.item_slug}`;
  return `/tools/${item.item_slug}`;
}

function MetricCard({
  title,
  value,
  href,
  sub,
  icon: Icon,
}: {
  title: string;
  value: number | string;
  href: string;
  sub: string;
  icon: typeof Users;
}) {
  return (
    <Link
      href={href}
      className="rounded-xl border border-[--border] bg-[--bg-card] p-4 transition-colors hover:border-[--accent]"
    >
      <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-[--accent-soft] text-[--accent]">
        <Icon size={16} />
      </div>
      <p className="text-2xl font-bold text-[--text-primary]">{value}</p>
      <p className="mt-1 text-sm font-medium text-[--text-primary]">{title}</p>
      <p className="mt-1 text-xs leading-5 text-[--text-tertiary]">{sub}</p>
    </Link>
  );
}

function Sparkline({ data }: { data: { label: string; count: number }[] }) {
  const max = Math.max(1, ...data.map((item) => item.count));
  return (
    <div className="flex h-20 items-end gap-1" aria-label="12 month headcount trend">
      {data.map((item) => (
        <div key={item.label} className="flex flex-1 flex-col items-center gap-1">
          <div
            className="w-full rounded-t bg-[--accent]"
            style={{ height: `${Math.max(8, (item.count / max) * 64)}px` }}
            title={`${item.label}: ${item.count}`}
          />
          <span className="text-[10px] text-[--text-tertiary]">{item.label}</span>
        </div>
      ))}
    </div>
  );
}

function WorkspaceTab({ workspace }: { workspace: WorkspaceDashboard }) {
  const roleLabel = useMemo(() => {
    if (workspace.roles.includes("finance")) return "Finance view";
    if (workspace.roles.includes("people_manager") && !workspace.roles.includes("hr_admin")) return "Team view";
    if (workspace.roles.includes("employee") && workspace.roles.length === 1) return "Employee view";
    return "Workspace view";
  }, [workspace.roles]);

  const maxDepartment = Math.max(1, ...workspace.departmentCounts.map((item) => item.count));

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
      <div className="space-y-6">
        <div>
          <p className="text-sm font-medium text-[--accent]">{roleLabel}</p>
          <h1 className="mt-1 text-3xl font-bold text-[--text-primary]">{workspace.orgName}</h1>
          <p className="mt-1 text-sm text-[--text-secondary]">Operational HR work, workforce movement, and reports in one place.</p>
        </div>

        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-[--text-primary]">Pending your action</h2>
            <Link href="/workspace/leave" className="text-sm font-medium text-[--accent] hover:underline">
              View all
            </Link>
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            <MetricCard
              title="Leave approvals"
              value={workspace.pendingLeaveApprovals}
              href="/workspace/leave"
              sub="Pending requests routed through the current workspace."
              icon={CheckCircle2}
            />
            <MetricCard
              title="Missing reviews"
              value={workspace.probationDueCount}
              href="/workspace/reports/headcount"
              sub="Probation checkpoints due in the next 7 days."
              icon={UserCheck}
            />
            <MetricCard
              title="Document follow-ups"
              value={workspace.contractsExpiringCount}
              href="/workspace/reports/compliance"
              sub="Contracts or fixed-term records expiring in 60 days."
              icon={FileText}
            />
          </div>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold text-[--text-primary]">What&apos;s happening this week</h2>
          <div className="grid gap-3 md:grid-cols-3">
            <MetricCard title="New starters" value={workspace.newHiresNext7} href="/workspace/people" sub="Employees with start dates in the next 7 days." icon={Users} />
            <MetricCard title="On leave today" value={workspace.leaveTodayCount} href="/workspace/leave" sub="Approved leave covering today." icon={CalendarDays} />
            <MetricCard title="On leave this week" value={workspace.leaveThisWeekCount} href="/workspace/leave" sub="Approved leave overlapping the next 7 days." icon={Clock} />
          </div>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold text-[--text-primary]">Workforce at a glance</h2>
          <div className="grid gap-4 xl:grid-cols-2">
            <Link href="/workspace/reports/headcount" className="rounded-xl border border-[--border] bg-[--bg-card] p-5 transition-colors hover:border-[--accent]">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="text-sm text-[--text-secondary]">Total headcount</p>
                  <p className="mt-1 text-3xl font-bold text-[--text-primary]">{workspace.employeeCount}</p>
                </div>
                <LineChart className="text-[--accent]" size={22} />
              </div>
              <Sparkline data={workspace.headcountTrend} />
            </Link>

            <div className="rounded-xl border border-[--border] bg-[--bg-card] p-5">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="font-semibold text-[--text-primary]">Headcount by department</h3>
                <BarChart3 className="text-[--accent]" size={20} />
              </div>
              <div className="space-y-3">
                {workspace.departmentCounts.length === 0 ? (
                  <p className="text-sm text-[--text-tertiary]">No departments assigned yet.</p>
                ) : (
                  workspace.departmentCounts.slice(0, 6).map((item) => (
                    <Link key={item.department} href="/workspace/reports/headcount" className="block">
                      <div className="mb-1 flex justify-between text-xs">
                        <span className="text-[--text-secondary]">{item.department}</span>
                        <span className="font-medium text-[--text-primary]">{item.count}</span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-[--bg-hover]">
                        <div className="h-full rounded-full bg-[--accent]" style={{ width: `${(item.count / maxDepartment) * 100}%` }} />
                      </div>
                    </Link>
                  ))
                )}
              </div>
            </div>
          </div>

          <div className="mt-3 grid gap-3 md:grid-cols-3">
            <MetricCard title="Active" value={workspace.activeCount} href="/workspace/reports/headcount" sub="Employees currently marked active." icon={Users} />
            <MetricCard title="On leave" value={workspace.onLeaveCount} href="/workspace/reports/leave" sub="Employees currently marked on leave." icon={CalendarDays} />
            <MetricCard title="Terminated this month" value={workspace.terminatedThisMonth} href="/workspace/reports/turnover" sub="Exit records dated this calendar month." icon={TrendingUp} />
          </div>
        </section>
      </div>

      <aside className="space-y-4">
        <div className="rounded-xl border border-[--border] bg-[--bg-card] p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold text-[--text-primary]">Activity feed</h2>
            <span className="rounded-full bg-[--accent-soft] px-2 py-0.5 text-xs text-[--accent]">Live-ready</span>
          </div>
          <div className="space-y-3">
            {workspace.activity.length === 0 ? (
              <p className="text-sm text-[--text-tertiary]">No workspace activity yet.</p>
            ) : (
              workspace.activity.map((item) => (
                <div key={`${item.type}-${item.id}`} className="rounded-lg border border-[--border] bg-[--bg-app] p-3">
                  <p className="text-sm text-[--text-primary]">{item.label}</p>
                  <p className="mt-1 text-xs text-[--text-tertiary]">{timeAgo(item.at)}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </aside>
    </div>
  );
}

function ReportsTab({ workspace }: { workspace: WorkspaceDashboard | null }) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-[--text-primary]">Reports</h1>
        <p className="mt-1 text-sm text-[--text-secondary]">Pre-built workforce reports with filters, exports, scheduling, and Atlas insights.</p>
      </div>
      {!workspace ? (
        <div className="rounded-xl border border-dashed border-[--border] p-8 text-center">
          <p className="text-sm text-[--text-secondary]">Create a workspace to unlock operational reports.</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {REPORTS.map((report) => (
            <Link key={report.slug} href={`/workspace/reports/${report.slug}`} className="rounded-xl border border-[--border] bg-[--bg-card] p-5 transition-colors hover:border-[--accent]">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-[--accent-soft] text-[--accent]">
                <BarChart3 size={18} />
              </div>
              <h2 className="font-semibold text-[--text-primary]">{report.label}</h2>
              <p className="mt-1 text-sm leading-6 text-[--text-secondary]">{report.description}</p>
              <span className="mt-4 flex items-center gap-1 text-sm font-medium text-[--accent]">
                Open report <ArrowRight size={13} />
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function ForYouTab({ profile, recentDocs, savedItems }: Pick<Props, "profile" | "recentDocs" | "savedItems">) {
  const { open: openCopilot } = useCopilot();
  const firstName = profile?.full_name?.split(" ")[0] ?? null;
  const greeting = `${timeGreeting()}${firstName ? `, ${firstName}` : ""}`;

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[--text-primary]">{greeting}</h1>
          <p className="mt-1 text-[--text-secondary]">Here&apos;s your HR brief for today.</p>
        </div>
        <button type="button" onClick={openCopilot} className="flex shrink-0 items-center gap-2 rounded-xl bg-[--accent] px-4 py-2.5 text-sm font-semibold text-[--primary-foreground] hover:bg-[--accent-hover] transition-colors">
          <Sparkles size={15} />
          Ask Atlas
        </button>
      </div>

      {profile?.country && (
        <div className="flex items-center gap-4 rounded-xl border border-[--border] bg-[--bg-card] p-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[--accent-soft]">
            <Globe size={18} className="text-[--accent]" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-[--text-primary]">Latest in HR for {profile.country}</p>
            <p className="mt-0.5 text-xs text-[--text-tertiary]">Country-specific articles, laws and updates tailored to your region.</p>
          </div>
          <Link href={`/knowledge?country=${encodeURIComponent(profile.country)}`} className="flex shrink-0 items-center gap-1 text-xs font-medium text-[--accent] hover:underline">
            Explore <ArrowRight size={11} />
          </Link>
        </div>
      )}

      <div>
        <h2 className="mb-4 text-lg font-semibold text-[--text-primary]">Today&apos;s HR brief</h2>
        <div className="grid gap-3 sm:grid-cols-3">
          {BRIEFS.map((brief) => (
            <div key={brief.title} className={`rounded-xl border p-4 ${brief.type === "warning" ? "border-[--warning]/30 bg-orange-50 dark:bg-orange-950/20" : "border-[--border] bg-[--bg-card]"}`}>
              <p className="text-sm font-medium leading-snug text-[--text-primary]">{brief.title}</p>
              <Link href={brief.href} className="mt-3 flex items-center gap-1 text-xs font-medium text-[--accent] hover:underline">
                {brief.action} <ArrowRight size={11} />
              </Link>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h2 className="mb-4 text-lg font-semibold text-[--text-primary]">Quick actions</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {QUICK_ACTIONS.map((action) => (
            <Link key={action.label} href={action.href} className="group flex flex-col items-center gap-2 rounded-xl border border-[--border] bg-[--bg-card] p-4 text-center transition-all hover:border-[--accent] hover:shadow-md">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[--accent-soft] transition-colors group-hover:bg-[--accent]">
                <action.icon size={18} className="text-[--accent] transition-colors group-hover:text-[--primary-foreground]" />
              </div>
              <span className="text-xs font-medium text-[--text-secondary] group-hover:text-[--text-primary]">{action.label}</span>
            </Link>
          ))}
        </div>
      </div>

      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-[--text-primary]">Recent documents</h2>
          <Link href="/dashboard/documents" className="text-sm text-[--accent] hover:underline">View all</Link>
        </div>
        <div className="space-y-2">
          {recentDocs.length === 0 ? (
            <div className="rounded-xl border border-dashed border-[--border] p-6 text-center">
              <p className="text-sm text-[--text-tertiary]">
                No documents yet. <Link href="/tools" className="text-[--accent] hover:underline">Generate your first one</Link>.
              </p>
            </div>
          ) : (
            recentDocs.map((doc) => (
              <Link key={doc.id} href={`/dashboard/documents/${doc.id}`} className="flex items-center gap-4 rounded-xl border border-[--border] bg-[--bg-card] p-4 transition-colors hover:border-[--accent]">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[--accent-soft]">
                  <FileText size={16} className="text-[--accent]" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-[--text-primary]">{doc.title ?? "Untitled Document"}</p>
                  <p className="text-xs text-[--text-tertiary]">{doc.tool_name}</p>
                </div>
                <div className="flex shrink-0 items-center gap-1 text-xs text-[--text-tertiary]">
                  <Clock size={11} />
                  {timeAgo(doc.created_at)}
                </div>
              </Link>
            ))
          )}
        </div>
      </div>

      {savedItems.length > 0 && (
        <div>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-[--text-primary]">Saved items</h2>
            <Link href="/dashboard/library" className="text-sm text-[--accent] hover:underline">View library</Link>
          </div>
          <div className="space-y-2">
            {savedItems.map((item) => {
              const Icon = ITEM_TYPE_ICONS[item.item_type] ?? Bookmark;
              return (
                <Link key={item.id} href={savedItemHref(item)} className="flex items-center gap-4 rounded-xl border border-[--border] bg-[--bg-card] p-4 transition-colors hover:border-[--accent]">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[--accent-soft]">
                    <Icon size={16} className="text-[--accent]" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium capitalize text-[--text-primary]">{savedItemLabel(item)}</p>
                    <p className="text-xs capitalize text-[--text-tertiary]">{item.item_type}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-1 text-xs text-[--text-tertiary]">
                    <Clock size={11} />
                    {timeAgo(item.saved_at)}
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export function DashboardClient({ profile, recentDocs, savedItems, workspace }: Props) {
  const [activeTab, setActiveTab] = useState<DashboardTab>(workspace?.defaultTab ?? "for-you");
  const tabs: { key: DashboardTab; label: string; disabled?: boolean }[] = [
    { key: "workspace", label: "Workspace", disabled: !workspace },
    { key: "for-you", label: "For you" },
    { key: "reports", label: "Reports", disabled: !workspace },
  ];

  return (
    <div className="space-y-6">
      <div className="flex w-fit gap-1 rounded-xl border border-[--border] bg-[--bg-card] p-1">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            disabled={tab.disabled}
            onClick={() => setActiveTab(tab.key)}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
              activeTab === tab.key ? "bg-[--accent] text-[--primary-foreground]" : "text-[--text-secondary] hover:bg-[--bg-hover]"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "workspace" && workspace ? <WorkspaceTab workspace={workspace} /> : null}
      {activeTab === "for-you" ? <ForYouTab profile={profile} recentDocs={recentDocs} savedItems={savedItems} /> : null}
      {activeTab === "reports" ? <ReportsTab workspace={workspace} /> : null}
    </div>
  );
}
