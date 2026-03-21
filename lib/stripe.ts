import Stripe from "stripe";
import { getPlanDefinition, type PlanId } from "@/lib/pricing";

type PaidPlanId = Exclude<PlanId, "free">;

export function hasStripeEnv() {
  return Boolean(process.env.STRIPE_SECRET_KEY);
}

export function createStripeClient() {
  const secretKey = process.env.STRIPE_SECRET_KEY;

  if (!secretKey) {
    throw new Error("Missing STRIPE_SECRET_KEY.");
  }

  return new Stripe(secretKey);
}

export function getStripeWebhookSecret() {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    throw new Error("Missing STRIPE_WEBHOOK_SECRET.");
  }

  return webhookSecret;
}

export function getStripePriceId(planId: PaidPlanId) {
  const envName =
    planId === "pro" ? "STRIPE_PRICE_PRO_MONTHLY" : "STRIPE_PRICE_AGENCY_MONTHLY";
  const priceId = process.env[envName];

  if (!priceId) {
    throw new Error(`Missing ${envName}.`);
  }

  return priceId;
}

export function isPaidPlan(planId: PlanId): planId is PaidPlanId {
  return planId !== "free";
}

export function getPlanIdFromPriceId(priceId: string | null | undefined): PaidPlanId | null {
  if (!priceId) {
    return null;
  }

  if (priceId === process.env.STRIPE_PRICE_PRO_MONTHLY) {
    return "pro";
  }

  if (priceId === process.env.STRIPE_PRICE_AGENCY_MONTHLY) {
    return "agency";
  }

  return null;
}

export function getPlanDisplayName(planId: PlanId) {
  return getPlanDefinition(planId).name;
}
