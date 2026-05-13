"use client";

import { useState, useTransition, useRef, useEffect } from "react";
import Link from "next/link";
import { Check, Flag, MessageSquare, Sparkles, ThumbsUp } from "lucide-react";
import { voteOnTarget, createReply, acceptAnswer } from "@/lib/actions/community";
import { useCopilot } from "@/stores/copilot-store";
import { track } from "@/lib/analytics/track";
import type { Database } from "@/types/database";

type Thread = Database["public"]["Tables"]["community_threads"]["Row"] & {
  authorName: string;
  authorRole: string | null;
};

type Reply = Database["public"]["Tables"]["community_replies"]["Row"] & {
  authorName: string;
  authorRole: string | null;
};

interface Props {
  thread: Thread;
  replies: Reply[];
  currentUserId: string | null;
  userVotes: string[];
}

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

function VoteButton({
  targetType,
  targetId,
  initialCount,
  initialVoted,
  disabled,
}: {
  targetType: "thread" | "reply";
  targetId: string;
  initialCount: number;
  initialVoted: boolean;
  disabled: boolean;
}) {
  const [count, setCount] = useState(initialCount);
  const [voted, setVoted] = useState(initialVoted);
  const [isPending, startTransition] = useTransition();

  const handleVote = () => {
    if (disabled) return;
    const optimisticVoted = !voted;
    const optimisticCount = optimisticVoted ? count + 1 : count - 1;
    setVoted(optimisticVoted);
    setCount(optimisticCount);

    startTransition(async () => {
      const result = await voteOnTarget(targetType, targetId);
      if (!result.error) {
        setVoted(result.user_voted);
        setCount(result.vote_count);
        track("community_voted", { target_type: targetType, target_id: targetId, voted: result.user_voted });
      } else {
        // Revert optimistic update
        setVoted(voted);
        setCount(count);
      }
    });
  };

  return (
    <button
      type="button"
      onClick={handleVote}
      disabled={isPending || disabled}
      title={disabled ? "Sign in to vote" : voted ? "Remove vote" : "Upvote"}
      className={`flex items-center gap-1 text-xs transition-colors disabled:opacity-50 ${
        voted
          ? "text-[--accent] font-semibold"
          : "text-[--text-tertiary] hover:text-[--accent]"
      }`}
    >
      <ThumbsUp size={12} className={voted ? "fill-[--accent]" : ""} />
      {count} helpful
    </button>
  );
}

function ReplyForm({
  threadId,
  isAuthenticated,
}: {
  threadId: string;
  isAuthenticated: boolean;
}) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const handleSubmit = (formData: FormData) => {
    setError(null);
    startTransition(async () => {
      const result = await createReply(threadId, formData);
      if (result.error === "empty_body") {
        setError("Please write something before posting.");
      } else if (result.error) {
        setError("Failed to post reply. Please try again.");
      } else {
        formRef.current?.reset();
        track("community_reply_created", { thread_id: threadId });
      }
    });
  };

  if (!isAuthenticated) {
    return (
      <div className="rounded-2xl border border-[--border] bg-[--bg-card] p-5 text-center">
        <p className="text-sm text-[--text-secondary]">
          <Link href="/sign-in" className="text-[--accent] hover:underline">
            Sign in
          </Link>{" "}
          to add your answer.
        </p>
      </div>
    );
  }

  return (
    <form ref={formRef} action={handleSubmit} className="rounded-2xl border border-[--border] bg-[--bg-card] p-5">
      <h3 className="mb-4 font-semibold text-[--text-primary]">Add your answer</h3>
      <textarea
        name="body"
        rows={5}
        placeholder="Share your experience or advice..."
        className="w-full resize-none rounded-lg border border-[--border] bg-[--bg-input] px-3 py-2 text-sm text-[--text-primary] outline-none focus:border-[--accent] focus:ring-1 focus:ring-[--accent] placeholder:text-[--text-tertiary]"
      />
      {error && <p className="mt-1 text-xs text-[--danger]">{error}</p>}
      <div className="mt-3 flex items-center justify-between gap-3">
        <label className="flex cursor-pointer items-center gap-2 text-sm text-[--text-secondary]">
          <input
            type="checkbox"
            name="is_anonymous"
            className="accent-[--accent]"
          />
          Post anonymously
        </label>
        <button
          type="submit"
          disabled={isPending}
          className="flex items-center gap-2 rounded-xl bg-[--accent] px-5 py-2.5 text-sm font-semibold text-[--primary-foreground] hover:bg-[--accent-hover] disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
        >
          <MessageSquare size={15} />
          {isPending ? "Posting…" : "Post reply"}
        </button>
      </div>
    </form>
  );
}

function AcceptButton({
  replyId,
  threadId,
  isAccepted,
  isThreadAuthor,
}: {
  replyId: string;
  threadId: string;
  isAccepted: boolean;
  isThreadAuthor: boolean;
}) {
  const [accepted, setAccepted] = useState(isAccepted);
  const [isPending, startTransition] = useTransition();

  if (!isThreadAuthor && !accepted) return null;

  const handleAccept = () => {
    if (!isThreadAuthor) return;
    startTransition(async () => {
      const result = await acceptAnswer(replyId, threadId);
      if (!result.error) setAccepted(true);
    });
  };

  return (
    <button
      type="button"
      onClick={handleAccept}
      disabled={isPending || !isThreadAuthor}
      title={isThreadAuthor ? "Mark as accepted answer" : "Accepted answer"}
      className={`flex items-center gap-1 text-xs font-semibold transition-colors ${
        accepted
          ? "text-[--success]"
          : "text-[--text-tertiary] hover:text-[--success]"
      } disabled:opacity-60`}
    >
      <Check size={13} />
      {accepted ? "Accepted answer" : "Mark as answer"}
    </button>
  );
}

export function ThreadClient({ thread, replies, currentUserId, userVotes }: Props) {
  const { open: openCopilot, startNew, addMessage } = useCopilot();
  const isAuthenticated = Boolean(currentUserId);
  const isThreadAuthor = currentUserId === thread.author_id;
  const votedSet = new Set(userVotes);

  useEffect(() => {
    track("community_thread_viewed", { thread_id: thread.id, category: thread.category ?? "general" });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAskCopilot = () => {
    startNew();
    addMessage({
      role: "user",
      content: `I need help with this HR question: "${thread.title}"\n\nContext:\n${thread.body.slice(0, 500)}`,
    });
    openCopilot();
  };

  return (
    <div className="grid gap-10 lg:grid-cols-[1fr_280px]">
      <div>
        {/* Thread */}
        <article className="mb-6 rounded-2xl border border-[--border] bg-[--bg-card] p-6">
          <div className="mb-4">
            <span className="rounded-full border border-[--border] px-2 py-0.5 text-xs text-[--text-tertiary]">
              {thread.category}
            </span>
          </div>
          <h1 className="mb-4 text-2xl font-bold text-[--text-primary]">{thread.title}</h1>
          <pre className="mb-4 whitespace-pre-wrap font-sans text-sm leading-relaxed text-[--text-secondary]">
            {thread.body}
          </pre>
          <div className="flex flex-wrap items-center gap-4 border-t border-[--border] pt-4 text-xs text-[--text-tertiary]">
            <div className="flex items-center gap-1.5">
              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[--accent] text-[--primary-foreground] text-[10px] font-semibold">
                {thread.authorName[0]}
              </div>
              <span>{thread.authorName}</span>
              {thread.authorRole && (
                <span className="text-[--text-tertiary]">· {thread.authorRole}</span>
              )}
            </div>
            <span>{timeAgo(thread.created_at)}</span>
            <VoteButton
              targetType="thread"
              targetId={thread.id}
              initialCount={thread.vote_count}
              initialVoted={votedSet.has(thread.id)}
              disabled={!isAuthenticated}
            />
            <button
              type="button"
              className="flex items-center gap-1 hover:text-[--danger] transition-colors"
            >
              <Flag size={12} /> Report
            </button>
          </div>
        </article>

        {/* Replies */}
        {replies.length > 0 && (
          <>
            <h2 className="mb-4 text-lg font-bold text-[--text-primary]">
              {replies.length} repl{replies.length === 1 ? "y" : "ies"}
            </h2>
            <div className="mb-8 space-y-4">
              {replies.map((reply) => (
                <div
                  key={reply.id}
                  className={`rounded-2xl border p-5 ${
                    reply.is_accepted_answer
                      ? "border-[--success] bg-[--bg-card]"
                      : "border-[--border] bg-[--bg-card]"
                  }`}
                >
                  {reply.is_accepted_answer && (
                    <div className="mb-3 flex items-center gap-1.5 text-xs font-semibold text-[--success]">
                      <Check size={13} />
                      Accepted answer
                    </div>
                  )}
                  <div className="mb-3 flex items-center gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[--accent] text-[10px] font-semibold text-[--primary-foreground]">
                      {reply.authorName[0]}
                    </div>
                    <div>
                      <span className="text-sm font-medium text-[--text-primary]">
                        {reply.authorName}
                      </span>
                      {reply.authorRole && (
                        <span className="ml-2 text-xs text-[--text-tertiary]">
                          {reply.authorRole}
                        </span>
                      )}
                    </div>
                    <span className="ml-auto text-xs text-[--text-tertiary]">
                      {timeAgo(reply.created_at)}
                    </span>
                  </div>
                  <pre className="mb-3 whitespace-pre-wrap font-sans text-sm leading-relaxed text-[--text-secondary]">
                    {reply.body}
                  </pre>
                  <div className="flex items-center gap-4">
                    <VoteButton
                      targetType="reply"
                      targetId={reply.id}
                      initialCount={reply.vote_count}
                      initialVoted={votedSet.has(reply.id)}
                      disabled={!isAuthenticated}
                    />
                    <AcceptButton
                      replyId={reply.id}
                      threadId={thread.id}
                      isAccepted={reply.is_accepted_answer}
                      isThreadAuthor={isThreadAuthor}
                    />
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Reply form */}
        <ReplyForm threadId={thread.id} isAuthenticated={isAuthenticated} />
      </div>

      {/* Sidebar */}
      <div className="space-y-4">
        {/* Ask Copilot */}
        <div className="rounded-2xl border border-[--border] bg-[--bg-card] p-5">
          <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-[--accent-soft]">
            <Sparkles size={16} className="text-[--accent]" />
          </div>
          <h3 className="mb-2 text-sm font-semibold text-[--text-primary]">Ask Atlas Copilot</h3>
          <p className="mb-3 text-xs text-[--text-secondary]">
            Get an instant, expert-backed answer to this question from Atlas.
          </p>
          <button
            type="button"
            onClick={handleAskCopilot}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-[--accent-soft] py-2 text-xs font-medium text-[--accent] hover:bg-[--accent] hover:text-[--primary-foreground] transition-colors"
          >
            <Sparkles size={12} />
            Ask Atlas about this
          </button>
        </div>

        {/* Thread stats */}
        <div className="rounded-2xl border border-[--border] bg-[--bg-card] p-5">
          <h3 className="mb-3 text-sm font-semibold text-[--text-primary]">Thread stats</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-[--text-tertiary]">Views</span>
              <span className="font-medium text-[--text-primary]">{thread.view_count}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[--text-tertiary]">Votes</span>
              <span className="font-medium text-[--text-primary]">{thread.vote_count}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[--text-tertiary]">Replies</span>
              <span className="font-medium text-[--text-primary]">{replies.length}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}