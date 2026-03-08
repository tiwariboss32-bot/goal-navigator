export interface PlanTier {
  key: string;
  name: string;
  price: number; // monthly USD
  goalLimit: number; // -1 = unlimited
  features: string[];
  bestFor: string;
}

export const PLAN_TIERS: PlanTier[] = [
  {
    key: "free",
    name: "Free",
    price: 0,
    goalLimit: 2,
    features: [
      "1–2 AI goal plans per month",
      "Basic AI questioning",
      "Basic task tracker",
      "Public tracker page",
      "Limited reminders",
    ],
    bestFor: "New users trying the platform",
  },
  {
    key: "growth",
    name: "Growth",
    price: 12,
    goalLimit: 20,
    features: [
      "20 AI goal plans per month",
      "Deep AI questioning",
      "Private tracker page",
      "Email reminders",
      "Goal progress analytics",
      "AI plan updates",
    ],
    bestFor: "Students & professionals",
  },
  {
    key: "pro",
    name: "Pro",
    price: 29,
    goalLimit: -1,
    features: [
      "Unlimited goal plans",
      "Advanced AI planning & refinement",
      "Multiple active goals",
      "Smart reminders & notifications",
      "Weekly AI progress reports",
      "Calendar integration",
      "Priority AI processing",
    ],
    bestFor: "Entrepreneurs & creators",
  },
  {
    key: "power",
    name: "Power",
    price: 49,
    goalLimit: -1,
    features: [
      "Unlimited AI planning",
      "AI coaching mode",
      "WhatsApp reminders",
      "Advanced progress analytics",
      "Team & accountability partner support",
    ],
    bestFor: "Teams & founders",
  },
];

export const getTierByKey = (key: string): PlanTier =>
  PLAN_TIERS.find((t) => t.key === key) || PLAN_TIERS[0];
