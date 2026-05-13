"use client";

import { useState, useEffect, useTransition } from "react";
import { Loader2, Eye, EyeOff } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { resetPassword } from "@/app/(auth)/actions";
import { Input } from "@/components/ui/input";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sessionReady, setSessionReady] = useState(false);
  const [isPending, startTransition] = useTransition();

  // Exchange the code/token from the URL for a session
  useEffect(() => {
    const supabase = createClient();

    // onAuthStateChange fires with SIGNED_IN when the recovery token is processed
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") setSessionReady(true);
    });

    // Also handle code-based flow (from callback redirect)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setSessionReady(true);
    });

    return () => subscription.unsubscribe();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    setError(null);
    startTransition(async () => {
      const result = await resetPassword({ password });
      if (result && !result.ok) setError(result.error);
    });
  }

  if (!sessionReady) {
    return (
      <div className="flex min-h-[calc(100vh-128px)] items-center justify-center">
        <div className="text-center">
          <Loader2 size={28} className="mx-auto mb-3 animate-spin text-[--accent]" />
          <p className="text-sm text-[--text-secondary]">Verifying reset link…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[calc(100vh-128px)] items-center justify-center py-12">
      <div className="w-full max-w-sm px-4">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-[--accent] text-white font-bold">
            A
          </div>
          <h1 className="text-2xl font-bold text-[--text-primary]">Set new password</h1>
          <p className="mt-1 text-sm text-[--text-secondary]">Choose a strong password for your account.</p>
        </div>

        {error && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-400">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-[--text-primary]">
              New password
            </label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                autoComplete="new-password"
                placeholder="8+ characters"
                className="w-full rounded-xl bg-[--bg-input] px-3 py-2.5 pr-10 text-sm text-[--text-primary] transition-colors placeholder:text-[--text-tertiary]"
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
          <div>
            <label htmlFor="confirm" className="mb-1.5 block text-sm font-medium text-[--text-primary]">
              Confirm password
            </label>
            <Input
              id="confirm"
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
              autoComplete="new-password"
              placeholder="Repeat password"
              className="w-full rounded-xl bg-[--bg-input] px-3 py-2.5 text-sm text-[--text-primary] transition-colors placeholder:text-[--text-tertiary]"
            />
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-[--accent] py-3 text-sm font-semibold text-white hover:bg-[--accent-hover] disabled:opacity-60 transition-colors"
          >
            {isPending && <Loader2 size={15} className="animate-spin" />}
            Update password
          </button>
        </form>
      </div>
    </div>
  );
}
