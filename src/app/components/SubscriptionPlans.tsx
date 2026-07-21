import { useState } from "react";
import { Check, RefreshCw, Sparkles, Zap } from "lucide-react";
import {
  SUBSCRIPTION_PLANS,
  getPlan,
  isPaidPlan,
  planPrice,
  type BillingCycle,
  type PlanId,
  type SubscriptionPlan,
} from "@marketly/core";

const colorStyles: Record<string, { border: string; bg: string; badge: string; price: string }> = {
  slate: {
    border: "border-slate-200 dark:border-slate-700",
    bg: "bg-slate-50 dark:bg-slate-900/40",
    badge: "bg-slate-200 text-slate-700",
    price: "text-slate-900 dark:text-slate-100",
  },
  blue: {
    border: "border-blue-200 dark:border-blue-900",
    bg: "bg-blue-50/60 dark:bg-blue-950/20",
    badge: "bg-blue-100 text-blue-700",
    price: "text-blue-700 dark:text-blue-300",
  },
  violet: {
    border: "border-violet-300 dark:border-violet-800",
    bg: "bg-violet-50/70 dark:bg-violet-950/30",
    badge: "bg-violet-600 text-white",
    price: "text-violet-700 dark:text-violet-300",
  },
  amber: {
    border: "border-amber-300 dark:border-amber-800",
    bg: "bg-amber-50/70 dark:bg-amber-950/20",
    badge: "bg-amber-100 text-amber-800",
    price: "text-amber-700 dark:text-amber-300",
  },
};

type PickerProps = {
  role: "customer" | "dealer";
  selectedPlanId: PlanId;
  billingCycle: BillingCycle;
  onSelectPlan: (id: PlanId) => void;
  onCycleChange: (c: BillingCycle) => void;
  excludeFree?: boolean;
  /** Only show plans strictly higher than this id */
  minPlanId?: PlanId;
  title?: string;
};

export function PlanPicker({
  role,
  selectedPlanId,
  billingCycle,
  onSelectPlan,
  onCycleChange,
  excludeFree,
  minPlanId,
  title = "Choose a subscription plan",
}: PickerProps) {
  const minRank = minPlanId ? SUBSCRIPTION_PLANS.findIndex((p) => p.id === minPlanId) : -1;
  const plans = SUBSCRIPTION_PLANS.filter((p) => {
    if (excludeFree && p.id === "free") return false;
    if (minPlanId) {
      const rank = SUBSCRIPTION_PLANS.findIndex((x) => x.id === p.id);
      return rank > minRank;
    }
    return true;
  });

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{title}</p>
        <div className="flex p-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs">
          {(["monthly", "annual"] as const).map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => onCycleChange(c)}
              className={`px-2.5 py-1 rounded-md capitalize transition ${
                billingCycle === c ? "bg-white dark:bg-slate-950 shadow-sm font-medium" : "text-slate-500"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-64 overflow-y-auto pe-1">
        {plans.map((plan) => (
          <PlanCard
            key={plan.id}
            plan={plan}
            billingCycle={billingCycle}
            selected={selectedPlanId === plan.id}
            recommended={plan.recommendedFor?.includes(role)}
            onSelect={() => onSelectPlan(plan.id)}
          />
        ))}
      </div>
      {plans.length === 0 && (
        <p className="text-xs text-slate-500">
          You are already on the highest plan. Renew to reset your period and ad allowance.
        </p>
      )}
    </div>
  );
}

function PlanCard({
  plan,
  billingCycle,
  selected,
  recommended,
  onSelect,
}: {
  plan: SubscriptionPlan;
  billingCycle: BillingCycle;
  selected: boolean;
  recommended?: boolean;
  onSelect: () => void;
}) {
  const styles = colorStyles[plan.color] || colorStyles.slate;
  const price = planPrice(plan, billingCycle);
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`text-start rounded-xl border-2 p-3 transition ${styles.bg} ${
        selected ? "border-blue-600 ring-2 ring-blue-600/20" : styles.border
      }`}
    >
      <div className="flex items-start justify-between gap-2 mb-1">
        <div>
          <p className="font-semibold text-sm">{plan.name}</p>
          {plan.badge && (
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full inline-block mt-0.5 ${styles.badge}`}>
              {plan.badge}
            </span>
          )}
        </div>
        {selected && <Check className="size-4 text-blue-600 shrink-0" />}
      </div>
      <p className={`text-lg font-bold tabular-nums ${styles.price}`}>
        {price === 0 ? "Free" : `AED ${price.toLocaleString()}`}
        {price > 0 && (
          <span className="text-xs font-normal text-slate-500">
            /{billingCycle === "annual" ? "yr" : "mo"}
          </span>
        )}
      </p>
      <p className="text-xs text-slate-500 mt-1">
        {plan.maxAds >= 99999 ? "Unlimited ads" : `${plan.maxAds} ads / period`}
      </p>
      {recommended && (
        <p className="text-[10px] text-blue-600 mt-1 flex items-center gap-1">
          <Sparkles className="size-3" /> Recommended for you
        </p>
      )}
    </button>
  );
}

type ManageProps = {
  role?: "customer" | "dealer";
  currentPlanId: PlanId;
  periodEnd?: string;
  adsUsed?: number;
  maxAds?: number;
  status?: string;
  canRenew: boolean;
  busy?: boolean;
  onUpgrade: (planId: PlanId, cycle: BillingCycle) => void | Promise<void>;
  onRenew: (cycle: BillingCycle) => void | Promise<void>;
  onClose?: () => void;
};

export function SubscriptionManager({
  role = "customer",
  currentPlanId,
  periodEnd,
  adsUsed = 0,
  maxAds = 0,
  status,
  canRenew,
  busy,
  onUpgrade,
  onRenew,
  onClose,
}: ManageProps) {
  const current = getPlan(currentPlanId);
  const higherExists = SUBSCRIPTION_PLANS.some(
    (p) =>
      SUBSCRIPTION_PLANS.findIndex((x) => x.id === p.id) >
      SUBSCRIPTION_PLANS.findIndex((x) => x.id === currentPlanId),
  );
  const [mode, setMode] = useState<"upgrade" | "renew">(
    !canRenew || currentPlanId === "free" ? "upgrade" : higherExists ? "upgrade" : "renew",
  );
  const [billingCycle, setBillingCycle] = useState<BillingCycle>("monthly");
  const defaultUpgrade =
    (SUBSCRIPTION_PLANS.find(
      (p) =>
        p.id !== "free" &&
        SUBSCRIPTION_PLANS.findIndex((x) => x.id === p.id) >
          SUBSCRIPTION_PLANS.findIndex((x) => x.id === currentPlanId),
    )?.id as PlanId | undefined) || "starter";
  const [selectedPlanId, setSelectedPlanId] = useState<PlanId>(defaultUpgrade);

  return (
    <div className="fixed inset-0 z-[80] bg-black/60 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-5 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="font-bold text-lg flex items-center gap-2">
                <Zap className="size-5 text-amber-500" /> Subscription
              </h3>
              <p className="text-sm text-slate-500 mt-1">
                Current:{" "}
                <span className="font-medium text-slate-700 dark:text-slate-200">{current.name}</span>
                {periodEnd ? ` · period ends ${periodEnd}` : ""}
              </p>
              <p className="text-xs text-slate-500 mt-0.5">
                Ads this period: {adsUsed}/{maxAds >= 99999 ? "∞" : maxAds}
                {status === "expired" ? " · period expired" : ""}
              </p>
            </div>
            {onClose && (
              <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-700 text-sm">
                Close
              </button>
            )}
          </div>
          <div className="flex gap-1 p-1 mt-3 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs">
            <button
              type="button"
              onClick={() => setMode("upgrade")}
              className={`flex-1 py-1.5 rounded-md transition ${
                mode === "upgrade" ? "bg-white dark:bg-slate-950 shadow-sm font-medium" : "text-slate-500"
              }`}
            >
              Upgrade plan
            </button>
            <button
              type="button"
              onClick={() => setMode("renew")}
              disabled={!canRenew}
              className={`flex-1 py-1.5 rounded-md transition flex items-center justify-center gap-1 ${
                mode === "renew" ? "bg-white dark:bg-slate-950 shadow-sm font-medium" : "text-slate-500"
              } disabled:opacity-40`}
              title={!canRenew ? "Free plan cannot be renewed — please upgrade" : "Reset period from today"}
            >
              <RefreshCw className="size-3" /> Renew current
            </button>
          </div>
        </div>

        <div className="p-5 space-y-4">
          {mode === "upgrade" ? (
            <>
              <PlanPicker
                role={role}
                selectedPlanId={selectedPlanId}
                billingCycle={billingCycle}
                onSelectPlan={setSelectedPlanId}
                onCycleChange={setBillingCycle}
                excludeFree
                minPlanId={currentPlanId === "free" ? undefined : currentPlanId}
                title={currentPlanId === "free" ? "Upgrade from Free" : "Select a higher plan"}
              />
              <button
                type="button"
                disabled={busy || selectedPlanId === currentPlanId || (!higherExists && currentPlanId !== "free")}
                onClick={() => void onUpgrade(selectedPlanId, billingCycle)}
                className="w-full py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 disabled:opacity-50"
              >
                Upgrade to {getPlan(selectedPlanId).name}
              </button>
            </>
          ) : (
            <>
              <div className="rounded-xl border border-slate-200 dark:border-slate-700 p-4 space-y-2">
                <p className="text-sm font-medium">Renew {current.name}</p>
                <p className="text-xs text-slate-500">
                  Renewing starts a new period from today (30 days monthly / 365 days annual), even if your current
                  period is not finished. Ad usage resets to 0. Free plan cannot be renewed.
                </p>
                {!isPaidPlan(currentPlanId) && (
                  <p className="text-xs text-amber-700 bg-amber-50 dark:bg-amber-950/30 rounded-lg px-2 py-1.5">
                    Free plan cannot be renewed. Please upgrade to a paid plan.
                  </p>
                )}
                <div className="flex p-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs w-fit">
                  {(["monthly", "annual"] as const).map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setBillingCycle(c)}
                      className={`px-2.5 py-1 rounded-md capitalize ${
                        billingCycle === c ? "bg-white dark:bg-slate-950 shadow-sm font-medium" : "text-slate-500"
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>
              <button
                type="button"
                disabled={busy || !canRenew}
                onClick={() => void onRenew(billingCycle)}
                className="w-full py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <RefreshCw className="size-4" /> Renew {current.name} now
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
