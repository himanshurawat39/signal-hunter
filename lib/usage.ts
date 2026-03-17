import type { PostgrestError } from "@supabase/supabase-js";
import { DEFAULT_PLAN_ID, getPlanDefinition, type PlanId } from "@/lib/pricing";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export type AccountProfile = {
  id: string;
  email: string | null;
  plan: PlanId;
};

export type UsageSnapshot = {
  planId: PlanId;
  dailyUsed: number;
  dailyLimit: number | null;
  dailyRemaining: number | null;
  monthlyUsed: number;
  monthlyLimit: number;
  monthlyRemaining: number;
  canSearch: boolean;
};

export async function ensureProfile(user: { id: string; email?: string | null }) {
  const admin = createSupabaseAdminClient();
  const existing = await admin
    .from("profiles")
    .select("id,email,plan")
    .eq("id", user.id)
    .maybeSingle();

  throwIfSchemaMissing(existing.error);

  if (existing.data) {
    const plan = getPlanDefinition(existing.data.plan).id;

    if (plan !== existing.data.plan || existing.data.email !== (user.email ?? null)) {
      const updated = await admin
        .from("profiles")
        .upsert(
          {
            id: user.id,
            email: user.email ?? null,
            plan,
          },
          { onConflict: "id" },
        )
        .select("id,email,plan")
        .single();

      throwIfSchemaMissing(updated.error);
      return updated.data as AccountProfile;
    }

    return existing.data as AccountProfile;
  }

  const created = await admin
    .from("profiles")
    .insert({
      id: user.id,
      email: user.email ?? null,
      plan: DEFAULT_PLAN_ID,
    })
    .select("id,email,plan")
    .single();

  throwIfSchemaMissing(created.error);

  return created.data as AccountProfile;
}

export async function getUsageSnapshot(userId: string, planId: PlanId) {
  const admin = createSupabaseAdminClient();
  const now = new Date();
  const dayStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const nextDay = new Date(dayStart);
  nextDay.setUTCDate(nextDay.getUTCDate() + 1);
  const monthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  const nextMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1));
  const plan = getPlanDefinition(planId);

  const [dailyCountResult, monthlyCountResult] = await Promise.all([
    plan.dailySearchLimit === null
      ? Promise.resolve({ count: 0, error: null as PostgrestError | null })
      : admin
          .from("search_usage")
          .select("id", { count: "exact", head: true })
          .eq("user_id", userId)
          .gte("created_at", dayStart.toISOString())
          .lt("created_at", nextDay.toISOString()),
    admin
      .from("search_usage")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .gte("created_at", monthStart.toISOString())
      .lt("created_at", nextMonth.toISOString()),
  ]);

  throwIfSchemaMissing(dailyCountResult.error);
  throwIfSchemaMissing(monthlyCountResult.error);

  const dailyUsed = dailyCountResult.count ?? 0;
  const monthlyUsed = monthlyCountResult.count ?? 0;
  const dailyRemaining =
    plan.dailySearchLimit === null ? null : Math.max(0, plan.dailySearchLimit - dailyUsed);
  const monthlyRemaining = Math.max(0, plan.monthlySearchLimit - monthlyUsed);

  return {
    planId: plan.id,
    dailyUsed,
    dailyLimit: plan.dailySearchLimit,
    dailyRemaining,
    monthlyUsed,
    monthlyLimit: plan.monthlySearchLimit,
    monthlyRemaining,
    canSearch:
      monthlyRemaining > 0 &&
      (dailyRemaining === null || dailyRemaining > 0),
  } satisfies UsageSnapshot;
}

export async function recordUsage(input: {
  userId: string;
  niche: string;
  problem: string;
  query: string;
  provider: string;
  matchMode: "exact" | "related";
  resultCount: number;
}) {
  const admin = createSupabaseAdminClient();
  const result = await admin.from("search_usage").insert({
    user_id: input.userId,
    niche: input.niche,
    problem: input.problem,
    query: input.query,
    provider: input.provider,
    match_mode: input.matchMode,
    result_count: input.resultCount,
  });

  throwIfSchemaMissing(result.error);
}

function throwIfSchemaMissing(error: PostgrestError | null) {
  if (!error) {
    return;
  }

  if (error.code === "42P01" || error.code === "42703") {
    throw new Error(
      "Supabase tables are not set up yet. Run the SQL in supabase/schema.sql in the Supabase SQL Editor.",
    );
  }

  throw new Error(error.message);
}
