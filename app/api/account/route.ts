import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { ensureProfile, getUsageSnapshot } from "@/lib/usage";
import { hasSupabaseEnv } from "@/lib/supabase/env";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    if (!hasSupabaseEnv()) {
      return NextResponse.json(
        { error: "Supabase is not configured yet." },
        { status: 503 },
      );
    }

    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      return NextResponse.json({ user: null }, { status: 200 });
    }

    const profile = await ensureProfile({ id: user.id, email: user.email });
    const usage = await getUsageSnapshot(user.id, profile.plan);

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email ?? null,
      },
      profile,
      usage,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to load account.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
