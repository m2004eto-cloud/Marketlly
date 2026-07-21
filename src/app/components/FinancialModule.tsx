import React, { useState, useMemo } from "react";
import {
  DollarSign, CreditCard, Receipt, TrendingUp, ArrowUpRight, ArrowDownRight,
  Users, Building2, ShieldCheck, Clock, CheckCircle2, XCircle, AlertTriangle,
  Plus, Search, Download, Eye, ChevronRight, X, Edit3, Trash2,
  Calendar, Star, Zap, RefreshCw, Bell, FileText, BarChart3, Info,
  Percent, Landmark, Smartphone, Package, ChevronDown, CheckSquare,
} from "lucide-react";
import { toast } from "sonner";

// ─── Types ────────────────────────────────────────────────────────────────────

type BillingCycle = "monthly" | "annual";

type Plan = {
  id: string;
  name: string;
  monthlyPrice: number;
  annualPrice: number;
  maxAds: number;
  features: string[];
  highlight: boolean;
  color: string;
  badge?: string;
};

type Subscription = {
  id: number;
  userId: number;
  userName: string;
  email: string;
  planId: string;
  status: "active" | "pending" | "cancelled" | "suspended";
  billingCycle: BillingCycle;
  startDate: string;
  renewalDate: string;
  paymentMethod: PaymentMethodKey;
  amount: number;
  autoRenew: boolean;
};

type InvoiceItem = {
  description: string;
  qty: number;
  unitPrice: number;
  vatAmount: number;
  total: number;
};

type Invoice = {
  id: number;
  number: string;
  userId: number;
  userName: string;
  email: string;
  buyerTrn?: string;
  date: string;
  dueDate: string;
  items: InvoiceItem[];
  status: "paid" | "pending" | "overdue" | "cancelled";
  paymentMethod?: PaymentMethodKey;
};

type Payment = {
  id: number;
  invoiceId: number;
  invoiceNumber: string;
  userName: string;
  amount: number;
  vatAmount: number;
  method: PaymentMethodKey;
  status: "successful" | "pending" | "failed" | "refunded";
  date: string;
  reference: string;
};

type VatPeriod = {
  label: string;
  start: string;
  end: string;
  outputTax: number;
  inputTax: number;
  net: number;
  status: "filed" | "due" | "upcoming";
};

type Payout = {
  id: number;
  dealerName: string;
  amount: number;
  requestDate: string;
  status: "pending" | "approved" | "paid" | "rejected";
  bankName: string;
  iban: string;
};

type PaymentMethodKey =
  | "visa" | "mastercard" | "amex"
  | "apple_pay" | "google_pay" | "samsung_pay"
  | "tabby" | "tamara"
  | "noon_pay" | "careem_pay" | "payby"
  | "bank_transfer" | "cash";

type FinancialTab = "overview" | "plans" | "subscriptions" | "invoices" | "payments" | "vat" | "payouts";

// ─── Constants ────────────────────────────────────────────────────────────────

const PLATFORM_TRN = "100432987654321";
const VAT_RATE = 0.05;

const PAYMENT_METHODS: Record<PaymentMethodKey, { label: string; color: string; bg: string }> = {
  visa:         { label: "Visa",          color: "text-blue-700",   bg: "bg-blue-50 dark:bg-blue-950/30" },
  mastercard:   { label: "Mastercard",    color: "text-red-700",    bg: "bg-red-50 dark:bg-red-950/30" },
  amex:         { label: "Amex",          color: "text-blue-800",   bg: "bg-blue-50 dark:bg-blue-950/30" },
  apple_pay:    { label: "Apple Pay",     color: "text-slate-800 dark:text-slate-200", bg: "bg-slate-100 dark:bg-slate-800" },
  google_pay:   { label: "Google Pay",    color: "text-emerald-700", bg: "bg-emerald-50 dark:bg-emerald-950/30" },
  samsung_pay:  { label: "Samsung Pay",   color: "text-blue-600",   bg: "bg-blue-50 dark:bg-blue-950/30" },
  tabby:        { label: "Tabby",         color: "text-green-700",  bg: "bg-green-50 dark:bg-green-950/30" },
  tamara:       { label: "Tamara",        color: "text-pink-700",   bg: "bg-pink-50 dark:bg-pink-950/30" },
  noon_pay:     { label: "Noon Pay",      color: "text-yellow-700", bg: "bg-yellow-50 dark:bg-yellow-950/30" },
  careem_pay:   { label: "Careem Pay",    color: "text-green-800",  bg: "bg-green-50 dark:bg-green-950/30" },
  payby:        { label: "PayBy",         color: "text-violet-700", bg: "bg-violet-50 dark:bg-violet-950/30" },
  bank_transfer:{ label: "Bank Transfer", color: "text-indigo-700", bg: "bg-indigo-50 dark:bg-indigo-950/30" },
  cash:         { label: "Cash",          color: "text-emerald-700", bg: "bg-emerald-50 dark:bg-emerald-950/30" },
};

// ─── Seed Data ────────────────────────────────────────────────────────────────

const PLANS: Plan[] = [
  {
    id: "free", name: "Free", monthlyPrice: 0, annualPrice: 0,
    maxAds: 5, highlight: false, color: "slate", badge: undefined,
    features: ["5 ads/month", "Basic listing", "Standard search placement", "Email support"],
  },
  {
    id: "starter", name: "Starter", monthlyPrice: 99, annualPrice: 990,
    maxAds: 20, highlight: false, color: "blue", badge: undefined,
    features: ["20 ads/month", "Featured badge", "Priority search placement", "Photo gallery up to 15 photos", "Chat support"],
  },
  {
    id: "pro", name: "Pro", monthlyPrice: 299, annualPrice: 2990,
    maxAds: 100, highlight: true, color: "violet", badge: "Most Popular",
    features: ["100 ads/month", "Homepage featured slot", "Premium search rank", "Unlimited photos", "Analytics dashboard", "Priority support", "Dedicated account page"],
  },
  {
    id: "enterprise", name: "Enterprise", monthlyPrice: 999, annualPrice: 9990,
    maxAds: 99999, highlight: false, color: "amber", badge: undefined,
    features: ["Unlimited ads", "Multiple homepage slots", "Top search rank always", "Branded dealer page", "API access", "Dedicated account manager", "Custom invoice branding", "VAT filing support"],
  },
];

const SUBSCRIPTIONS: Subscription[] = [
  { id: 1, userId: 3, userName: "Premium Motors LLC", email: "sales@premiummotors.ae", planId: "enterprise", status: "active", billingCycle: "annual", startDate: "2025-11-20", renewalDate: "2026-11-20", paymentMethod: "bank_transfer", amount: 9990, autoRenew: true },
  { id: 2, userId: 1, userName: "Ahmed Al Mansoori", email: "ahmed@example.ae", planId: "pro", status: "active", billingCycle: "monthly", startDate: "2026-01-15", renewalDate: "2026-08-15", paymentMethod: "visa", amount: 299, autoRenew: true },
  { id: 3, userId: 8, userName: "Tech Gadgets Store", email: "sales@techgadgets.ae", planId: "pro", status: "active", billingCycle: "annual", startDate: "2025-07-01", renewalDate: "2026-07-01", paymentMethod: "mastercard", amount: 2990, autoRenew: true },
  { id: 4, userId: 6, userName: "Gulf Auto Trade", email: "ops@gulfauto.ae", planId: "starter", status: "pending", billingCycle: "monthly", startDate: "2026-07-01", renewalDate: "2026-08-01", paymentMethod: "tabby", amount: 99, autoRenew: false },
  { id: 5, userId: 5, userName: "Layla Ibrahim", email: "layla@example.ae", planId: "starter", status: "active", billingCycle: "monthly", startDate: "2026-03-01", renewalDate: "2026-08-01", paymentMethod: "apple_pay", amount: 99, autoRenew: true },
  { id: 6, userId: 2, userName: "Sara Khan", email: "sara.k@example.com", planId: "free", status: "active", billingCycle: "monthly", startDate: "2026-01-04", renewalDate: "2026-08-04", paymentMethod: "cash", amount: 0, autoRenew: false },
  { id: 7, userId: 4, userName: "Omar Hassan", email: "omar@example.ae", planId: "starter", status: "cancelled", billingCycle: "monthly", startDate: "2026-02-18", renewalDate: "2026-03-18", paymentMethod: "google_pay", amount: 99, autoRenew: false },
];

const makeItems = (plan: Plan, cycle: BillingCycle): InvoiceItem[] => {
  const price = cycle === "annual" ? plan.annualPrice : plan.monthlyPrice;
  const net = parseFloat((price / 1.05).toFixed(2));
  const vat = parseFloat((price - net).toFixed(2));
  return [{ description: `${plan.name} Plan — ${cycle === "annual" ? "Annual" : "Monthly"} subscription`, qty: 1, unitPrice: net, vatAmount: vat, total: price }];
};

const INVOICES: Invoice[] = [
  { id: 1, number: "MKT-2026-0012", userId: 3, userName: "Premium Motors LLC", email: "sales@premiummotors.ae", buyerTrn: "100876543210001", date: "2026-07-01", dueDate: "2026-07-31", items: makeItems(PLANS[3], "annual"), status: "paid", paymentMethod: "bank_transfer" },
  { id: 2, number: "MKT-2026-0011", userId: 1, userName: "Ahmed Al Mansoori", email: "ahmed@example.ae", date: "2026-07-01", dueDate: "2026-07-15", items: makeItems(PLANS[2], "monthly"), status: "paid", paymentMethod: "visa" },
  { id: 3, number: "MKT-2026-0010", userId: 5, userName: "Layla Ibrahim", email: "layla@example.ae", date: "2026-07-01", dueDate: "2026-07-15", items: makeItems(PLANS[1], "monthly"), status: "paid", paymentMethod: "apple_pay" },
  { id: 4, number: "MKT-2026-0009", userId: 8, userName: "Tech Gadgets Store", email: "sales@techgadgets.ae", buyerTrn: "100765432109876", date: "2026-06-30", dueDate: "2026-07-14", items: makeItems(PLANS[2], "annual"), status: "pending", paymentMethod: undefined },
  { id: 5, number: "MKT-2026-0008", userId: 6, userName: "Gulf Auto Trade", email: "ops@gulfauto.ae", date: "2026-07-01", dueDate: "2026-07-08", items: makeItems(PLANS[1], "monthly"), status: "pending", paymentMethod: undefined },
  { id: 6, number: "MKT-2026-0007", userId: 7, userName: "Fatima Al Zaabi", email: "fatima.z@example.ae", date: "2026-06-01", dueDate: "2026-06-15", items: makeItems(PLANS[1], "monthly"), status: "overdue", paymentMethod: undefined },
  { id: 7, number: "MKT-2026-0006", userId: 3, userName: "Premium Motors LLC", email: "sales@premiummotors.ae", buyerTrn: "100876543210001", date: "2026-06-01", dueDate: "2026-06-30", items: makeItems(PLANS[3], "annual"), status: "paid", paymentMethod: "bank_transfer" },
];

const PAYMENTS: Payment[] = [
  { id: 1, invoiceId: 1, invoiceNumber: "MKT-2026-0012", userName: "Premium Motors LLC", amount: 9990, vatAmount: 475.71, method: "bank_transfer", status: "successful", date: "2026-07-02", reference: "TXN-AE-2026-88821" },
  { id: 2, invoiceId: 2, invoiceNumber: "MKT-2026-0011", userName: "Ahmed Al Mansoori", amount: 299, vatAmount: 14.24, method: "visa", status: "successful", date: "2026-07-01", reference: "TXN-AE-2026-88790" },
  { id: 3, invoiceId: 3, invoiceNumber: "MKT-2026-0010", userName: "Layla Ibrahim", amount: 99, vatAmount: 4.71, method: "apple_pay", status: "successful", date: "2026-07-01", reference: "TXN-AE-2026-88788" },
  { id: 4, invoiceId: 7, invoiceNumber: "MKT-2026-0006", userName: "Premium Motors LLC", amount: 9990, vatAmount: 475.71, method: "bank_transfer", status: "successful", date: "2026-06-01", reference: "TXN-AE-2026-77221" },
  { id: 5, invoiceId: 5, invoiceNumber: "MKT-2026-0008", userName: "Gulf Auto Trade", amount: 99, vatAmount: 4.71, method: "tabby", status: "pending", date: "2026-07-01", reference: "TXN-AE-2026-88812" },
  { id: 6, invoiceId: 6, invoiceNumber: "MKT-2026-0007", userName: "Fatima Al Zaabi", amount: 99, vatAmount: 4.71, method: "tamara", status: "failed", date: "2026-06-15", reference: "TXN-AE-2026-66901" },
];

const VAT_PERIODS: VatPeriod[] = [
  { label: "Q1 2026", start: "2026-01-01", end: "2026-03-31", outputTax: 6820.50, inputTax: 1250.00, net: 5570.50, status: "filed" },
  { label: "Q2 2026", start: "2026-04-01", end: "2026-06-30", outputTax: 8240.75, inputTax: 1480.00, net: 6760.75, status: "filed" },
  { label: "Q3 2026", start: "2026-07-01", end: "2026-09-30", outputTax: 2890.30, inputTax: 420.00, net: 2470.30, status: "due" },
  { label: "Q4 2026", start: "2026-10-01", end: "2026-12-31", outputTax: 0, inputTax: 0, net: 0, status: "upcoming" },
];

const PAYOUTS: Payout[] = [
  { id: 1, dealerName: "Premium Motors LLC", amount: 45200, requestDate: "2026-07-10", status: "pending", bankName: "Emirates NBD", iban: "AE070331234567890123456" },
  { id: 2, dealerName: "Gulf Auto Trade", amount: 8750, requestDate: "2026-07-08", status: "pending", bankName: "First Abu Dhabi Bank", iban: "AE280351234567890123456" },
  { id: 3, dealerName: "Tech Gadgets Store", amount: 22100, requestDate: "2026-06-30", status: "approved", bankName: "ADCB", iban: "AE330030001234567890123" },
  { id: 4, dealerName: "Ahmed Al Mansoori", amount: 6300, requestDate: "2026-06-25", status: "paid", bankName: "Mashreq Bank", iban: "AE490330001234567890123" },
];

// ─── Revenue data ─────────────────────────────────────────────────────────────

const MONTHLY_REVENUE = [32000, 38000, 41000, 35000, 44000, 52000, 48000, 55000, 51000, 62000, 58000, 67000];
const MONTHS = ["Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"];

// ─── Main Component ───────────────────────────────────────────────────────────

export function FinancialModule() {
  const [activeTab, setActiveTab] = useState<FinancialTab>("overview");
  const [subscriptions, setSubscriptions] = useState(SUBSCRIPTIONS);
  const [invoices, setInvoices] = useState(INVOICES);
  const [payments, setPayments] = useState(PAYMENTS);
  const [payouts, setPayouts] = useState(PAYOUTS);
  const [plans, setPlans] = useState(PLANS);
  const [viewInvoice, setViewInvoice] = useState<Invoice | null>(null);
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [editPlan, setEditPlan] = useState<Plan | null>(null);
  const [billingCycle, setBillingCycle] = useState<BillingCycle>("monthly");

  const totalRevenue = payments.filter((p) => p.status === "successful").reduce((s, p) => s + p.amount, 0);
  const totalVatCollected = payments.filter((p) => p.status === "successful").reduce((s, p) => s + p.vatAmount, 0);
  const mrr = subscriptions.filter((s) => s.status === "active" && s.billingCycle === "monthly").reduce((s, sub) => s + sub.amount, 0)
    + subscriptions.filter((s) => s.status === "active" && s.billingCycle === "annual").reduce((s, sub) => s + Math.round(sub.amount / 12), 0);
  const arr = mrr * 12;

  const tabs: { id: FinancialTab; label: string; icon: typeof DollarSign }[] = [
    { id: "overview", label: "Overview", icon: BarChart3 },
    { id: "plans", label: "Plans", icon: Package },
    { id: "subscriptions", label: "Subscriptions", icon: RefreshCw },
    { id: "invoices", label: "Invoices", icon: Receipt },
    { id: "payments", label: "Payments", icon: CreditCard },
    { id: "vat", label: "VAT", icon: Percent },
    { id: "payouts", label: "Payouts", icon: Landmark },
  ];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight flex items-center gap-2">
            <DollarSign className="size-5 text-blue-600" /> Financial Module
          </h2>
          <p className="text-sm text-slate-500 mt-0.5">UAE marketplace billing · VAT 5% · AED</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 px-2.5 py-1 rounded-full border border-emerald-200 dark:border-emerald-800">
            <ShieldCheck className="size-3.5" /> TRN: {PLATFORM_TRN}
          </div>
          <button onClick={() => toast("Generating financial report…")}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition">
            <Download className="size-3.5" /> Export
          </button>
        </div>
      </div>

      {/* Tab bar */}
      <div className="flex gap-0.5 p-1 rounded-xl bg-slate-100 dark:bg-slate-800 overflow-x-auto">
        {tabs.map((t) => (
          <button key={t.id} onClick={() => setActiveTab(t.id)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm transition whitespace-nowrap ${
              activeTab === t.id
                ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-sm font-medium"
                : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
            }`}>
            <t.icon className="size-3.5" /> {t.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {activeTab === "overview" && <FinancialOverview totalRevenue={totalRevenue} totalVat={totalVatCollected} mrr={mrr} arr={arr} payments={payments} subscriptions={subscriptions} />}
      {activeTab === "plans" && <PlansManager plans={plans} onSave={setPlans} billingCycle={billingCycle} onCycleChange={setBillingCycle} />}
      {activeTab === "subscriptions" && <SubscriptionsManager subscriptions={subscriptions} plans={plans} onChange={setSubscriptions} />}
      {activeTab === "invoices" && <InvoicesManager invoices={invoices} onView={setViewInvoice} plans={plans} />}
      {activeTab === "payments" && <PaymentsManager payments={payments} onChange={setPayments} />}
      {activeTab === "vat" && <VatManager periods={VAT_PERIODS} totalVat={totalVatCollected} />}
      {activeTab === "payouts" && <PayoutsManager payouts={payouts} onChange={setPayouts} />}

      {/* Invoice viewer modal */}
      {viewInvoice && <InvoiceModal invoice={viewInvoice} plans={plans} onClose={() => setViewInvoice(null)} />}
    </div>
  );
}

// ─── Overview ────────────────────────────────────────────────────────────────

function FinancialOverview({ totalRevenue, totalVat, mrr, arr, payments, subscriptions }: {
  totalRevenue: number; totalVat: number; mrr: number; arr: number;
  payments: Payment[]; subscriptions: Subscription[];
}) {
  const maxBar = Math.max(...MONTHLY_REVENUE);
  const methodCounts: Record<string, number> = {};
  payments.filter((p) => p.status === "successful").forEach((p) => {
    methodCounts[p.method] = (methodCounts[p.method] || 0) + p.amount;
  });
  const topMethods = Object.entries(methodCounts).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const totalMethodRev = topMethods.reduce((s, [, v]) => s + v, 0);

  return (
    <div className="space-y-5">
      {/* KPI row */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Revenue YTD", value: `AED ${totalRevenue.toLocaleString()}`, delta: "+34%", up: true, icon: TrendingUp, color: "emerald" },
          { label: "Monthly Recurring", value: `AED ${mrr.toLocaleString()}`, delta: "+18%", up: true, icon: RefreshCw, color: "blue" },
          { label: "Annual Run Rate", value: `AED ${arr.toLocaleString()}`, delta: "+18%", up: true, icon: BarChart3, color: "violet" },
          { label: "VAT Collected", value: `AED ${totalVat.toLocaleString()}`, delta: "5%", up: true, icon: Percent, color: "amber" },
        ].map((k) => {
          const colorMap: Record<string, string> = { emerald: "from-emerald-500 to-green-600", blue: "from-blue-500 to-blue-600", violet: "from-violet-500 to-purple-600", amber: "from-amber-500 to-orange-500" };
          return (
            <div key={k.label} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-slate-500">{k.label}</p>
                <span className={`size-8 rounded-lg bg-gradient-to-br ${colorMap[k.color]} text-white flex items-center justify-center`}>
                  <k.icon className="size-4" />
                </span>
              </div>
              <p className="mt-2 text-xl font-bold tabular-nums">{k.value}</p>
              <span className={`text-xs flex items-center gap-0.5 mt-1 font-medium ${k.up ? "text-emerald-600" : "text-rose-600"}`}>
                <ArrowUpRight className="size-3" /> {k.delta} vs last period
              </span>
            </div>
          );
        })}
      </div>

      {/* Revenue chart + method breakdown */}
      <div className="grid lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5">
          <p className="font-semibold mb-4 flex items-center gap-2"><TrendingUp className="size-4 text-blue-600" /> Monthly Revenue (AED)</p>
          <div className="flex items-end gap-1.5 h-40">
            {MONTHLY_REVENUE.map((v, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div className="relative w-full rounded-t-md overflow-hidden" style={{ height: `${(v / maxBar) * 136}px`, background: "linear-gradient(180deg, #3b82f6, #6366f1)" }} />
                <span className="text-[10px] text-slate-500">{MONTHS[i]}</span>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between mt-3 text-xs text-slate-500 border-t border-slate-100 dark:border-slate-800 pt-3">
            <span>Peak: AED {Math.max(...MONTHLY_REVENUE).toLocaleString()}</span>
            <span>Avg: AED {Math.round(MONTHLY_REVENUE.reduce((a, b) => a + b) / MONTHLY_REVENUE.length).toLocaleString()}/mo</span>
            <span>Net (ex-VAT): AED {Math.round(totalRevenue / 1.05).toLocaleString()}</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5">
          <p className="font-semibold mb-4 flex items-center gap-2"><CreditCard className="size-4 text-blue-600" /> Revenue by Method</p>
          <div className="space-y-3">
            {topMethods.map(([method, amt]) => {
              const m = PAYMENT_METHODS[method as PaymentMethodKey];
              const pct = (amt / totalMethodRev) * 100;
              return (
                <div key={method}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className={`font-medium ${m.color}`}>{m.label}</span>
                    <span className="text-slate-500 tabular-nums">AED {amt.toLocaleString()}</span>
                  </div>
                  <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-blue-500 to-violet-500" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
            <p className="text-xs text-slate-500">Active subscriptions</p>
            <p className="text-2xl font-bold tabular-nums mt-1">{subscriptions.filter((s) => s.status === "active").length}</p>
          </div>
        </div>
      </div>

      {/* Recent payments */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
        <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
          <CreditCard className="size-4 text-blue-600" />
          <p className="font-semibold">Recent Transactions</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800/50 text-xs uppercase text-slate-500 tracking-wide">
              <tr>
                <th className="text-start px-4 py-2.5">Reference</th>
                <th className="text-start px-4 py-2.5">Customer</th>
                <th className="text-start px-4 py-2.5">Method</th>
                <th className="text-start px-4 py-2.5">Date</th>
                <th className="text-end px-4 py-2.5">Amount</th>
                <th className="text-start px-4 py-2.5">Status</th>
              </tr>
            </thead>
            <tbody>
              {payments.slice(0, 6).map((p) => (
                <tr key={p.id} className="border-t border-slate-100 dark:border-slate-800 hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                  <td className="px-4 py-3 font-mono text-xs text-slate-500">{p.reference}</td>
                  <td className="px-4 py-3 font-medium">{p.userName}</td>
                  <td className="px-4 py-3"><PayMethodBadge method={p.method} /></td>
                  <td className="px-4 py-3 text-slate-500">{p.date}</td>
                  <td className="px-4 py-3 text-end font-bold tabular-nums">AED {p.amount.toLocaleString()}</td>
                  <td className="px-4 py-3"><PayStatusBadge status={p.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── Plans Manager ────────────────────────────────────────────────────────────

function PlansManager({ plans, onSave, billingCycle, onCycleChange }: {
  plans: Plan[]; onSave: (p: Plan[]) => void; billingCycle: BillingCycle; onCycleChange: (c: BillingCycle) => void;
}) {
  const [editModal, setEditModal] = useState<Plan | null>(null);
  const [newModal, setNewModal] = useState(false);

  const colorMap: Record<string, string> = {
    slate: "border-slate-300 dark:border-slate-700",
    blue: "border-blue-400 dark:border-blue-700",
    violet: "border-violet-500 dark:border-violet-700 ring-2 ring-violet-200 dark:ring-violet-900",
    amber: "border-amber-400 dark:border-amber-700",
  };
  const headerMap: Record<string, string> = {
    slate: "bg-slate-50 dark:bg-slate-800",
    blue: "bg-blue-50 dark:bg-blue-950/40",
    violet: "bg-gradient-to-br from-violet-600 to-purple-700 text-white",
    amber: "bg-amber-50 dark:bg-amber-950/40",
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex gap-1 p-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-sm">
          {(["monthly", "annual"] as const).map((c) => (
            <button key={c} onClick={() => onCycleChange(c)}
              className={`px-4 py-1.5 rounded-md capitalize transition ${billingCycle === c ? "bg-white dark:bg-slate-900 shadow-sm font-medium" : "text-slate-500"}`}>
              {c}
              {c === "annual" && <span className="ms-1.5 text-[10px] bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 px-1.5 py-0.5 rounded-full font-bold">Save 17%</span>}
            </button>
          ))}
        </div>
        <button onClick={() => setNewModal(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 text-white text-sm hover:bg-blue-700 transition">
          <Plus className="size-3.5" /> New Plan
        </button>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {plans.map((plan) => {
          const price = billingCycle === "annual" ? plan.annualPrice : plan.monthlyPrice;
          const vatAmt = parseFloat((price * VAT_RATE / (1 + VAT_RATE)).toFixed(2));
          const net = price - vatAmt;
          return (
            <div key={plan.id} className={`rounded-xl border-2 overflow-hidden flex flex-col ${colorMap[plan.color]}`}>
              <div className={`p-4 ${headerMap[plan.color]}`}>
                {plan.badge && (
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full mb-2 inline-block ${plan.color === "violet" ? "bg-white/20 text-white" : "bg-violet-100 text-violet-700"}`}>
                    {plan.badge}
                  </span>
                )}
                <p className={`text-lg font-bold ${plan.color === "violet" ? "text-white" : ""}`}>{plan.name}</p>
                <div className={`mt-2 ${plan.color === "violet" ? "text-white" : ""}`}>
                  {price === 0 ? (
                    <p className="text-3xl font-black">Free</p>
                  ) : (
                    <>
                      <p className="text-3xl font-black tabular-nums">AED {price.toLocaleString()}</p>
                      <p className={`text-xs mt-0.5 ${plan.color === "violet" ? "text-white/70" : "text-slate-500"}`}>
                        /{billingCycle} · Net AED {net.toFixed(2)} + AED {vatAmt.toFixed(2)} VAT
                      </p>
                    </>
                  )}
                </div>
              </div>
              <div className="p-4 flex-1 bg-white dark:bg-slate-900 space-y-2">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Includes</p>
                {plan.features.map((f) => (
                  <div key={f} className="flex items-start gap-2 text-sm">
                    <CheckCircle2 className="size-3.5 text-emerald-500 shrink-0 mt-0.5" />
                    <span>{f}</span>
                  </div>
                ))}
              </div>
              <div className="px-4 pb-4 bg-white dark:bg-slate-900 flex gap-2">
                <button onClick={() => setEditModal(plan)}
                  className="flex-1 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition flex items-center justify-center gap-1">
                  <Edit3 className="size-3" /> Edit
                </button>
                {plan.id !== "free" && (
                  <button onClick={() => toast(`Plan "${plan.name}" archived`)}
                    className="py-1.5 px-2.5 text-xs rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 transition flex items-center justify-center">
                    <Trash2 className="size-3" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Features comparison table */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800">
          <p className="font-semibold">Plan Comparison Matrix</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800/50 text-xs uppercase text-slate-500 tracking-wide">
              <tr>
                <th className="text-start px-4 py-2.5 w-40">Feature</th>
                {plans.map((p) => <th key={p.id} className="px-4 py-2.5 text-center">{p.name}</th>)}
              </tr>
            </thead>
            <tbody>
              {[
                { label: "Max Ads/Month", values: ["5", "20", "100", "Unlimited"] },
                { label: "Featured Badge", values: [false, true, true, true] },
                { label: "Priority Search", values: [false, true, true, true] },
                { label: "Analytics", values: [false, false, true, true] },
                { label: "Account Manager", values: [false, false, false, true] },
                { label: "API Access", values: [false, false, false, true] },
                { label: "VAT Support", values: [false, false, false, true] },
                { label: "Price (Monthly)", values: ["Free", "AED 99", "AED 299", "AED 999"] },
              ].map((row) => (
                <tr key={row.label} className="border-t border-slate-100 dark:border-slate-800">
                  <td className="px-4 py-2.5 font-medium text-slate-700 dark:text-slate-300">{row.label}</td>
                  {row.values.map((v, i) => (
                    <td key={i} className="px-4 py-2.5 text-center">
                      {typeof v === "boolean" ? (
                        v ? <CheckCircle2 className="size-4 text-emerald-500 mx-auto" /> : <XCircle className="size-4 text-slate-300 dark:text-slate-600 mx-auto" />
                      ) : (
                        <span className="text-slate-700 dark:text-slate-300">{v}</span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Plan edit modal */}
      {(editModal || newModal) && (
        <PlanModal
          plan={editModal}
          onSave={(updated) => {
            if (editModal) {
              onSave(plans.map((p) => (p.id === updated.id ? updated : p)));
            } else {
              onSave([...plans, { ...updated, id: `plan-${Date.now()}` }]);
            }
            setEditModal(null);
            setNewModal(false);
            toast.success(editModal ? "Plan updated" : "Plan created");
          }}
          onClose={() => { setEditModal(null); setNewModal(false); }}
        />
      )}
    </div>
  );
}

function PlanModal({ plan, onSave, onClose }: { plan: Plan | null; onSave: (p: Plan) => void; onClose: () => void }) {
  const [form, setForm] = useState<Plan>(plan || {
    id: "", name: "", monthlyPrice: 0, annualPrice: 0,
    maxAds: 10, highlight: false, color: "blue", badge: "",
    features: [""],
  });
  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 w-full max-w-lg p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-lg">{plan ? `Edit Plan: ${plan.name}` : "Create New Plan"}</h3>
          <button onClick={onClose}><X className="size-5 text-slate-400" /></button>
        </div>
        <div className="space-y-3">
          {[
            { label: "Plan Name", key: "name" as const, type: "text" },
            { label: "Monthly Price (AED incl. VAT)", key: "monthlyPrice" as const, type: "number" },
            { label: "Annual Price (AED incl. VAT)", key: "annualPrice" as const, type: "number" },
            { label: "Max Ads / Month", key: "maxAds" as const, type: "number" },
          ].map((f) => (
            <div key={f.key}>
              <label className="text-xs font-medium text-slate-600 dark:text-slate-400 block mb-1">{f.label}</label>
              <input type={f.type} value={String(form[f.key])}
                onChange={(e) => setForm({ ...form, [f.key]: f.type === "number" ? Number(e.target.value) : e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 outline-none focus:border-blue-500" />
            </div>
          ))}
          <div>
            <label className="text-xs font-medium text-slate-600 dark:text-slate-400 block mb-1">Badge (optional)</label>
            <input value={form.badge || ""} onChange={(e) => setForm({ ...form, badge: e.target.value })}
              placeholder="e.g. Most Popular"
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 outline-none focus:border-blue-500" />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-600 dark:text-slate-400 block mb-1">Features (one per line)</label>
            <textarea rows={4} value={form.features.join("\n")}
              onChange={(e) => setForm({ ...form, features: e.target.value.split("\n").filter(Boolean) })}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 outline-none focus:border-blue-500 resize-none" />
          </div>
          <div className="flex items-center gap-3">
            <label className="text-sm flex items-center gap-2">
              <input type="checkbox" checked={form.highlight} onChange={(e) => setForm({ ...form, highlight: e.target.checked })} className="rounded" />
              Highlight (featured)
            </label>
          </div>
          <div className="flex gap-2 pt-2">
            <button onClick={() => onSave(form)}
              className="flex-1 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition">
              {plan ? "Save Changes" : "Create Plan"}
            </button>
            <button onClick={onClose}
              className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition">
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Subscriptions ────────────────────────────────────────────────────────────

function SubscriptionsManager({ subscriptions, plans, onChange }: {
  subscriptions: Subscription[]; plans: Plan[]; onChange: (s: Subscription[]) => void;
}) {
  const [filter, setFilter] = useState<"all" | "active" | "pending" | "cancelled">("all");

  const filtered = subscriptions.filter((s) => filter === "all" || s.status === filter);

  const statusAction = (id: number, status: Subscription["status"]) => {
    onChange(subscriptions.map((s) => (s.id === id ? { ...s, status } : s)));
    toast.success(`Subscription ${status}`);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2 items-center">
        <div className="flex gap-1 p-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-sm">
          {(["all", "active", "pending", "cancelled"] as const).map((s) => (
            <button key={s} onClick={() => setFilter(s)}
              className={`px-3 py-1.5 rounded-md capitalize transition ${filter === s ? "bg-white dark:bg-slate-900 shadow-sm font-medium" : "text-slate-500"}`}>
              {s}
            </button>
          ))}
        </div>
        <div className="ms-auto flex gap-2">
          <button onClick={() => toast("Assigning plan…")}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 text-white text-sm hover:bg-blue-700 transition">
            <Plus className="size-3.5" /> Assign Plan
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 dark:bg-slate-800/50 text-xs uppercase text-slate-500 tracking-wide">
            <tr>
              <th className="text-start px-4 py-2.5">User</th>
              <th className="text-start px-4 py-2.5">Plan</th>
              <th className="text-start px-4 py-2.5">Billing</th>
              <th className="text-start px-4 py-2.5">Renewal</th>
              <th className="text-start px-4 py-2.5">Method</th>
              <th className="text-end px-4 py-2.5">Amount</th>
              <th className="text-start px-4 py-2.5">Status</th>
              <th className="text-end px-4 py-2.5">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((sub) => {
              const plan = plans.find((p) => p.id === sub.planId);
              return (
                <tr key={sub.id} className="border-t border-slate-100 dark:border-slate-800 hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                  <td className="px-4 py-3">
                    <p className="font-medium">{sub.userName}</p>
                    <p className="text-xs text-slate-500">{sub.email}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                      sub.planId === "enterprise" ? "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300" :
                      sub.planId === "pro" ? "bg-violet-100 text-violet-700 dark:bg-violet-950/40 dark:text-violet-300" :
                      sub.planId === "starter" ? "bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300" :
                      "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                    }`}>
                      {plan?.name || sub.planId}
                    </span>
                  </td>
                  <td className="px-4 py-3 capitalize text-slate-500">{sub.billingCycle}</td>
                  <td className="px-4 py-3 text-slate-500">{sub.renewalDate}</td>
                  <td className="px-4 py-3"><PayMethodBadge method={sub.paymentMethod} /></td>
                  <td className="px-4 py-3 text-end font-bold tabular-nums">
                    {sub.amount === 0 ? "Free" : `AED ${sub.amount.toLocaleString()}`}
                  </td>
                  <td className="px-4 py-3"><SubStatusBadge status={sub.status} /></td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      {sub.status === "active" && (
                        <button onClick={() => statusAction(sub.id, "suspended")}
                          className="text-xs px-2 py-1 rounded border border-amber-200 text-amber-700 hover:bg-amber-50 transition">Pause</button>
                      )}
                      {sub.status === "pending" && (
                        <button onClick={() => statusAction(sub.id, "active")}
                          className="text-xs px-2 py-1 rounded border border-emerald-200 text-emerald-700 hover:bg-emerald-50 transition">Activate</button>
                      )}
                      {sub.status !== "cancelled" && (
                        <button onClick={() => statusAction(sub.id, "cancelled")}
                          className="text-xs px-2 py-1 rounded border border-rose-200 text-rose-600 hover:bg-rose-50 transition">Cancel</button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Invoices ─────────────────────────────────────────────────────────────────

function InvoicesManager({ invoices, onView, plans }: { invoices: Invoice[]; onView: (inv: Invoice) => void; plans: Plan[] }) {
  const [statusFilter, setStatusFilter] = useState<"all" | Invoice["status"]>("all");
  const filtered = invoices.filter((i) => statusFilter === "all" || i.status === statusFilter);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2 items-center">
        <div className="flex gap-1 p-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-sm">
          {(["all", "paid", "pending", "overdue"] as const).map((s) => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-md capitalize transition ${statusFilter === s ? "bg-white dark:bg-slate-900 shadow-sm font-medium" : "text-slate-500"}`}>
              {s}
            </button>
          ))}
        </div>
        <button onClick={() => toast("Generating invoice…")}
          className="ms-auto flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 text-white text-sm hover:bg-blue-700 transition">
          <Plus className="size-3.5" /> New Invoice
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 dark:bg-slate-800/50 text-xs uppercase text-slate-500 tracking-wide">
            <tr>
              <th className="text-start px-4 py-2.5">Invoice #</th>
              <th className="text-start px-4 py-2.5">Customer</th>
              <th className="text-start px-4 py-2.5">TRN</th>
              <th className="text-start px-4 py-2.5">Date</th>
              <th className="text-start px-4 py-2.5">Due</th>
              <th className="text-end px-4 py-2.5">Amount</th>
              <th className="text-end px-4 py-2.5">VAT (5%)</th>
              <th className="text-start px-4 py-2.5">Status</th>
              <th className="text-end px-4 py-2.5">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((inv) => {
              const total = inv.items.reduce((s, i) => s + i.total, 0);
              const vatTotal = inv.items.reduce((s, i) => s + i.vatAmount, 0);
              return (
                <tr key={inv.id} className="border-t border-slate-100 dark:border-slate-800 hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                  <td className="px-4 py-3 font-mono font-semibold text-blue-600">{inv.number}</td>
                  <td className="px-4 py-3">
                    <p className="font-medium">{inv.userName}</p>
                    <p className="text-xs text-slate-500">{inv.email}</p>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-slate-500">{inv.buyerTrn || "—"}</td>
                  <td className="px-4 py-3 text-slate-500">{inv.date}</td>
                  <td className="px-4 py-3 text-slate-500">{inv.dueDate}</td>
                  <td className="px-4 py-3 text-end font-bold tabular-nums">AED {total.toLocaleString()}</td>
                  <td className="px-4 py-3 text-end text-slate-500 tabular-nums">AED {vatTotal.toFixed(2)}</td>
                  <td className="px-4 py-3"><InvStatusBadge status={inv.status} /></td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      <button onClick={() => onView(inv)} className="size-7 rounded-md flex items-center justify-center text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition" title="View">
                        <Eye className="size-4" />
                      </button>
                      <button onClick={() => toast(`Downloading ${inv.number}.pdf`)} className="size-7 rounded-md flex items-center justify-center text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition" title="Download PDF">
                        <Download className="size-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Invoice Modal ────────────────────────────────────────────────────────────

function InvoiceModal({ invoice, plans, onClose }: { invoice: Invoice; plans: Plan[]; onClose: () => void }) {
  const total = invoice.items.reduce((s, i) => s + i.total, 0);
  const subtotal = invoice.items.reduce((s, i) => s + i.unitPrice * i.qty, 0);
  const vatTotal = invoice.items.reduce((s, i) => s + i.vatAmount, 0);

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Invoice header */}
        <div className="bg-gradient-to-br from-slate-900 to-blue-950 text-white p-6 rounded-t-2xl">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-2xl font-black tracking-tight">MARKETLY</p>
              <p className="text-white/60 text-sm">Marketly FZ LLC</p>
              <p className="text-white/60 text-xs mt-1">Dubai Multi Commodities Centre, UAE</p>
              <p className="text-white/60 text-xs">TRN: {PLATFORM_TRN}</p>
            </div>
            <div className="text-end">
              <p className="text-xs uppercase tracking-widest text-white/50 mb-1">Tax Invoice</p>
              <p className="text-xl font-bold">{invoice.number}</p>
              <div className="mt-2 space-y-0.5 text-xs text-white/70">
                <p>Date: {invoice.date}</p>
                <p>Due: {invoice.dueDate}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-5">
          {/* Bill to */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Bill To</p>
              <p className="font-semibold">{invoice.userName}</p>
              <p className="text-sm text-slate-500">{invoice.email}</p>
              {invoice.buyerTrn && <p className="text-xs text-slate-500 mt-1">TRN: {invoice.buyerTrn}</p>}
            </div>
            <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Payment Info</p>
              <InvStatusBadge status={invoice.status} />
              {invoice.paymentMethod && <div className="mt-1"><PayMethodBadge method={invoice.paymentMethod} /></div>}
            </div>
          </div>

          {/* Line items */}
          <div>
            <table className="w-full text-sm border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
              <thead className="bg-slate-50 dark:bg-slate-800 text-xs uppercase text-slate-500">
                <tr>
                  <th className="text-start px-3 py-2">Description</th>
                  <th className="text-center px-3 py-2">Qty</th>
                  <th className="text-end px-3 py-2">Unit Price</th>
                  <th className="text-end px-3 py-2">VAT 5%</th>
                  <th className="text-end px-3 py-2">Total</th>
                </tr>
              </thead>
              <tbody>
                {invoice.items.map((item, i) => (
                  <tr key={i} className="border-t border-slate-200 dark:border-slate-700">
                    <td className="px-3 py-3 font-medium">{item.description}</td>
                    <td className="px-3 py-3 text-center text-slate-500">{item.qty}</td>
                    <td className="px-3 py-3 text-end tabular-nums">AED {item.unitPrice.toFixed(2)}</td>
                    <td className="px-3 py-3 text-end tabular-nums text-amber-600">AED {item.vatAmount.toFixed(2)}</td>
                    <td className="px-3 py-3 text-end tabular-nums font-bold">AED {item.total.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="flex justify-end">
            <div className="w-60 space-y-2 text-sm">
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Subtotal (ex-VAT)</span>
                <span className="tabular-nums">AED {subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-amber-600">
                <span>VAT (5%)</span>
                <span className="tabular-nums">AED {vatTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold text-lg border-t border-slate-200 dark:border-slate-700 pt-2">
                <span>Total (incl. VAT)</span>
                <span className="tabular-nums">AED {total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="text-xs text-slate-500 border-t border-slate-100 dark:border-slate-800 pt-3">
            <p>This is a valid UAE Tax Invoice in accordance with Federal Tax Authority requirements.</p>
            <p className="mt-0.5">VAT Registration No: {PLATFORM_TRN} · UAE Federal Tax Authority</p>
          </div>

          <div className="flex gap-2">
            <button onClick={() => toast(`Downloading ${invoice.number}.pdf`)}
              className="flex-1 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition flex items-center justify-center gap-2">
              <Download className="size-4" /> Download PDF
            </button>
            <button onClick={onClose}
              className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition">
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Payments Manager ─────────────────────────────────────────────────────────

function PaymentsManager({ payments, onChange }: { payments: Payment[]; onChange: (p: Payment[]) => void }) {
  const [methodFilter, setMethodFilter] = useState<"all" | PaymentMethodKey>("all");
  const [statusFilter, setStatusFilter] = useState<"all" | Payment["status"]>("all");

  const filtered = payments.filter((p) =>
    (methodFilter === "all" || p.method === methodFilter) &&
    (statusFilter === "all" || p.status === statusFilter)
  );

  const allMethods = [...new Set(payments.map((p) => p.method))];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2 items-center">
        <div className="flex gap-1 p-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-sm">
          {(["all", "successful", "pending", "failed", "refunded"] as const).map((s) => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-md capitalize transition ${statusFilter === s ? "bg-white dark:bg-slate-900 shadow-sm font-medium" : "text-slate-500"}`}>
              {s}
            </button>
          ))}
        </div>
        <select value={methodFilter} onChange={(e) => setMethodFilter(e.target.value as typeof methodFilter)}
          className="px-3 py-1.5 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 outline-none">
          <option value="all">All Methods</option>
          {allMethods.map((m) => <option key={m} value={m}>{PAYMENT_METHODS[m].label}</option>)}
        </select>
      </div>

      {/* Payment method info cards */}
      <div className="grid grid-cols-3 lg:grid-cols-6 gap-2">
        {[
          { key: "visa" as const, note: "Card" },
          { key: "mastercard" as const, note: "Card" },
          { key: "apple_pay" as const, note: "Wallet" },
          { key: "tabby" as const, note: "BNPL" },
          { key: "tamara" as const, note: "BNPL" },
          { key: "bank_transfer" as const, note: "Bank" },
        ].map(({ key, note }) => {
          const m = PAYMENT_METHODS[key];
          const count = payments.filter((p) => p.method === key && p.status === "successful").length;
          return (
            <div key={key} className={`p-2.5 rounded-lg border text-center ${m.bg} border-current/10`}>
              <p className={`text-xs font-bold ${m.color}`}>{m.label}</p>
              <p className="text-[10px] text-slate-500">{note}</p>
              <p className="text-lg font-black tabular-nums mt-0.5">{count}</p>
            </div>
          );
        })}
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 dark:bg-slate-800/50 text-xs uppercase text-slate-500 tracking-wide">
            <tr>
              <th className="text-start px-4 py-2.5">Reference</th>
              <th className="text-start px-4 py-2.5">Invoice</th>
              <th className="text-start px-4 py-2.5">Customer</th>
              <th className="text-start px-4 py-2.5">Method</th>
              <th className="text-start px-4 py-2.5">Date</th>
              <th className="text-end px-4 py-2.5">Amount</th>
              <th className="text-end px-4 py-2.5">VAT</th>
              <th className="text-start px-4 py-2.5">Status</th>
              <th className="text-end px-4 py-2.5">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => (
              <tr key={p.id} className="border-t border-slate-100 dark:border-slate-800 hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                <td className="px-4 py-3 font-mono text-xs text-slate-500">{p.reference}</td>
                <td className="px-4 py-3 font-mono text-xs text-blue-600">{p.invoiceNumber}</td>
                <td className="px-4 py-3 font-medium">{p.userName}</td>
                <td className="px-4 py-3"><PayMethodBadge method={p.method} /></td>
                <td className="px-4 py-3 text-slate-500">{p.date}</td>
                <td className="px-4 py-3 text-end font-bold tabular-nums">AED {p.amount.toLocaleString()}</td>
                <td className="px-4 py-3 text-end text-slate-500 tabular-nums">AED {p.vatAmount.toFixed(2)}</td>
                <td className="px-4 py-3"><PayStatusBadge status={p.status} /></td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-1">
                    {p.status === "successful" && (
                      <button onClick={() => { onChange(payments.map((x) => x.id === p.id ? { ...x, status: "refunded" } : x)); toast("Refund initiated"); }}
                        className="text-xs px-2 py-1 rounded border border-rose-200 text-rose-600 hover:bg-rose-50 transition">Refund</button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── VAT Manager ─────────────────────────────────────────────────────────────

function VatManager({ periods, totalVat }: { periods: VatPeriod[]; totalVat: number }) {
  const [trn, setTrn] = useState(PLATFORM_TRN);
  const [editTrn, setEditTrn] = useState(false);

  const ytdOutput = periods.reduce((s, p) => s + p.outputTax, 0);
  const ytdInput = periods.reduce((s, p) => s + p.inputTax, 0);
  const ytdNet = periods.reduce((s, p) => s + p.net, 0);

  return (
    <div className="space-y-5">
      {/* VAT config */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5">
        <div className="flex items-center gap-2 mb-4">
          <Percent className="size-4 text-blue-600" />
          <p className="font-semibold">UAE VAT Configuration</p>
          <span className="ms-auto text-xs bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300 px-2 py-0.5 rounded-full font-bold">5% Standard Rate</span>
        </div>
        <div className="grid sm:grid-cols-3 gap-4">
          <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950/30">
            <p className="text-xs text-blue-600 font-semibold uppercase tracking-wide">VAT Rate</p>
            <p className="text-3xl font-black text-blue-700 dark:text-blue-300 mt-1">5%</p>
            <p className="text-xs text-blue-600/70">UAE Federal Tax Authority</p>
          </div>
          <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 col-span-2">
            <p className="text-xs text-slate-500 font-semibold uppercase tracking-wide mb-2">Tax Registration Number (TRN)</p>
            <div className="flex items-center gap-2">
              {editTrn ? (
                <>
                  <input value={trn} onChange={(e) => setTrn(e.target.value)}
                    className="flex-1 font-mono px-3 py-1.5 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 outline-none focus:border-blue-500" />
                  <button onClick={() => { setEditTrn(false); toast.success("TRN updated"); }}
                    className="px-3 py-1.5 text-sm rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition">Save</button>
                </>
              ) : (
                <>
                  <p className="font-mono font-bold text-lg text-slate-900 dark:text-slate-100">{trn}</p>
                  <button onClick={() => setEditTrn(true)} className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700 transition">
                    <Edit3 className="size-3.5 text-slate-400" />
                  </button>
                </>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-1">Format: 15 digits · Issued by UAE FTA</p>
          </div>
        </div>
      </div>

      {/* YTD summary */}
      <div className="grid sm:grid-cols-3 gap-4">
        {[
          { label: "Output Tax (Collected)", value: ytdOutput, color: "emerald", icon: ArrowUpRight },
          { label: "Input Tax (Reclaimable)", value: ytdInput, color: "blue", icon: ArrowDownRight },
          { label: "Net VAT Payable", value: ytdNet, color: "violet", icon: Percent },
        ].map((k) => {
          const colorMap: Record<string, string> = { emerald: "text-emerald-600", blue: "text-blue-600", violet: "text-violet-600" };
          const bgMap: Record<string, string> = { emerald: "bg-emerald-50 dark:bg-emerald-950/30", blue: "bg-blue-50 dark:bg-blue-950/30", violet: "bg-violet-50 dark:bg-violet-950/30" };
          return (
            <div key={k.label} className={`rounded-xl p-4 border ${bgMap[k.color]} border-current/10`}>
              <p className={`text-xs font-semibold uppercase tracking-wide ${colorMap[k.color]}`}>{k.label}</p>
              <p className={`text-2xl font-black tabular-nums mt-1 ${colorMap[k.color]}`}>AED {k.value.toLocaleString()}</p>
              <p className="text-xs text-slate-500 mt-0.5">Year to date 2026</p>
            </div>
          );
        })}
      </div>

      {/* Quarterly returns */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
        <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
          <Calendar className="size-4 text-blue-600" />
          <p className="font-semibold">VAT Return Schedule</p>
          <span className="ms-auto text-xs text-slate-500">Quarterly · Due 28 days after period end</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800/50 text-xs uppercase text-slate-500 tracking-wide">
              <tr>
                <th className="text-start px-4 py-2.5">Period</th>
                <th className="text-start px-4 py-2.5">Start</th>
                <th className="text-start px-4 py-2.5">End</th>
                <th className="text-end px-4 py-2.5">Output Tax</th>
                <th className="text-end px-4 py-2.5">Input Tax</th>
                <th className="text-end px-4 py-2.5">Net Payable</th>
                <th className="text-start px-4 py-2.5">Status</th>
                <th className="text-end px-4 py-2.5">Actions</th>
              </tr>
            </thead>
            <tbody>
              {periods.map((period) => (
                <tr key={period.label} className="border-t border-slate-100 dark:border-slate-800 hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                  <td className="px-4 py-3 font-bold">{period.label}</td>
                  <td className="px-4 py-3 text-slate-500">{period.start}</td>
                  <td className="px-4 py-3 text-slate-500">{period.end}</td>
                  <td className="px-4 py-3 text-end tabular-nums text-emerald-600 font-semibold">
                    {period.outputTax > 0 ? `AED ${period.outputTax.toFixed(2)}` : "—"}
                  </td>
                  <td className="px-4 py-3 text-end tabular-nums text-blue-600">
                    {period.inputTax > 0 ? `AED ${period.inputTax.toFixed(2)}` : "—"}
                  </td>
                  <td className="px-4 py-3 text-end tabular-nums font-bold">
                    {period.net > 0 ? `AED ${period.net.toFixed(2)}` : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${
                      period.status === "filed" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300" :
                      period.status === "due" ? "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300" :
                      "bg-slate-100 text-slate-500 dark:bg-slate-800"
                    }`}>{period.status}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end">
                      {period.status === "due" && (
                        <button onClick={() => toast.success("VAT return submitted to FTA")}
                          className="text-xs px-2 py-1 rounded border border-emerald-200 text-emerald-700 hover:bg-emerald-50 transition">File Return</button>
                      )}
                      {period.status === "filed" && (
                        <button onClick={() => toast(`Downloading ${period.label} return`)}
                          className="size-7 rounded-md flex items-center justify-center text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition">
                          <Download className="size-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex items-start gap-3 p-4 rounded-xl border border-blue-200 bg-blue-50 dark:bg-blue-950/30 dark:border-blue-800 text-sm">
        <Info className="size-4 text-blue-600 shrink-0 mt-0.5" />
        <p className="text-blue-700 dark:text-blue-300">
          UAE VAT is governed by Federal Law No. 8 of 2017. Standard rate is 5%. Tax returns are filed quarterly through the FTA portal (mytax.fta.gov.ae). Marketly automatically applies VAT on all taxable supplies including subscription plans.
        </p>
      </div>
    </div>
  );
}

// ─── Payouts ─────────────────────────────────────────────────────────────────

function PayoutsManager({ payouts, onChange }: { payouts: Payout[]; onChange: (p: Payout[]) => void }) {
  const update = (id: number, status: Payout["status"]) => {
    onChange(payouts.map((p) => (p.id === id ? { ...p, status } : p)));
    toast.success(`Payout ${status}`);
  };

  const UAE_BANKS = ["Emirates NBD", "First Abu Dhabi Bank (FAB)", "ADCB", "Mashreq Bank", "Dubai Islamic Bank", "Commercial Bank of Dubai"];

  return (
    <div className="space-y-4">
      <div className="grid sm:grid-cols-3 gap-4">
        {[
          { label: "Pending Payouts", value: payouts.filter((p) => p.status === "pending").length, color: "amber" },
          { label: "Total Pending (AED)", value: payouts.filter((p) => p.status === "pending").reduce((s, p) => s + p.amount, 0).toLocaleString(), color: "blue" },
          { label: "Paid This Month", value: payouts.filter((p) => p.status === "paid").reduce((s, p) => s + p.amount, 0).toLocaleString(), color: "emerald" },
        ].map((k) => {
          const colorMap: Record<string, string> = { amber: "bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300", blue: "bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300", emerald: "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300" };
          return (
            <div key={k.label} className={`p-4 rounded-xl border ${colorMap[k.color]}`}>
              <p className="text-xs font-semibold uppercase tracking-wide opacity-70">{k.label}</p>
              <p className="text-2xl font-black tabular-nums mt-1">{k.value}</p>
            </div>
          );
        })}
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-x-auto">
        <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
          <Landmark className="size-4 text-blue-600" />
          <p className="font-semibold">Dealer Payout Requests</p>
          <button onClick={() => toast("Creating payout request…")}
            className="ms-auto flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 text-white text-sm hover:bg-blue-700 transition">
            <Plus className="size-3.5" /> New Payout
          </button>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-slate-50 dark:bg-slate-800/50 text-xs uppercase text-slate-500 tracking-wide">
            <tr>
              <th className="text-start px-4 py-2.5">Dealer</th>
              <th className="text-start px-4 py-2.5">Bank</th>
              <th className="text-start px-4 py-2.5">IBAN</th>
              <th className="text-start px-4 py-2.5">Request Date</th>
              <th className="text-end px-4 py-2.5">Amount (AED)</th>
              <th className="text-start px-4 py-2.5">Status</th>
              <th className="text-end px-4 py-2.5">Actions</th>
            </tr>
          </thead>
          <tbody>
            {payouts.map((payout) => (
              <tr key={payout.id} className="border-t border-slate-100 dark:border-slate-800 hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                <td className="px-4 py-3 font-medium">{payout.dealerName}</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{payout.bankName}</td>
                <td className="px-4 py-3 font-mono text-xs text-slate-500">{payout.iban}</td>
                <td className="px-4 py-3 text-slate-500">{payout.requestDate}</td>
                <td className="px-4 py-3 text-end font-bold tabular-nums">AED {payout.amount.toLocaleString()}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${
                    payout.status === "paid" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300" :
                    payout.status === "approved" ? "bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300" :
                    payout.status === "pending" ? "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300" :
                    "bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300"
                  }`}>{payout.status}</span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-1">
                    {payout.status === "pending" && (
                      <>
                        <button onClick={() => update(payout.id, "approved")}
                          className="text-xs px-2 py-1 rounded border border-emerald-200 text-emerald-700 hover:bg-emerald-50 transition">Approve</button>
                        <button onClick={() => update(payout.id, "rejected")}
                          className="text-xs px-2 py-1 rounded border border-rose-200 text-rose-600 hover:bg-rose-50 transition">Reject</button>
                      </>
                    )}
                    {payout.status === "approved" && (
                      <button onClick={() => update(payout.id, "paid")}
                        className="text-xs px-2 py-1 rounded border border-blue-200 text-blue-700 hover:bg-blue-50 transition">Mark Paid</button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* UAE bank transfer info */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5">
        <p className="font-semibold mb-3 flex items-center gap-2"><Landmark className="size-4 text-blue-600" /> Supported UAE Banks</p>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
          {UAE_BANKS.map((bank) => (
            <div key={bank} className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-sm">
              <Landmark className="size-3.5 text-slate-400 shrink-0" />
              <span>{bank}</span>
            </div>
          ))}
        </div>
        <p className="text-xs text-slate-500 mt-3">Payouts processed via UAE IBAN · AE format · 2–3 business days</p>
      </div>
    </div>
  );
}

// ─── Badge Components ─────────────────────────────────────────────────────────

function PayMethodBadge({ method }: { method: PaymentMethodKey }) {
  const m = PAYMENT_METHODS[method];
  return (
    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${m.bg} ${m.color}`}>
      {m.label}
    </span>
  );
}

function PayStatusBadge({ status }: { status: Payment["status"] }) {
  const map: Record<Payment["status"], string> = {
    successful: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300",
    pending: "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300",
    failed: "bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300",
    refunded: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
  };
  return <span className={`text-xs font-medium px-2 py-0.5 rounded-full capitalize ${map[status]}`}>{status}</span>;
}

function InvStatusBadge({ status }: { status: Invoice["status"] }) {
  const map: Record<Invoice["status"], string> = {
    paid: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300",
    pending: "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300",
    overdue: "bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300",
    cancelled: "bg-slate-100 text-slate-500 dark:bg-slate-800",
  };
  return <span className={`text-xs font-medium px-2 py-0.5 rounded-full capitalize ${map[status]}`}>{status}</span>;
}

function SubStatusBadge({ status }: { status: Subscription["status"] }) {
  const map: Record<Subscription["status"], string> = {
    active: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300",
    pending: "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300",
    cancelled: "bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300",
    suspended: "bg-slate-100 text-slate-500 dark:bg-slate-800",
  };
  return <span className={`text-xs font-medium px-2 py-0.5 rounded-full capitalize ${map[status]}`}>{status}</span>;
}
