import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { createClient } from "@/lib/supabase/server";
import { COMMUNITY_CATEGORIES } from "@/lib/constants";
import { createThread } from "@/lib/actions/community";

export const metadata: Metadata = { title: "Ask a question" };

export default async function NewThreadPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/sign-in?next=/community/new");

  return (
    <div className="min-h-screen bg-[--bg-app] py-12">
      <div className="mx-auto max-w-[760px] px-4 sm:px-6 lg:px-8">
        <Link
          href="/community"
          className="mb-6 inline-flex items-center gap-2 text-sm text-[--text-tertiary] hover:text-[--accent] transition-colors"
        >
          <ArrowLeft size={14} />
          Community
        </Link>

        <h1 className="mb-2 text-3xl font-bold text-[--text-primary]">Ask a question</h1>
        <p className="mb-8 text-[--text-secondary]">
          Get expert answers from HR professionals across the globe.
        </p>

        <form action={createThread} className="space-y-5">
          {/* Title */}
          <div>
            <label
              htmlFor="title"
              className="mb-1.5 block text-sm font-medium text-[--text-primary]"
            >
              Question title <span className="text-[--danger]">*</span>
            </label>
            <Input
              id="title"
              name="title"
              type="text"
              required
              maxLength={200}
              placeholder="e.g. How do you handle salary negotiation when a candidate asks for 40% above budget?"
              className="w-full rounded-lg bg-[--bg-input] px-3 py-2 text-sm text-[--text-primary] placeholder:text-[--text-tertiary]"
            />
          </div>

          {/* Category */}
          <div>
            <label
              htmlFor="category"
              className="mb-1.5 block text-sm font-medium text-[--text-primary]"
            >
              Category <span className="text-[--danger]">*</span>
            </label>
            <Select name="category" defaultValue={COMMUNITY_CATEGORIES[0]} items={COMMUNITY_CATEGORIES.map((value) => ({ value, label: value }))}>
              <SelectTrigger id="category">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
              {COMMUNITY_CATEGORIES.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))}
              </SelectContent>
            </Select>
          </div>

          {/* Body */}
          <div>
            <label
              htmlFor="body"
              className="mb-1.5 block text-sm font-medium text-[--text-primary]"
            >
              Details <span className="text-[--danger]">*</span>
            </label>
            <textarea
              id="body"
              name="body"
              required
              rows={8}
              placeholder="Provide as much context as you can — the more specific you are, the better the answers you'll get."
              className="w-full resize-y rounded-lg border border-[--border] bg-[--bg-input] px-3 py-2 text-sm text-[--text-primary] outline-none focus:border-[--accent] focus:ring-1 focus:ring-[--accent] placeholder:text-[--text-tertiary]"
            />
          </div>

          {/* Anonymous */}
          <label className="flex cursor-pointer items-center gap-2.5 text-sm text-[--text-secondary]">
            <Checkbox name="is_anonymous" aria-label="Post anonymously" className="accent-[--accent]" />
            Post anonymously — your name won&apos;t be shown
          </label>

          {/* Submit */}
          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              className="rounded-xl bg-[--accent] px-6 py-2.5 text-sm font-semibold text-[--primary-foreground] hover:bg-[--accent-hover] transition-colors"
            >
              Post question
            </button>
            <Link
              href="/community"
              className="rounded-xl border border-[--border] px-6 py-2.5 text-sm font-medium text-[--text-secondary] hover:bg-[--bg-hover] transition-colors"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
