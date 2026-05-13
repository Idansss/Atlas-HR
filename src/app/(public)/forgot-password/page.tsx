"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { Loader2, Mail, ArrowLeft } from "lucide-react";
import { sendPasswordResetEmail } from "@/app/(auth)/actions";
import { Input } from "@/components/ui/input";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await sendPasswordResetEmail({ email });
      if (!result.ok) {
        setError(result.error);
      } else {
        setSent(true);
      }
    });
  }

  return (
    <div className="flex min-h-[calc(100vh-128px)] items-center justify-center py-12">
      <div className="w-full max-w-sm px-4">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-[--accent] text-[--primary-foreground] font-bold">
            A
          </div>
          <h1 className="text-2xl font-bold text-[--text-primary]">Reset your password</h1>
          <p className="mt-1 text-sm text-[--text-secondary]">
            Enter your email and we&apos;ll send a reset link.
          </p>
        </div>

        {sent ? (
          <div className="rounded-xl border border-[--border] bg-[--bg-card] p-6 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[--accent-soft]">
              <Mail size={22} className="text-[--accent]" />
            </div>
            <p className="font-medium text-[--text-primary]">Check your email</p>
            <p className="mt-1 text-sm text-[--text-secondary]">
              We sent a password reset link to <strong>{email}</strong>.
            </p>
            <button
              type="button"
              onClick={() => { setSent(false); setEmail(""); }}
              className="mt-4 text-sm text-[--accent] hover:underline"
            >
              Resend email
            </button>
          </div>
        ) : (
          <>
            {error && (
              <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-400">
                {error}
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-[--text-primary]">
                  Email address
                </label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  placeholder="you@company.com"
                  className="w-full rounded-xl bg-[--bg-input] px-3 py-2.5 text-sm text-[--text-primary] transition-colors placeholder:text-[--text-tertiary]"
                />
              </div>
              <button
                type="submit"
                disabled={isPending}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-[--accent] py-3 text-sm font-semibold text-[--primary-foreground] hover:bg-[--accent-hover] disabled:opacity-60 transition-colors"
              >
                {isPending && <Loader2 size={15} className="animate-spin" />}
                Send reset link
              </button>
            </form>
          </>
        )}

        <Link
          href="/sign-in"
          className="mt-6 flex items-center justify-center gap-1.5 text-sm text-[--text-secondary] hover:text-[--text-primary] transition-colors"
        >
          <ArrowLeft size={14} />
          Back to sign in
        </Link>
      </div>
    </div>
  );
}