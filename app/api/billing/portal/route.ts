import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { ensureProfile } from "@/lib/usage";
import { createStripeClient, hasStripeEnv } from "@/lib/stripe";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    if (!hasStripeEnv()) {
      return NextResponse.json({ error: "Stripe is not configured yet." }, { status: 503 });
    }

    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Please sign in first." }, { status: 401 });
    }

    const profile = await ensureProfile({ id: user.id, email: user.email });

    if (!profile.stripe_customer_id) {
      return NextResponse.json(
        { error: "No Stripe customer found yet for this account." },
        { status: 400 },
      );
    }

    const stripe = createStripeClient();
    const session = await stripe.billingPortal.sessions.create({
      customer: profile.stripe_customer_id,
      return_url: `${request.nextUrl.origin}/?billing=portal`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to open billing portal.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
