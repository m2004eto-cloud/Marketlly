export type PlanId = "free" | "starter" | "pro" | "enterprise";
export type BillingCycle = "monthly" | "annual";

export type SubscriptionPlan = {
  id: PlanId;
  name: string;
  monthlyPrice: number;
  annualPrice: number;
  maxAds: number;
  features: string[];
  highlight: boolean;
  color: string;
  badge?: string;
  /** Dealers are nudged toward higher tiers in the UI */
  recommendedFor?: Array<"customer" | "dealer">;
};

export type UserSubscription = {
  planId: PlanId;
  status: "active" | "expired";
  billingCycle: BillingCycle;
  startDate: string;
  /** Current billing window start (YYYY-MM-DD) */
  periodStart: string;
  /** Current billing window end (YYYY-MM-DD) */
  periodEnd: string;
  /** Ads posted in the current window */
  adsUsedThisPeriod: number;
};

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: "free",
    name: "Free",
    monthlyPrice: 0,
    annualPrice: 0,
    maxAds: 5,
    highlight: false,
    color: "slate",
    features: ["5 ads/month", "Basic listing", "Standard search placement", "Email support"],
    recommendedFor: ["customer"],
  },
  {
    id: "starter",
    name: "Starter",
    monthlyPrice: 99,
    annualPrice: 990,
    maxAds: 20,
    highlight: false,
    color: "blue",
    features: [
      "20 ads/month",
      "Featured badge",
      "Priority search placement",
      "Photo gallery up to 15 photos",
      "Chat support",
    ],
    recommendedFor: ["customer"],
  },
  {
    id: "pro",
    name: "Pro",
    monthlyPrice: 299,
    annualPrice: 2990,
    maxAds: 100,
    highlight: true,
    color: "violet",
    badge: "Most Popular",
    features: [
      "100 ads/month",
      "Homepage featured slot",
      "Premium search rank",
      "Unlimited photos",
      "Analytics dashboard",
      "Priority support",
    ],
    recommendedFor: ["customer", "dealer"],
  },
  {
    id: "enterprise",
    name: "Enterprise",
    monthlyPrice: 999,
    annualPrice: 9990,
    maxAds: 99999,
    highlight: false,
    color: "amber",
    badge: "Dealer Edition",
    features: [
      "Unlimited ads",
      "Multiple homepage slots",
      "Top search rank always",
      "Branded dealer page",
      "API access",
      "Dedicated account manager",
    ],
    recommendedFor: ["dealer"],
  },
];

const PLAN_RANK: Record<PlanId, number> = {
  free: 0,
  starter: 1,
  pro: 2,
  enterprise: 3,
};

export function getPlan(planId: string | undefined | null): SubscriptionPlan {
  return SUBSCRIPTION_PLANS.find((p) => p.id === planId) || SUBSCRIPTION_PLANS[0];
}

export function planRank(planId: PlanId): number {
  return PLAN_RANK[planId] ?? 0;
}

export function isPaidPlan(planId: PlanId): boolean {
  return planId !== "free";
}

export function plansForRole(role: "customer" | "dealer"): SubscriptionPlan[] {
  // All plans are selectable; Free excluded only from renew, not signup.
  return SUBSCRIPTION_PLANS;
}

export function defaultPlanForRole(role: "customer" | "dealer" | "admin"): PlanId {
  if (role === "admin") return "enterprise";
  if (role === "dealer") return "pro";
  return "free";
}

function toDateOnly(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function addDays(dateStr: string, days: number): string {
  const d = new Date(`${dateStr}T12:00:00.000Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return toDateOnly(d);
}

export function periodLengthDays(cycle: BillingCycle): number {
  return cycle === "annual" ? 365 : 30;
}

/** Build a new subscription window starting today (or from `from`). */
export function buildSubscription(
  planId: PlanId,
  billingCycle: BillingCycle = "monthly",
  from: string = toDateOnly(new Date()),
  adsUsedThisPeriod = 0,
): UserSubscription {
  const days = periodLengthDays(billingCycle);
  return {
    planId,
    status: "active",
    billingCycle,
    startDate: from,
    periodStart: from,
    periodEnd: addDays(from, days),
    adsUsedThisPeriod,
  };
}

/** Renew resets the window from the renew date (even if current period not finished). */
export function renewSubscriptionPeriod(sub: UserSubscription, from: string = toDateOnly(new Date())): UserSubscription {
  const days = periodLengthDays(sub.billingCycle);
  return {
    ...sub,
    status: "active",
    periodStart: from,
    periodEnd: addDays(from, days),
    adsUsedThisPeriod: 0,
  };
}

export function refreshSubscriptionStatus(sub: UserSubscription, today: string = toDateOnly(new Date())): UserSubscription {
  if (sub.periodEnd < today) {
    return { ...sub, status: "expired" };
  }
  return { ...sub, status: "active" };
}

export function planPrice(plan: SubscriptionPlan, cycle: BillingCycle): number {
  return cycle === "annual" ? plan.annualPrice : plan.monthlyPrice;
}
