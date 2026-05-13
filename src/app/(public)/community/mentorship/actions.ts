"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

type InsertResult = Promise<{ error: { code?: string; message: string } | null }>;

type InsertBuilder = {
  insert(values: Record<string, unknown>): InsertResult;
};

type UntypedSupabase = {
  from(table: string): InsertBuilder;
};

function clean(value: FormDataEntryValue | null) {
  const text = typeof value === "string" ? value.trim() : "";
  return text || null;
}

export async function joinMentorshipWaitlist(formData: FormData) {
  const email = clean(formData.get("email"))?.toLowerCase();
  const role = clean(formData.get("role"));

  if (!email || (role !== "mentee" && role !== "mentor")) {
    redirect("/community/mentorship?error=missing");
  }

  const supabase = (await createClient()) as unknown as UntypedSupabase;
  const { error } = await supabase.from("mentorship_waitlist").insert({
    email,
    role,
    full_name: clean(formData.get("full_name")),
    company: clean(formData.get("company")),
    goals: clean(formData.get("goals")),
  });

  if (error && error.code !== "23505") {
    console.error("Failed to join mentorship waitlist", error);
    redirect("/community/mentorship?error=save");
  }

  redirect("/community/mentorship?joined=1");
}
