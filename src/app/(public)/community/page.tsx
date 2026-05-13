import type { Metadata } from "next";
import Link from "next/link";
import { MessageSquare, TrendingUp, Users, Star, ArrowRight, Flame } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { COMMUNITY_CATEGORIES } from "@/lib/constants";

export const metadata: Metadata = {
  title: "HR Community",
  description:
    "Connect with HR professionals worldwide. Ask questions, share experiences, and learn from peers across every industry and country.",
};

type Sort = "new" | "hot" | "top";

interface Props {
  searchParams: Promise<{ category?: string; sort?: string; page?: string }>;
}

const PAGE_SIZE = 20;

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "Yesterday";
  return `${days}d ago`;
}

export default async function CommunityPage({ searchParams }: Props) {
  const { category, sort: rawSort, page: pageParam } = await searchParams;
  const sort: Sort = rawSort === "hot" || rawSort === "top" ? rawSort : "new";
  const page = Math.max(1, parseInt(pageParam ?? "1", 10));
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const supabase = await createClient();

  // Fetch threads
  let query = supabase
    .from("community_threads")
    .select("id, title, category, author_id, is_anonymous, vote_count, reply_count, created_at, last_reply_at", {
      count: "exact",
    })
    .range(from, to);

  if (category) query = query.eq("category", category);

  if (sort === "top") {
    query = query.order("vote_count", { ascending: false });
  } else if (sort === "hot") {
    query = query.order("last_reply_at", { ascending: false, nullsFirst: false });
  } else {
    query = query.order("created_at", { ascending: false });
  }

  const { data: threads, count } = await query;

  // Batch-fetch profiles for non-anonymous authors
  const authorIds = [
    ...new Set(
      (threads ?? []).filter((t) => !t.is_anonymous).map((t) => t.author_id)
    ),
  ];
  const { data: profiles } = authorIds.length
    ? await supabase
        .from("profiles")
        .select("id, full_name")
        .in("id", authorIds)
    : { data: [] };

  const profileMap = new Map((profiles ?? []).map((p) => [p.id, p.full_name]));

  const totalPages = Math.ceil((count ?? 0) / PAGE_SIZE);

  function buildHref(updates: { category?: string; sort?: string; page?: string }) {
    const params = new URLSearchParams();
    const cat = "category" in updates ? updates.category : category;
    const s = "sort" in updates ? updates.sort : sort;
    const p = updates.page ?? "1";
    if (cat) params.set("category", cat);
    if (s && s !== "new") params.set("sort", s);
    if (p !== "1") params.set("page", p);
    const qs = params.toString();
    return `/community${qs ? `?${qs}` : ""}`;
  }

  return (
    <div className="min-h-screen bg-[--bg-app] py-12">
      <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[1fr_280px]">
          {/* Main */}
          <div>
            <div className="mb-8 flex items-start justify-between gap-4">
              <div>
                <h1 className="text-4xl font-bold text-[--text-primary]">Community</h1>
                <p className="mt-2 text-[--text-secondary]">
                  Real HR questions. Verified professionals. Honest answers.
                </p>
              </div>
              <Link
                href="/community/new"
                className="flex shrink-0 items-center gap-2 rounded-xl bg-[--accent] px-4 py-2.5 text-sm font-semibold text-[--primary-foreground] hover:bg-[--accent-hover] transition-colors"
              >
                <MessageSquare size={15} />
                Ask a question
              </Link>
            </div>

            {/* Category filter */}
            <div className="mb-4 flex flex-wrap gap-2">
              <Link
                href={buildHref({ category: undefined, page: "1" })}
                className={`rounded-lg border px-3 py-1.5 text-sm transition-colors ${
                  !category
                    ? "border-[--accent] bg-[--accent] text-[--primary-foreground]"
                    : "border-[--border] text-[--text-secondary] hover:bg-[--accent] hover:text-[--primary-foreground] hover:border-[--accent]"
                }`}
              >
                All
              </Link>
              {COMMUNITY_CATEGORIES.map((cat) => (
                <Link
                  key={cat}
                  href={buildHref({ category: cat, page: "1" })}
                  className={`rounded-lg border px-3 py-1.5 text-sm transition-colors ${
                    category === cat
                      ? "border-[--accent] bg-[--accent] text-[--primary-foreground]"
                      : "border-[--border] text-[--text-secondary] hover:bg-[--accent] hover:text-[--primary-foreground] hover:border-[--accent]"
                  }`}
                >
                  {cat}
                </Link>
              ))}
            </div>

            {/* Sort tabs */}
            <div className="mb-6 flex gap-1 rounded-xl border border-[--border] bg-[--bg-card] p-1 w-fit">
              {(["new", "hot", "top"] as Sort[]).map((s) => (
                <Link
                  key={s}
                  href={buildHref({ sort: s, page: "1" })}
                  className={`flex items-center gap-1.5 rounded-lg px-4 py-1.5 text-sm font-medium transition-colors capitalize ${
                    sort === s
                      ? "bg-[--accent] text-[--primary-foreground]"
                      : "text-[--text-secondary] hover:bg-[--bg-hover]"
                  }`}
                >
                  {s === "hot" && <Flame size={13} />}
                  {s === "top" && <TrendingUp size={13} />}
                  {s}
                </Link>
              ))}
            </div>

            {/* Thread list */}
            {!threads || threads.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-3 py-20 text-center rounded-2xl border border-dashed border-[--border]">
                <MessageSquare size={32} className="text-[--text-tertiary]" />
                <p className="font-semibold text-[--text-primary]">No threads yet</p>
                <p className="text-sm text-[--text-tertiary]">
                  Be the first to ask a question in this category.
                </p>
                <Link
                  href="/community/new"
                  className="mt-2 rounded-xl bg-[--accent] px-4 py-2 text-sm font-semibold text-[--primary-foreground] hover:bg-[--accent-hover] transition-colors"
                >
                  Ask a question
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {threads.map((thread) => {
                  const authorName = thread.is_anonymous
                    ? "Anonymous"
                    : (profileMap.get(thread.author_id) ?? "HR Professional");
                  const isHot =
                    thread.reply_count > 5 ||
                    thread.vote_count > 10;

                  return (
                    <Link
                      key={thread.id}
                      href={`/community/thread/${thread.id}`}
                      className="group block rounded-2xl border border-[--border] bg-[--bg-card] p-5 hover:border-[--accent] hover:shadow-md transition-all"
                    >
                      <div className="flex items-start gap-4">
                        {/* Vote count */}
                        <div className="flex flex-col items-center gap-1 shrink-0">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[--accent-soft] text-sm font-bold text-[--accent]">
                            {thread.vote_count}
                          </div>
                          <span className="text-[10px] text-[--text-tertiary]">votes</span>
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="mb-1 flex items-center gap-2">
                            <span className="rounded-full border border-[--border] px-2 py-0.5 text-xs text-[--text-tertiary]">
                              {thread.category}
                            </span>
                            {isHot && (
                              <span className="flex items-center gap-0.5 text-xs text-[--warning]">
                                <Flame size={11} /> Hot
                              </span>
                            )}
                          </div>
                          <h3 className="font-semibold text-[--text-primary] group-hover:text-[--accent] transition-colors leading-tight">
                            {thread.title}
                          </h3>
                          <div className="mt-2 flex items-center gap-4 text-xs text-[--text-tertiary]">
                            <span>by {authorName}</span>
                            <span className="flex items-center gap-1">
                              <MessageSquare size={11} />
                              {thread.reply_count} repl{thread.reply_count === 1 ? "y" : "ies"}
                            </span>
                            <span>{timeAgo(thread.created_at)}</span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-6 flex items-center justify-center gap-2">
                {page > 1 && (
                  <Link
                    href={buildHref({ page: String(page - 1) })}
                    className="rounded-lg border border-[--border] px-3 py-1.5 text-xs font-medium text-[--text-secondary] hover:bg-[--bg-hover] transition-colors"
                  >
                    Previous
                  </Link>
                )}
                <span className="text-xs text-[--text-tertiary]">
                  Page {page} of {totalPages}
                </span>
                {page < totalPages && (
                  <Link
                    href={buildHref({ page: String(page + 1) })}
                    className="rounded-lg border border-[--border] px-3 py-1.5 text-xs font-medium text-[--text-secondary] hover:bg-[--bg-hover] transition-colors"
                  >
                    Next
                  </Link>
                )}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-5">
            {/* Stats */}
            <div className="rounded-2xl border border-[--border] bg-[--bg-card] p-5">
              <h3 className="mb-4 font-semibold text-[--text-primary]">Community stats</h3>
              <div className="space-y-3">
                {[
                  { label: "Members", value: "12,400+", icon: Users },
                  { label: "Threads", value: `${count ?? 0}`, icon: MessageSquare },
                  { label: "Countries", value: "50+", icon: Star },
                ].map((stat) => (
                  <div key={stat.label} className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-[--text-secondary]">
                      <stat.icon size={14} className="text-[--accent]" />
                      {stat.label}
                    </div>
                    <span className="text-sm font-semibold text-[--text-primary]">
                      {stat.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Mentorship CTA */}
            <div className="rounded-2xl border border-[--accent] bg-[--accent-soft] p-5">
              <h3 className="mb-2 text-sm font-semibold text-[--text-primary]">Find an HR mentor</h3>
              <p className="mb-3 text-xs text-[--text-secondary]">
                Get matched with an experienced HR professional for a 3-month mentorship.
              </p>
              <Link
                href="/community/mentorship"
                className="flex items-center gap-1 text-xs font-medium text-[--accent] hover:underline"
              >
                Learn more <ArrowRight size={12} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}