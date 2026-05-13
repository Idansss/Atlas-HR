"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState, useTransition, Suspense } from "react";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { signInWithPassword, signInWithOAuth } from "@/app/(auth)/actions";

function SignInForm() {
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") ?? "/dashboard";
  const urlError = searchParams.get("error");

  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(
    urlError === "auth_callback_failed" ? "Authentication failed. Please try again." : null
  );
  const [isPending, startTransition] = useTransition();
  const [oauthPending, setOauthPending] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await signInWithPassword({ email, password, redirectTo });
      if (result && !result.ok) setError(result.error);
    });
  }

  async function handleOAuth(provider: "google" | "linkedin_oidc") {
    setError(null);
    setOauthPending(provider);
    const result = await signInWithOAuth({ provider });
    if (result && !result.ok) {
      setError(result.error);
      setOauthPending(null);
    }
  }

  return (
    <>
      {error && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-400">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-[--text-primary]">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            placeholder="you@company.com"
            className="w-full rounded-xl border border-[--border] bg-[--bg-input] px-3 py-2.5 text-sm text-[--text-primary] outline-none focus:border-[--accent] focus:ring-1 focus:ring-[--accent] placeholder:text-[--text-tertiary] transition-colors"
          />
        </div>
        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <label htmlFor="password" className="text-sm font-medium text-[--text-primary]">Password</label>
            <Link href="/forgot-password" className="text-xs text-[--accent] hover:underline">
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              placeholder="••••••••"
              className="w-full rounded-xl border border-[--border] bg-[--bg-input] px-3 py-2.5 pr-10 text-sm text-[--text-primary] outline-none focus:border-[--accent] focus:ring-1 focus:ring-[--accent] placeholder:text-[--text-tertiary] transition-colors"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[--text-tertiary] hover:text-[--text-primary]"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="w-full flex items-center justify-center gap-2 rounded-xl bg-[--accent] py-3 text-sm font-semibold text-white hover:bg-[--accent-hover] disabled:opacity-60 transition-colors"
        >
          {isPending && <Loader2 size={15} className="animate-spin" />}
          Sign in
        </button>
      </form>

      <div className="my-6 flex items-center gap-3">
        <div className="h-px flex-1 bg-[--border]" />
        <span className="text-xs text-[--text-tertiary]">or continue with</span>
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
            Continue with {label}
          </button>
        ))}
      </div>

      <p className="mt-6 text-center text-sm text-[--text-secondary]">
        Don&apos;t have an account?{" "}
        <Link href="/sign-up" className="font-medium text-[--accent] hover:underline">
          Sign up free
        </Link>
      </p>
    </>
  );
}

export default function SignInPage() {
  return (
    <div className="flex justify-center px-4 py-8 sm:py-10">
      <div className="w-full max-w-sm px-4">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-[--accent] text-white font-bold">
            A
          </div>
          <h1 className="text-2xl font-bold text-[--text-primary]">Welcome back</h1>
          <p className="mt-1 text-sm text-[--text-secondary]">Sign in to your Atlas HR account</p>
        </div>

        <Suspense fallback={<div className="h-64 animate-pulse rounded-xl bg-[--bg-hover]" />}>
          <SignInForm />
        </Suspense>
      </div>
    </div>
  );
}
