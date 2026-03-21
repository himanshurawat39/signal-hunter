import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { DEFAULT_PLAN_ID, type PlanId } from "@/lib/pricing";
import {
  createStripeClient,
  getPlanIdFromPriceId,
  getStripeWebhookSecret,
  hasStripeEnv,
} from "@/lib/stripe";
import {
  findProfileByStripeCustomerId,
  findProfileByStripeSubscriptionId,
  updateProfileBilling,
} from "@/lib/usage";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    if (!hasStripeEnv()) {
      return NextResponse.json({ error: "Stripe is not configured yet." }, { status: 503 });
    }

    const stripe = createStripeClient();
    const signature = (await headers()).get("stripe-signature");

    if (!signature) {
      return NextResponse.json({ error: "Missing Stripe signature." }, { status: 400 });
    }

    const payload = await request.text();
    const event = stripe.webhooks.constructEvent(
      payload,
      signature,
      getStripeWebhookSecret(),
    );

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        const userId = session.metadata?.user_id || session.client_reference_id;
        const planId = normalizePlanId(session.metadata?.plan_id);
        const customerId = typeof session.customer === "string" ? session.customer : null;
        const subscriptionId =
          typeof session.subscription === "string" ? session.subscription : null;

        if (userId && planId) {
          await updateProfileBilling({
            userId,
            plan: planId,
            stripeCustomerId: customerId,
            stripeSubscriptionId: subscriptionId,
            subscriptionStatus: "active",
          });
        }
        break;
      }
      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const subscription = event.data.object;
        const metadataPlan = normalizePlanId(subscription.metadata?.plan_id);
        const pricePlan = getPlanIdFromPriceId(
          subscription.items.data[0]?.price?.id,
        );
        const planId = metadataPlan || pricePlan || DEFAULT_PLAN_ID;
        const customerId = typeof subscription.customer === "string" ? subscription.customer : null;
        const subscriptionId = subscription.id;
        const userId = subscription.metadata?.user_id;

        if (userId) {
          await updateProfileBilling({
            userId,
            plan: planId,
            stripeCustomerId: customerId,
            stripeSubscriptionId: subscriptionId,
            subscriptionStatus: subscription.status,
          });
        } else if (customerId) {
          const profile = await findProfileByStripeCustomerId(customerId);

          if (profile) {
            await updateProfileBilling({
              userId: profile.id,
              email: profile.email,
              plan: planId,
              stripeCustomerId: customerId,
              stripeSubscriptionId: subscriptionId,
              subscriptionStatus: subscription.status,
            });
          }
        }
        break;
      }
      case "customer.subscription.deleted": {
        const subscription = event.data.object;
        const customerId = typeof subscription.customer === "string" ? subscription.customer : null;
        const subscriptionId = subscription.id;
        const profile = customerId
          ? await findProfileByStripeCustomerId(customerId)
          : await findProfileByStripeSubscriptionId(subscriptionId);

        if (profile) {
          await updateProfileBilling({
            userId: profile.id,
            email: profile.email,
            plan: DEFAULT_PLAN_ID,
            stripeCustomerId: customerId ?? profile.stripe_customer_id,
            stripeSubscriptionId: null,
            subscriptionStatus: subscription.status,
          });
        }
        break;
      }
      default:
        break;
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Webhook failed.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

function normalizePlanId(value: string | undefined): PlanId | null {
  if (value === "free" || value === "pro" || value === "agency") {
    return value;
  }

  return null;
}
