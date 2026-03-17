export type PlanId = "free" | "pro" | "agency";

export type PlanDefinition = {
  id: PlanId;
  name: string;
  priceLabel: string;
  searchesPerMonth: string;
  audience: string;
  tagline: string;
  highlights: string[];
  monthlySearchLimit: number;
  dailySearchLimit: number | null;
};

export const DEFAULT_PLAN_ID: PlanId = "free";

export const PLAN_DEFINITIONS: Record<PlanId, PlanDefinition> = {
  free: {
    id: "free",
    name: "Free",
    priceLabel: "Rs 0 / month",
    searchesPerMonth: "40 searches / month",
    audience: "Best for trying the workflow",
    tagline: "A small beta tier for testing real buyer-signal searches.",
    highlights: [
      "2 searches per day",
      "40 searches per month",
      "Live Reddit and X discovery",
      "AI-ranked results",
    ],
    monthlySearchLimit: 40,
    dailySearchLimit: 2,
  },
  pro: {
    id: "pro",
    name: "Pro",
    priceLabel: "Rs 799 / month",
    searchesPerMonth: "120 searches / month",
    audience: "Best for freelancers and solo operators",
    tagline: "A single strong paid tier under Rs 1000 with enough room for consistent prospecting.",
    highlights: [
      "120 searches per month",
      "Best fit for 1 to 3 niches",
      "Faster workflow",
      "Email support",
    ],
    monthlySearchLimit: 120,
    dailySearchLimit: null,
  },
  agency: {
    id: "agency",
    name: "Agency",
    priceLabel: "Rs 1,999 / month",
    searchesPerMonth: "500 searches / month",
    audience: "Best for teams",
    tagline: "Built for heavier usage once you move beyond free infrastructure comfort.",
    highlights: [
      "500 searches per month",
      "Team-friendly usage",
      "Room for multiple client niches",
      "Best value before custom plans",
    ],
    monthlySearchLimit: 500,
    dailySearchLimit: null,
  },
};

export const PRICING_PLANS = Object.values(PLAN_DEFINITIONS);

export function getPlanDefinition(planId: string | null | undefined): PlanDefinition {
  if (!planId || !(planId in PLAN_DEFINITIONS)) {
    return PLAN_DEFINITIONS[DEFAULT_PLAN_ID];
  }

  return PLAN_DEFINITIONS[planId as PlanId];
}
