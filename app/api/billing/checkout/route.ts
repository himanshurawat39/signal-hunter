import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { ensureProfile } from "@/lib/usage";
import { createStripeClient, getStripePriceId, hasStripeEnv, isPaidPlan } from "@/lib/stripe";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    if (!hasStripeEnv()) {
      return NextResponse.json({ error: "Stripe is not configured yet." }, { status: 503 });
    }

    const body = (await request.json()) as { planId?: "free" | "pro" | "agency" };
    const planId = body.planId;

    if (!planId || !isPaidPlan(planId)) {
      return NextResponse.json({ error: "Choose a paid plan to continue." }, { status: 400 });
    }

    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Please sign in before upgrading." }, { status: 401 });
    }

    const profile = await ensureProfile({ id: user.id, email: user.email });
    const stripe = createStripeClient();
    const origin = request.nextUrl.origin;
    const priceId = getStripePriceId(planId);
    let customerId = profile.stripe_customer_id;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email ?? undefined,
        metadata: {
          user_id: user.id,
        },
      });
      customerId = customer.id;

      const admin = createSupabaseAdminClient();
      await admin
        .from("profiles")
        .update({ stripe_customer_id: customerId })
        .eq("id", user.id);
    }

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: customerId,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      client_reference_id: user.id,
      allow_promotion_codes: true,
      success_url: `${origin}/?billing=success`,
      cancel_url: `${origin}/?billing=cancelled`,
      metadata: {
        user_id: user.id,
        plan_id: planId,
      },
      subscription_data: {
        metadata: {
          user_id: user.id,
          plan_id: planId,
        },
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to start checkout.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
