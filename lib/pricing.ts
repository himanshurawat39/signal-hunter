export type PlanDefinition = {
  id: string;
  name: string;
  priceLabel: string;
  searchesPerMonth: string;
  audience: string;
  tagline: string;
  highlights: string[];
};

export const FREE_PLAN_STORAGE_KEY = "signal-hunter-free-usage-v1";

export const FREE_PLAN_LIMITS = {
  dailySearches: 2,
  monthlySearches: 40,
} as const;

export const PRICING_PLANS: PlanDefinition[] = [
  {
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
      "Gemini-ranked results",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    priceLabel: "Rs 799 / month",
    searchesPerMonth: "120 searches / month",
    audience: "Best for freelancers and solo operators",
    tagline: "A single strong paid tier under Rs 1000 with enough room for consistent prospecting.",
    highlights: [
      "120 searches per month",
      "Best fit for 1 to 3 niches",
      "Priority over free users",
      "Email support",
    ],
  },
  {
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
  },
];
