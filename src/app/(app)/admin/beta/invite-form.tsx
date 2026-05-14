"use client";

import { useActionState } from "react";
import { createBetaInvites } from "./actions";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";

const inputCls =
  "w-full rounded-lg border border-[--border] bg-[--bg-input] px-3 py-2 text-sm text-[--text-primary] outline-none focus:border-[--accent]";

export function BetaInviteForm() {
  const [state, action, pending] = useActionState(createBetaInvites, {});

  return (
    <form action={action} className="rounded-xl border border-[--border] bg-[--bg-card] p-5">
      <div>
        <h2 className="font-semibold text-[--text-primary]">Generate invites</h2>
        <p className="mt-1 text-sm text-[--text-secondary]">
          Paste emails to send invites, or leave emails blank to generate codes for manual distribution.
        </p>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_180px_160px]">
        <label className="text-xs font-medium text-[--text-secondary]">
          Emails
          <textarea
            name="emails"
            rows={5}
            className={`${inputCls} mt-1 resize-none`}
            placeholder="jane@company.com&#10;sam@company.com"
          />
        </label>
        <label className="text-xs font-medium text-[--text-secondary]">
          Count
          <Input name="count" type="number" min={1} max={100} defaultValue={10} className={`${inputCls} mt-1`} />
        </label>
        <label className="text-xs font-medium text-[--text-secondary]">
          Cohort
          <Input name="cohort" defaultValue="beta_1" className={`${inputCls} mt-1`} />
        </label>
      </div>

      <label className="mt-4 block text-xs font-medium text-[--text-secondary]">
        Founder note
        <textarea
          name="personal_note"
          rows={3}
          className={`${inputCls} mt-1 resize-none`}
          placeholder="Optional personal paragraph for the invite email."
        />
      </label>

      <label className="mt-4 flex items-center gap-2 text-sm text-[--text-secondary]">
        <Checkbox name="is_vip" value="true" aria-label="Mark these invites as VIP" className="h-4 w-4" />
        Mark these invites as VIP
      </label>

      {state.error && <p className="mt-3 text-sm text-[--danger]">{state.error}</p>}
      {state.success && <p className="mt-3 text-sm text-[--success]">{state.success}</p>}

      <button
        type="submit"
        disabled={pending}
        className="mt-4 rounded-lg bg-[--accent] px-4 py-2 text-sm font-semibold text-white hover:bg-[--accent-hover] disabled:opacity-60"
      >
        {pending ? "Creating..." : "Create invites"}
      </button>
    </form>
  );
}
