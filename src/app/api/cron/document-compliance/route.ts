import { NextRequest, NextResponse } from "next/server";
import { recomputeAllCompliance } from "@/lib/compliance/compute";
import { createAdminClient } from "@/lib/supabase/admin";

// Stable lock key for the compliance cron — prevents concurrent runs from overlapping
const COMPLIANCE_CRON_LOCK = 4_000_000_001;

type AdvisoryLockClient = {
  rpc(
    fn: "try_advisory_lock" | "release_advisory_lock",
    args: { key: number }
  ): Promise<{ data: boolean | null }>;
};

export async function GET(req: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  const authHeader = req.headers.get("authorization");
  const secretHeader = req.headers.get("x-cron-secret");

  if (!cronSecret) {
    return NextResponse.json({ error: "Cron secret is not configured" }, { status: 500 });
  }

  if (authHeader !== `Bearer ${cronSecret}` && secretHeader !== cronSecret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = createAdminClient() as unknown as AdvisoryLockClient;
  const { data: locked } = await admin.rpc("try_advisory_lock", { key: COMPLIANCE_CRON_LOCK });
  if (!locked) {
    return NextResponse.json({ ok: true, skipped: true, reason: "Another run is in progress" });
  }

  try {
    const result = await recomputeAllCompliance();
    return NextResponse.json({ ok: true, ...result });
  } finally {
    await admin.rpc("release_advisory_lock", { key: COMPLIANCE_CRON_LOCK });
  }
}
