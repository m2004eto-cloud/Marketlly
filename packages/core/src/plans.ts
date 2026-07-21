import { readJson, writeJson } from "./storage";

export type PlanId = "free" | "starter" | "pro" | "enterprise";
export type BillingCycle = "monthly" | "annual";
export type SearchRank = "standard" | "priority" | "premium" | "top";

/** Structured entitlements granted by a plan (not just marketing copy). */
export type PlanCapabilities = {
  /** Max photos per ad; >= 99999 means unlimited */
  maxPhotos: number;
  featuredBadge: boolean;
  /** Homepage featured slots (0 = none) */
  homepageSlots: number;
  searchRank: SearchRank;
  analytics: boolean;
  prioritySupport: boolean;
  dedicatedAccountPage: boolean;
  accountManager: boolean;
  apiAccess: boolean;
  vatSupport: boolean;
  brandedDealerPage: boolean;
  customInvoiceBranding: boolean;
};

export type SubscriptionPlan = {
  id: PlanId;
  name: string;
  monthlyPrice: number;
  annualPrice: number;
  maxAds: number;
  features: string[];
  capabilities: PlanCapabilities;
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

export const SEARCH_RANK_SCORE: Record<SearchRank, number> = {
  standard: 0,
  priority: 1,
  premium: 2,
  top: 3,
};

const PLANS_KEY = "marketly_subscription_plans_v1";

const DEFAULT_PLANS: SubscriptionPlan[] = [
  {
    id: "free",
    name: "Free",
    monthlyPrice: 0,
    annualPrice: 0,
    maxAds: 5,
    highlight: false,
    color: "slate",
    capabilities: {
      maxPhotos: 5,
      featuredBadge: false,
      homepageSlots: 0,
      searchRank: "standard",
      analytics: false,
      prioritySupport: false,
      dedicatedAccountPage: false,
      accountManager: false,
      apiAccess: false,
      vatSupport: false,
      brandedDealerPage: false,
      customInvoiceBranding: false,
    },
    features: ["5 ads/month", "Basic listing", "Standard search placement", "Email support"],
    recommendedFor: ["customer", "dealer"],
  },
  {
    id: "starter",
    name: "Starter",
    monthlyPrice: 99,
    annualPrice: 990,
    maxAds: 20,
    highlight: false,
    color: "blue",
    capabilities: {
      maxPhotos: 15,
      featuredBadge: true,
      homepageSlots: 0,
      searchRank: "priority",
      analytics: false,
      prioritySupport: false,
      dedicatedAccountPage: false,
      accountManager: false,
      apiAccess: false,
      vatSupport: false,
      brandedDealerPage: false,
      customInvoiceBranding: false,
    },
    features: [
      "20 ads/month",
      "Featured badge",
      "Priority search placement",
      "Photo gallery up to 15 photos",
      "Chat support",
    ],
    recommendedFor: ["customer", "dealer"],
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
    capabilities: {
      maxPhotos: 99999,
      featuredBadge: true,
      homepageSlots: 1,
      searchRank: "premium",
      analytics: true,
      prioritySupport: true,
      dedicatedAccountPage: true,
      accountManager: false,
      apiAccess: false,
      vatSupport: false,
      brandedDealerPage: false,
      customInvoiceBranding: false,
    },
    features: [
      "100 ads/month",
      "Homepage featured slot",
      "Premium search rank",
      "Unlimited photos",
      "Analytics dashboard",
      "Priority support",
      "Dedicated account page",
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
    capabilities: {
      maxPhotos: 99999,
      featuredBadge: true,
      homepageSlots: 5,
      searchRank: "top",
      analytics: true,
      prioritySupport: true,
      dedicatedAccountPage: true,
      accountManager: true,
      apiAccess: true,
      vatSupport: true,
      brandedDealerPage: true,
      customInvoiceBranding: true,
    },
    features: [
      "Unlimited ads",
      "Multiple homepage slots",
      "Top search rank always",
      "Branded dealer page",
      "API access",
      "Dedicated account manager",
      "Custom invoice branding",
      "VAT filing support",
    ],
    recommendedFor: ["customer", "dealer"],
  },
];

/** Default catalog (seed). Prefer listPlans() for the live admin-editable catalog. */
export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = DEFAULT_PLANS;

const planListeners = new Set<() => void>();

function isPlanId(id: string): id is PlanId {
  return id === "free" || id === "starter" || id === "pro" || id === "enterprise";
}

function mergePlan(base: SubscriptionPlan, patch: Partial<SubscriptionPlan>): SubscriptionPlan {
  const maxAds = typeof patch.maxAds === "number" ? patch.maxAds : base.maxAds;
  const capabilities = {
    ...base.capabilities,
    ...(patch.capabilities || {}),
  };
  const features = syncAdsFeatureLine(patch.features ?? base.features, maxAds);
  return {
    ...base,
    ...patch,
    id: base.id,
    maxAds,
    capabilities,
    features,
  };
}

/** Keep the ads/month line in Includes aligned with maxAds. */
export function syncAdsFeatureLine(features: string[], maxAds: number): string[] {
  const adsLabel =
    maxAds >= 99999 ? "Unlimited ads" : `${maxAds} ads/month`;
  const next = [...features];
  const idx = next.findIndex((f) => /ads\/month|unlimited ads/i.test(f));
  if (idx >= 0) next[idx] = adsLabel;
  else next.unshift(adsLabel);
  return next;
}

function loadOverrides(): Partial<Record<PlanId, Partial<SubscriptionPlan>>> {
  return readJson(PLANS_KEY, {});
}

function persistOverrides(overrides: Partial<Record<PlanId, Partial<SubscriptionPlan>>>) {
  writeJson(PLANS_KEY, overrides);
  planListeners.forEach((l) => l());
}

/** Live catalog — defaults merged with admin overrides (localStorage). */
export function listPlans(): SubscriptionPlan[] {
  const overrides = loadOverrides();
  return DEFAULT_PLANS.map((base) => {
    const patch = overrides[base.id];
    return patch ? mergePlan(base, patch) : { ...base, capabilities: { ...base.capabilities }, features: [...base.features] };
  });
}

export function getPlan(planId: string | undefined | null): SubscriptionPlan {
  const id = planId && isPlanId(planId) ? planId : "free";
  return listPlans().find((p) => p.id === id) || listPlans()[0];
}

export function updatePlan(
  planId: PlanId,
  patch: Partial<Omit<SubscriptionPlan, "id">>,
): SubscriptionPlan {
  const base = DEFAULT_PLANS.find((p) => p.id === planId);
  if (!base) throw new Error(`Unknown plan: ${planId}`);
  const overrides = loadOverrides();
  const prev = overrides[planId] || {};
  const mergedPatch: Partial<SubscriptionPlan> = {
    ...prev,
    ...patch,
    capabilities: {
      ...base.capabilities,
      ...(prev.capabilities || {}),
      ...(patch.capabilities || {}),
    },
  };
  if (typeof patch.maxAds === "number") {
    mergedPatch.features = syncAdsFeatureLine(
      (patch.features || prev.features || base.features) as string[],
      patch.maxAds,
    );
  }
  overrides[planId] = mergedPatch;
  persistOverrides(overrides);
  return getPlan(planId);
}

export function savePlans(plans: SubscriptionPlan[]): SubscriptionPlan[] {
  const overrides: Partial<Record<PlanId, Partial<SubscriptionPlan>>> = {};
  for (const plan of plans) {
    if (!isPlanId(plan.id)) continue;
    const base = DEFAULT_PLANS.find((p) => p.id === plan.id);
    if (!base) continue;
    overrides[plan.id] = {
      name: plan.name,
      monthlyPrice: plan.monthlyPrice,
      annualPrice: plan.annualPrice,
      maxAds: plan.maxAds,
      features: syncAdsFeatureLine(plan.features, plan.maxAds),
      capabilities: plan.capabilities || base.capabilities,
      highlight: plan.highlight,
      color: plan.color,
      badge: plan.badge,
    };
  }
  persistOverrides(overrides);
  return listPlans();
}

export function subscribePlans(cb: () => void) {
  planListeners.add(cb);
  return () => planListeners.delete(cb);
}

export function formatMaxAds(maxAds: number): string {
  return maxAds >= 99999 ? "Unlimited" : String(maxAds);
}

export type ComparisonRow = {
  label: string;
  values: Array<string | boolean>;
};

/** Build comparison matrix rows from the live plan catalog. */
export function buildPlanComparisonMatrix(plans: SubscriptionPlan[] = listPlans()): ComparisonRow[] {
  return [
    {
      label: "Max Ads/Month",
      values: plans.map((p) => formatMaxAds(p.maxAds)),
    },
    {
      label: "Featured Badge",
      values: plans.map((p) => p.capabilities.featuredBadge),
    },
    {
      label: "Homepage Featured",
      values: plans.map((p) => p.capabilities.homepageSlots > 0),
    },
    {
      label: "Priority Search",
      values: plans.map((p) => SEARCH_RANK_SCORE[p.capabilities.searchRank] >= 1),
    },
    {
      label: "Premium Search",
      values: plans.map((p) => SEARCH_RANK_SCORE[p.capabilities.searchRank] >= 2),
    },
    {
      label: "Unlimited Photos",
      values: plans.map((p) => p.capabilities.maxPhotos >= 99999),
    },
    {
      label: "Analytics",
      values: plans.map((p) => p.capabilities.analytics),
    },
    {
      label: "Dedicated Account Page",
      values: plans.map((p) => p.capabilities.dedicatedAccountPage),
    },
    {
      label: "Account Manager",
      values: plans.map((p) => p.capabilities.accountManager),
    },
    {
      label: "API Access",
      values: plans.map((p) => p.capabilities.apiAccess),
    },
    {
      label: "VAT Support",
      values: plans.map((p) => p.capabilities.vatSupport),
    },
    {
      label: "Price (Monthly)",
      values: plans.map((p) =>
        p.monthlyPrice === 0 ? "Free" : `AED ${p.monthlyPrice.toLocaleString()}`,
      ),
    },
  ];
}

const PLAN_RANK: Record<PlanId, number> = {
  free: 0,
  starter: 1,
  pro: 2,
  enterprise: 3,
};

export function planRank(planId: PlanId): number {
  return PLAN_RANK[planId] ?? 0;
}

export function isPaidPlan(planId: PlanId): boolean {
  return planId !== "free";
}

export function plansForRole(_role: "customer" | "dealer"): SubscriptionPlan[] {
  return listPlans();
}

export function defaultPlanForRole(role: "customer" | "dealer" | "admin"): PlanId {
  if (role === "admin") return "enterprise";
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
