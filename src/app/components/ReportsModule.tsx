import React, { useState, useMemo } from "react";
import {
  BarChart3, TrendingUp, TrendingDown, FileText, Users, Flag, DollarSign,
  AlertTriangle, Activity, Download, Calendar, Filter, RefreshCw, Eye,
  CheckCircle2, XCircle, Clock, Search, ArrowUpRight, ArrowDownRight,
  Zap, Shield, Globe2, Database, Server, Cpu, HardDrive, Bell, Lock,
  Package, CreditCard, Receipt, Building2, UserCheck, Ban, Smartphone,
  Car, ChevronRight, ShieldAlert, PieChart, Layers, Info, MapPin,
  MessageCircle, Heart, MousePointerClick, Hash, Sliders,
} from "lucide-react";
import { toast } from "sonner";

// ─── Types ────────────────────────────────────────────────────────────────────

type ReportTab =
  | "overview"
  | "listings"
  | "users"
  | "financial"
  | "moderation"
  | "traffic"
  | "system"
  | "custom";

type DateRange = "7d" | "30d" | "90d" | "1y";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function seededRand(seed: number) {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

function generateSeries(base: number, days: number, variance: number, seedN: number) {
  const rnd = seededRand(seedN);
  return Array.from({ length: days }, (_, i) =>
    Math.max(1, Math.round(base + (rnd() - 0.45) * variance + i * (base * 0.005)))
  );
}

const EMIRATES = ["Dubai", "Abu Dhabi", "Sharjah", "Ajman", "RAK", "Fujairah", "UAQ"];
const CATEGORIES = ["Cars", "SUVs", "Motorcycles", "Electronics", "Mobiles", "Computers", "Furniture"];
const PAYMENT_METHODS = ["Visa/MC", "Apple Pay", "Bank Transfer", "Tabby", "Tamara", "Cash", "Google Pay"];

// ─── Main ────────────────────────────────────────────────────────────────────

export function ReportsModule() {
  const [tab, setTab] = useState<ReportTab>("overview");
  const [range, setRange] = useState<DateRange>("30d");

  const days = range === "7d" ? 7 : range === "30d" ? 30 : range === "90d" ? 90 : 365;

  const nav: { id: ReportTab; label: string; icon: typeof BarChart3; color: string }[] = [
    { id: "overview", label: "Overview", icon: BarChart3, color: "blue" },
    { id: "listings", label: "Listings", icon: FileText, color: "violet" },
    { id: "users", label: "Users", icon: Users, color: "emerald" },
    { id: "financial", label: "Financial", icon: DollarSign, color: "amber" },
    { id: "moderation", label: "Moderation", icon: Flag, color: "rose" },
    { id: "traffic", label: "Traffic", icon: Activity, color: "cyan" },
    { id: "system", label: "System", icon: Server, color: "slate" },
    { id: "custom", label: "Custom", icon: Sliders, color: "indigo" },
  ];

  const colorMap: Record<string, string> = {
    blue: "text-blue-600 bg-blue-50 dark:bg-blue-950/30",
    violet: "text-violet-600 bg-violet-50 dark:bg-violet-950/30",
    emerald: "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30",
    amber: "text-amber-600 bg-amber-50 dark:bg-amber-950/30",
    rose: "text-rose-600 bg-rose-50 dark:bg-rose-950/30",
    cyan: "text-cyan-600 bg-cyan-50 dark:bg-cyan-950/30",
    slate: "text-slate-600 bg-slate-100 dark:bg-slate-800",
    indigo: "text-indigo-600 bg-indigo-50 dark:bg-indigo-950/30",
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <BarChart3 className="size-5 text-blue-600" /> Reports & Intelligence
          </h2>
          <p className="text-sm text-slate-500 mt-0.5">Platform-wide analytics, moderation data, and system health</p>
        </div>
        <div className="flex gap-2 items-center flex-wrap">
          <div className="flex gap-1 p-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-sm">
            {(["7d", "30d", "90d", "1y"] as DateRange[]).map((r) => (
              <button key={r} onClick={() => setRange(r)}
                className={`px-3 py-1.5 rounded-md transition ${range === r ? "bg-white dark:bg-slate-900 shadow-sm font-semibold" : "text-slate-500 hover:text-slate-700"}`}>
                {r}
              </button>
            ))}
          </div>
          <button onClick={() => toast.success("Report exported as CSV")}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition">
            <Download className="size-3.5" /> Export
          </button>
          <button onClick={() => toast("Refreshed")}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition">
            <RefreshCw className="size-3.5" /> Refresh
          </button>
        </div>
      </div>

      {/* Sub-nav */}
      <div className="flex gap-1 overflow-x-auto pb-1">
        {nav.map((n) => (
          <button key={n.id} onClick={() => setTab(n.id)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm whitespace-nowrap transition font-medium ${
              tab === n.id
                ? `${colorMap[n.color]} border border-current/20`
                : "text-slate-500 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}>
            <n.icon className="size-3.5" /> {n.label}
          </button>
        ))}
      </div>

      {tab === "overview" && <OverviewReport days={days} range={range} />}
      {tab === "listings" && <ListingsReport days={days} range={range} />}
      {tab === "users" && <UsersReport days={days} range={range} />}
      {tab === "financial" && <FinancialReport days={days} range={range} />}
      {tab === "moderation" && <ModerationReport days={days} range={range} />}
      {tab === "traffic" && <TrafficReport days={days} range={range} />}
      {tab === "system" && <SystemReport />}
      {tab === "custom" && <CustomReportBuilder />}
    </div>
  );
}

// ─── Overview Report ──────────────────────────────────────────────────────────

function OverviewReport({ days, range }: { days: number; range: DateRange }) {
  const traffic = useMemo(() => generateSeries(3200, days, 1100, 101), [days]);
  const revenue = useMemo(() => generateSeries(18000, days, 8000, 202), [days]);
  const ads = useMemo(() => generateSeries(42, days, 22, 303), [days]);
  const signups = useMemo(() => generateSeries(12, days, 8, 404), [days]);

  const sumLast = (arr: number[]) => arr.reduce((a, b) => a + b, 0);
  const half = Math.floor(days / 2);
  const delta = (arr: number[]) => {
    const a = arr.slice(0, half).reduce((s, v) => s + v, 0);
    const b = arr.slice(half).reduce((s, v) => s + v, 0);
    const pct = ((b - a) / Math.max(1, a)) * 100;
    return { pct, up: pct >= 0 };
  };

  const kpis = [
    { label: "Total Traffic", value: sumLast(traffic).toLocaleString(), icon: Globe2, color: "blue", ...delta(traffic), unit: "visits" },
    { label: "Revenue", value: `AED ${(sumLast(revenue) / 1000).toFixed(1)}K`, icon: DollarSign, color: "emerald", ...delta(revenue), unit: "AED" },
    { label: "New Ads", value: sumLast(ads).toLocaleString(), icon: FileText, color: "violet", ...delta(ads), unit: "listings" },
    { label: "New Users", value: sumLast(signups).toLocaleString(), icon: Users, color: "amber", ...delta(signups), unit: "accounts" },
  ];

  const emRev = EMIRATES.map((e, i) => ({ name: e, value: Math.round(12000 + seededRand(i * 99)() * 80000) })).sort((a, b) => b.value - a.value);
  const catPerf = CATEGORIES.map((c, i) => ({ name: c, ads: Math.round(20 + seededRand(i * 77)() * 300), revenue: Math.round(5000 + seededRand(i * 55)() * 90000) })).sort((a, b) => b.ads - a.ads);

  return (
    <div className="space-y-5">
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((k) => (
          <KpiCard key={k.label} label={k.label} value={k.value} icon={k.icon} color={k.color} pct={k.pct} up={k.up} unit={k.unit} />
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5">
          <p className="font-semibold mb-4 flex items-center gap-2"><Activity className="size-4 text-blue-600" /> Platform traffic — {range}</p>
          <AreaChart data={traffic} color="#3b82f6" />
          <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs text-slate-500">
            <div><p className="text-base font-bold text-slate-900 dark:text-slate-100">{Math.round(sumLast(traffic) / days).toLocaleString()}</p><p>Avg/day</p></div>
            <div><p className="text-base font-bold text-slate-900 dark:text-slate-100">{Math.max(...traffic).toLocaleString()}</p><p>Peak day</p></div>
            <div><p className="text-base font-bold text-slate-900 dark:text-slate-100">{Math.min(...traffic).toLocaleString()}</p><p>Low day</p></div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5">
          <p className="font-semibold mb-4 flex items-center gap-2"><MapPin className="size-4 text-blue-600" /> Revenue by emirate</p>
          <div className="space-y-3">
            {emRev.map((e, i) => {
              const max = emRev[0].value;
              const pct = (e.value / max) * 100;
              const colors = ["bg-blue-500", "bg-violet-500", "bg-emerald-500", "bg-amber-500", "bg-rose-500", "bg-cyan-500", "bg-indigo-500"];
              return (
                <div key={e.name}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-600 dark:text-slate-400">{e.name}</span>
                    <span className="font-semibold tabular-nums">AED {e.value.toLocaleString()}</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div className={`h-full ${colors[i % colors.length]} rounded-full`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
          <Package className="size-4 text-violet-600" />
          <p className="font-semibold">Category performance</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800/50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="text-start px-5 py-2.5">Category</th>
                <th className="text-start px-5 py-2.5">New Ads</th>
                <th className="text-start px-5 py-2.5">Revenue</th>
                <th className="text-start px-5 py-2.5">Share</th>
                <th className="text-start px-5 py-2.5">Trend</th>
              </tr>
            </thead>
            <tbody>
              {catPerf.map((c, i) => {
                const totalRev = catPerf.reduce((s, x) => s + x.revenue, 0);
                const share = ((c.revenue / totalRev) * 100).toFixed(1);
                const trend = seededRand(i * 13)() > 0.45;
                return (
                  <tr key={c.name} className="border-t border-slate-100 dark:border-slate-800 hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                    <td className="px-5 py-3 font-medium">{c.name}</td>
                    <td className="px-5 py-3 tabular-nums">{c.ads}</td>
                    <td className="px-5 py-3 tabular-nums">AED {c.revenue.toLocaleString()}</td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                          <div className="h-full bg-violet-500 rounded-full" style={{ width: `${share}%` }} />
                        </div>
                        <span className="text-xs text-slate-500 w-10 text-end">{share}%</span>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <span className={`flex items-center gap-1 text-xs font-medium ${trend ? "text-emerald-600" : "text-rose-600"}`}>
                        {trend ? <ArrowUpRight className="size-3" /> : <ArrowDownRight className="size-3" />}
                        {(seededRand(i * 17)() * 18 + 1).toFixed(1)}%
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── Listings Report ──────────────────────────────────────────────────────────

function ListingsReport({ days, range }: { days: number; range: DateRange }) {
  const posted = useMemo(() => generateSeries(38, days, 18, 501), [days]);
  const approved = useMemo(() => posted.map((v) => Math.round(v * 0.85)), [posted]);
  const rejected = useMemo(() => posted.map((v) => Math.round(v * 0.08)), [posted]);
  const pending = useMemo(() => posted.map((v) => Math.round(v * 0.07)), [posted]);

  const total = posted.reduce((a, b) => a + b, 0);
  const approvedTotal = approved.reduce((a, b) => a + b, 0);
  const rejectedTotal = rejected.reduce((a, b) => a + b, 0);
  const pendingTotal = pending.reduce((a, b) => a + b, 0);

  const sources = [
    { label: "Customer", value: Math.round(total * 0.58), color: "#3b82f6" },
    { label: "Dealer", value: Math.round(total * 0.39), color: "#8b5cf6" },
    { label: "Admin", value: Math.round(total * 0.03), color: "#10b981" },
  ];

  const topCats = CATEGORIES.map((c, i) => ({ name: c, count: Math.round(20 + seededRand(i * 33)() * 180) })).sort((a, b) => b.count - a.count);
  const avgTimeToApprove = "2.4h";
  const autoApproveRate = "61%";

  return (
    <div className="space-y-5">
      <div className="grid sm:grid-cols-4 gap-4">
        <StatCard label="Total Posted" value={total} color="blue" icon={FileText} />
        <StatCard label="Approved" value={approvedTotal} color="emerald" icon={CheckCircle2} />
        <StatCard label="Rejected" value={rejectedTotal} color="rose" icon={XCircle} />
        <StatCard label="Pending" value={pendingTotal} color="amber" icon={Clock} />
      </div>

      <div className="grid lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5">
          <p className="font-semibold mb-1 flex items-center gap-2"><FileText className="size-4 text-violet-600" /> Daily listings — {range}</p>
          <p className="text-xs text-slate-500 mb-4">Posted vs Approved</p>
          <StackedBarChart data1={approved} data2={rejected} color1="#10b981" color2="#f43f5e" />
        </div>

        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5">
            <p className="font-semibold mb-3 text-sm">Listing sources</p>
            {sources.map((s) => (
              <div key={s.label} className="flex items-center gap-3 mb-2 last:mb-0">
                <span className="size-3 rounded-full shrink-0" style={{ background: s.color }} />
                <span className="flex-1 text-sm text-slate-600 dark:text-slate-400">{s.label}</span>
                <span className="font-semibold tabular-nums text-sm">{s.value}</span>
                <span className="text-xs text-slate-400 w-10 text-end">{((s.value / total) * 100).toFixed(0)}%</span>
              </div>
            ))}
          </div>
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4">
            <p className="font-semibold mb-3 text-sm">Moderation metrics</p>
            <div className="space-y-2 text-sm">
              <MetricRow label="Avg. time to approve" value={avgTimeToApprove} color="blue" />
              <MetricRow label="Auto-approve rate" value={autoApproveRate} color="emerald" />
              <MetricRow label="Approval rate" value={`${((approvedTotal / Math.max(1, total)) * 100).toFixed(1)}%`} color="violet" />
              <MetricRow label="Rejection rate" value={`${((rejectedTotal / Math.max(1, total)) * 100).toFixed(1)}%`} color="rose" />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5">
        <p className="font-semibold mb-4 flex items-center gap-2"><Package className="size-4 text-violet-600" /> Listings by category — {range}</p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {topCats.map((c, i) => {
            const max = topCats[0].count;
            const barColors = ["bg-blue-500", "bg-violet-500", "bg-emerald-500", "bg-amber-500", "bg-rose-500", "bg-cyan-500", "bg-indigo-500"];
            return (
              <div key={c.name} className="rounded-lg border border-slate-200 dark:border-slate-800 p-3">
                <p className="text-sm font-medium mb-2">{c.name}</p>
                <p className="text-2xl font-bold tabular-nums">{c.count}</p>
                <div className="mt-2 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div className={`h-full ${barColors[i % barColors.length]} rounded-full`} style={{ width: `${(c.count / max) * 100}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── Users Report ─────────────────────────────────────────────────────────────

function UsersReport({ days, range }: { days: number; range: DateRange }) {
  const signups = useMemo(() => generateSeries(14, days, 9, 601), [days]);
  const active = useMemo(() => generateSeries(280, days, 120, 602), [days]);
  const churned = useMemo(() => generateSeries(3, days, 2, 603), [days]);

  const totalSignups = signups.reduce((a, b) => a + b, 0);
  const avgDAU = Math.round(active.reduce((a, b) => a + b, 0) / days);
  const totalChurned = churned.reduce((a, b) => a + b, 0);
  const retentionRate = (((totalSignups - totalChurned) / Math.max(1, totalSignups)) * 100).toFixed(1);

  const kycDistribution = [
    { label: "KYC Verified", value: 68, color: "#10b981" },
    { label: "KYC Pending", value: 18, color: "#f59e0b" },
    { label: "No KYC", value: 14, color: "#94a3b8" },
  ];

  const roleDistribution = [
    { label: "Customers", value: 74, color: "#3b82f6" },
    { label: "Dealers", value: 24, color: "#8b5cf6" },
    { label: "Admins", value: 2, color: "#10b981" },
  ];

  const locationData = EMIRATES.map((e, i) => ({
    name: e,
    users: Math.round(80 + seededRand(i * 41)() * 600),
    dealers: Math.round(5 + seededRand(i * 71)() * 80),
  })).sort((a, b) => b.users - a.users);

  const cohortRetention = [
    { week: "Week 1", w1: 100, w2: 82, w4: 64, w8: 48 },
    { week: "Week 2", w1: 100, w2: 79, w4: 61, w8: 44 },
    { week: "Week 3", w1: 100, w2: 85, w4: 67, w8: 51 },
    { week: "Week 4", w1: 100, w2: 81, w4: 63, w8: 47 },
  ];

  return (
    <div className="space-y-5">
      <div className="grid sm:grid-cols-4 gap-4">
        <StatCard label="New Signups" value={totalSignups} color="blue" icon={UserCheck} />
        <StatCard label="Avg DAU" value={avgDAU} color="emerald" icon={Activity} />
        <StatCard label="Churned" value={totalChurned} color="rose" icon={Ban} />
        <StatCard label="Retention" value={`${retentionRate}%`} color="violet" icon={TrendingUp} isText />
      </div>

      <div className="grid lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5">
          <p className="font-semibold mb-4 flex items-center gap-2"><Users className="size-4 text-emerald-600" /> Daily signups vs DAU — {range}</p>
          <DualLineChart series1={signups} series2={active.map((v) => Math.round(v / 10))} color1="#10b981" color2="#3b82f6" label1="Signups" label2="DAU ÷10" />
        </div>

        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4">
            <p className="font-semibold mb-3 text-sm">KYC distribution</p>
            {kycDistribution.map((d) => (
              <div key={d.label} className="flex items-center gap-2 mb-2 last:mb-0 text-sm">
                <span className="size-3 rounded-full shrink-0" style={{ background: d.color }} />
                <span className="flex-1 text-slate-600 dark:text-slate-400">{d.label}</span>
                <span className="font-semibold">{d.value}%</span>
                <div className="w-16 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${d.value}%`, background: d.color }} />
                </div>
              </div>
            ))}
          </div>
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4">
            <p className="font-semibold mb-3 text-sm">Role distribution</p>
            {roleDistribution.map((d) => (
              <div key={d.label} className="flex items-center gap-2 mb-2 last:mb-0 text-sm">
                <span className="size-3 rounded-full shrink-0" style={{ background: d.color }} />
                <span className="flex-1 text-slate-600 dark:text-slate-400">{d.label}</span>
                <span className="font-semibold">{d.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-5">
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
          <div className="px-5 py-3 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
            <MapPin className="size-4 text-emerald-600" />
            <p className="font-semibold">Users by emirate</p>
          </div>
          <table className="w-full text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800/50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="text-start px-5 py-2">Emirate</th>
                <th className="text-start px-5 py-2">Users</th>
                <th className="text-start px-5 py-2">Dealers</th>
                <th className="text-start px-5 py-2">Share</th>
              </tr>
            </thead>
            <tbody>
              {locationData.map((l) => {
                const total = locationData.reduce((s, x) => s + x.users, 0);
                const share = ((l.users / total) * 100).toFixed(1);
                return (
                  <tr key={l.name} className="border-t border-slate-100 dark:border-slate-800">
                    <td className="px-5 py-2.5 font-medium">{l.name}</td>
                    <td className="px-5 py-2.5 tabular-nums">{l.users}</td>
                    <td className="px-5 py-2.5 tabular-nums text-violet-600 font-medium">{l.dealers}</td>
                    <td className="px-5 py-2.5">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                          <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${share}%` }} />
                        </div>
                        <span className="text-xs text-slate-400 w-8 text-end">{share}%</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5">
          <p className="font-semibold mb-4 flex items-center gap-2"><Activity className="size-4 text-emerald-600" /> Cohort retention</p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs uppercase tracking-wide text-slate-500">
                  <th className="text-start py-2">Cohort</th>
                  <th className="text-center py-2">Week 1</th>
                  <th className="text-center py-2">Week 2</th>
                  <th className="text-center py-2">Week 4</th>
                  <th className="text-center py-2">Week 8</th>
                </tr>
              </thead>
              <tbody>
                {cohortRetention.map((c) => (
                  <tr key={c.week} className="border-t border-slate-100 dark:border-slate-800">
                    <td className="py-2.5 font-medium text-xs">{c.week}</td>
                    {[c.w1, c.w2, c.w4, c.w8].map((v, i) => {
                      const bg = v > 80 ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300" : v > 60 ? "bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300" : v > 40 ? "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300" : "bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300";
                      return <td key={i} className="text-center py-2.5 px-2"><span className={`text-xs px-2 py-0.5 rounded font-semibold ${bg}`}>{v}%</span></td>;
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Financial Report ─────────────────────────────────────────────────────────

function FinancialReport({ days, range }: { days: number; range: DateRange }) {
  const revenue = useMemo(() => generateSeries(22000, days, 10000, 701), [days]);
  const vatCollected = useMemo(() => revenue.map((v) => Math.round(v * 0.05)), [revenue]);

  const totalRevenue = revenue.reduce((a, b) => a + b, 0);
  const totalVat = vatCollected.reduce((a, b) => a + b, 0);
  const mrr = Math.round(totalRevenue / (days / 30));

  const paymentSplit = PAYMENT_METHODS.map((m, i) => ({
    method: m,
    amount: Math.round(5000 + seededRand(i * 23)() * 90000),
    count: Math.round(20 + seededRand(i * 37)() * 400),
  })).sort((a, b) => b.amount - a.amount);

  const totalPayments = paymentSplit.reduce((s, p) => s + p.amount, 0);

  const planBreakdown = [
    { plan: "Enterprise", mrr: 49950, users: 5, color: "#8b5cf6" },
    { plan: "Pro", mrr: 29900, users: 10, color: "#3b82f6" },
    { plan: "Starter", mrr: 9900, users: 10, color: "#10b981" },
    { plan: "Free", mrr: 0, users: 42, color: "#94a3b8" },
  ];

  return (
    <div className="space-y-5">
      <div className="grid sm:grid-cols-4 gap-4">
        <StatCard label={`Revenue (${range})`} value={`AED ${(totalRevenue / 1000).toFixed(1)}K`} color="emerald" icon={DollarSign} isText />
        <StatCard label="VAT Collected" value={`AED ${totalVat.toLocaleString()}`} color="amber" icon={Receipt} isText />
        <StatCard label="MRR" value={`AED ${mrr.toLocaleString()}`} color="blue" icon={TrendingUp} isText />
        <StatCard label="ARR (est.)" value={`AED ${(mrr * 12 / 1000).toFixed(0)}K`} color="violet" icon={Zap} isText />
      </div>

      <div className="grid lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5">
          <p className="font-semibold mb-1 flex items-center gap-2"><DollarSign className="size-4 text-emerald-600" /> Daily revenue — {range}</p>
          <p className="text-xs text-slate-500 mb-4">Revenue (green) · VAT 5% (amber)</p>
          <DualLineChart series1={revenue} series2={vatCollected} color1="#10b981" color2="#f59e0b" label1="Revenue" label2="VAT" />
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5">
          <p className="font-semibold mb-4 text-sm">Subscription plan MRR</p>
          {planBreakdown.map((p) => (
            <div key={p.plan} className="mb-3">
              <div className="flex justify-between text-sm mb-1">
                <span className="font-medium">{p.plan}</span>
                <span className="tabular-nums text-slate-600 dark:text-slate-400">{p.users} users</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${(p.mrr / 49950) * 100}%`, background: p.color }} />
                </div>
                <span className="text-xs font-semibold tabular-nums w-20 text-end">AED {p.mrr.toLocaleString()}</span>
              </div>
            </div>
          ))}
          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-between text-sm">
            <span className="font-semibold">Total MRR</span>
            <span className="font-bold text-emerald-600">AED {planBreakdown.reduce((s, p) => s + p.mrr, 0).toLocaleString()}</span>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
          <CreditCard className="size-4 text-emerald-600" />
          <p className="font-semibold">Payment method breakdown</p>
          <span className="ms-auto text-xs text-slate-500">AED {totalPayments.toLocaleString()} total</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800/50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="text-start px-5 py-2.5">Method</th>
                <th className="text-start px-5 py-2.5">Transactions</th>
                <th className="text-start px-5 py-2.5">Volume</th>
                <th className="text-start px-5 py-2.5">Share</th>
              </tr>
            </thead>
            <tbody>
              {paymentSplit.map((p) => {
                const share = ((p.amount / totalPayments) * 100).toFixed(1);
                return (
                  <tr key={p.method} className="border-t border-slate-100 dark:border-slate-800 hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                    <td className="px-5 py-3 font-medium">{p.method}</td>
                    <td className="px-5 py-3 tabular-nums">{p.count}</td>
                    <td className="px-5 py-3 tabular-nums">AED {p.amount.toLocaleString()}</td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                          <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${share}%` }} />
                        </div>
                        <span className="text-xs text-slate-500 w-10 text-end">{share}%</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── Moderation Report ────────────────────────────────────────────────────────

function ModerationReport({ days, range }: { days: number; range: DateRange }) {
  const reports = useMemo(() => generateSeries(4, days, 3, 801), [days]);
  const resolved = useMemo(() => reports.map((v) => Math.round(v * 0.75)), [reports]);

  const totalReports = reports.reduce((a, b) => a + b, 0);
  const totalResolved = resolved.reduce((a, b) => a + b, 0);
  const resolutionRate = ((totalResolved / Math.max(1, totalReports)) * 100).toFixed(1);
  const avgResolutionTime = "4.2h";

  const reportReasons = [
    { reason: "Fraudulent listing", count: Math.round(totalReports * 0.28), severity: "high" },
    { reason: "Misleading title/description", count: Math.round(totalReports * 0.22), severity: "medium" },
    { reason: "Duplicate ad", count: Math.round(totalReports * 0.19), severity: "low" },
    { reason: "Prohibited item", count: Math.round(totalReports * 0.14), severity: "high" },
    { reason: "Wrong category", count: Math.round(totalReports * 0.09), severity: "low" },
    { reason: "Suspicious pricing", count: Math.round(totalReports * 0.08), severity: "medium" },
  ].sort((a, b) => b.count - a.count);

  const actionsTaken = [
    { action: "Listing removed", count: Math.round(totalResolved * 0.38), color: "#f43f5e" },
    { action: "User warned", count: Math.round(totalResolved * 0.29), color: "#f59e0b" },
    { action: "Listing edited", count: Math.round(totalResolved * 0.19), color: "#3b82f6" },
    { action: "User banned", count: Math.round(totalResolved * 0.08), color: "#dc2626" },
    { action: "No action", count: Math.round(totalResolved * 0.06), color: "#94a3b8" },
  ];

  const severityBadge = (s: string) => {
    if (s === "high") return "bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400";
    if (s === "medium") return "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400";
    return "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400";
  };

  return (
    <div className="space-y-5">
      <div className="grid sm:grid-cols-4 gap-4">
        <StatCard label="Reports Filed" value={totalReports} color="rose" icon={Flag} />
        <StatCard label="Resolved" value={totalResolved} color="emerald" icon={CheckCircle2} />
        <StatCard label="Resolution Rate" value={`${resolutionRate}%`} color="blue" icon={Zap} isText />
        <StatCard label="Avg. Resolution" value={avgResolutionTime} color="amber" icon={Clock} isText />
      </div>

      <div className="grid lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5">
          <p className="font-semibold mb-4 flex items-center gap-2"><Flag className="size-4 text-rose-600" /> Reports vs Resolved — {range}</p>
          <DualLineChart series1={reports} series2={resolved} color1="#f43f5e" color2="#10b981" label1="Reports" label2="Resolved" />
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5">
          <p className="font-semibold mb-4 text-sm">Actions taken</p>
          {actionsTaken.map((a) => {
            const max = actionsTaken[0].count;
            return (
              <div key={a.action} className="mb-2.5">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-600 dark:text-slate-400">{a.action}</span>
                  <span className="font-semibold">{a.count}</span>
                </div>
                <div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${(a.count / max) * 100}%`, background: a.color }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
          <AlertTriangle className="size-4 text-rose-600" />
          <p className="font-semibold">Report reasons breakdown</p>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-slate-50 dark:bg-slate-800/50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="text-start px-5 py-2.5">Reason</th>
              <th className="text-start px-5 py-2.5">Severity</th>
              <th className="text-start px-5 py-2.5">Count</th>
              <th className="text-start px-5 py-2.5">Share</th>
            </tr>
          </thead>
          <tbody>
            {reportReasons.map((r) => (
              <tr key={r.reason} className="border-t border-slate-100 dark:border-slate-800 hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                <td className="px-5 py-3 font-medium">{r.reason}</td>
                <td className="px-5 py-3"><span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${severityBadge(r.severity)}`}>{r.severity}</span></td>
                <td className="px-5 py-3 tabular-nums">{r.count}</td>
                <td className="px-5 py-3">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-rose-500 rounded-full" style={{ width: `${(r.count / Math.max(1, totalReports)) * 100}%` }} />
                    </div>
                    <span className="text-xs text-slate-400 w-10 text-end">{((r.count / Math.max(1, totalReports)) * 100).toFixed(1)}%</span>
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

// ─── Traffic Report ───────────────────────────────────────────────────────────

function TrafficReport({ days, range }: { days: number; range: DateRange }) {
  const pageviews = useMemo(() => generateSeries(4200, days, 1800, 901), [days]);
  const sessions = useMemo(() => pageviews.map((v) => Math.round(v * 0.41)), [pageviews]);
  const bounces = useMemo(() => sessions.map((v) => Math.round(v * 0.32)), [sessions]);

  const totalPV = pageviews.reduce((a, b) => a + b, 0);
  const totalSessions = sessions.reduce((a, b) => a + b, 0);
  const avgSessionDuration = "3m 42s";
  const bounceRate = ((bounces.reduce((a, b) => a + b, 0) / Math.max(1, totalSessions)) * 100).toFixed(1);

  const topPages = [
    { path: "/", label: "Home", views: Math.round(totalPV * 0.31) },
    { path: "/browse", label: "Browse listings", views: Math.round(totalPV * 0.22) },
    { path: "/auction", label: "Auctions", views: Math.round(totalPV * 0.18) },
    { path: "/post", label: "Post an ad", views: Math.round(totalPV * 0.11) },
    { path: "/detail", label: "Listing detail", views: Math.round(totalPV * 0.09) },
    { path: "/auth", label: "Login / Register", views: Math.round(totalPV * 0.09) },
  ];

  const deviceSplit = [
    { label: "Mobile", value: 62, icon: Smartphone, color: "#3b82f6" },
    { label: "Desktop", value: 31, icon: Globe2, color: "#8b5cf6" },
    { label: "Tablet", value: 7, icon: Layers, color: "#10b981" },
  ];

  const sources = [
    { label: "Direct", value: 34 }, { label: "Organic Search", value: 28 },
    { label: "Social", value: 19 }, { label: "Referral", value: 12 }, { label: "Email", value: 7 },
  ];

  return (
    <div className="space-y-5">
      <div className="grid sm:grid-cols-4 gap-4">
        <StatCard label="Page Views" value={totalPV.toLocaleString()} color="cyan" icon={Eye} isText />
        <StatCard label="Sessions" value={totalSessions.toLocaleString()} color="blue" icon={Activity} isText />
        <StatCard label="Avg. Duration" value={avgSessionDuration} color="violet" icon={Clock} isText />
        <StatCard label="Bounce Rate" value={`${bounceRate}%`} color="amber" icon={MousePointerClick} isText />
      </div>

      <div className="grid lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5">
          <p className="font-semibold mb-4 flex items-center gap-2"><Activity className="size-4 text-cyan-600" /> Page views & sessions — {range}</p>
          <DualLineChart series1={pageviews} series2={sessions} color1="#06b6d4" color2="#8b5cf6" label1="Page Views" label2="Sessions" />
        </div>

        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4">
            <p className="font-semibold mb-3 text-sm">Device split</p>
            {deviceSplit.map((d) => (
              <div key={d.label} className="flex items-center gap-3 mb-2 last:mb-0 text-sm">
                <d.icon className="size-4 text-slate-400" />
                <span className="flex-1 text-slate-600 dark:text-slate-400">{d.label}</span>
                <div className="w-20 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${d.value}%`, background: d.color }} />
                </div>
                <span className="font-semibold w-8 text-end">{d.value}%</span>
              </div>
            ))}
          </div>
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4">
            <p className="font-semibold mb-3 text-sm">Traffic sources</p>
            {sources.map((s) => (
              <div key={s.label} className="flex items-center gap-2 mb-2 last:mb-0 text-sm">
                <span className="flex-1 text-slate-600 dark:text-slate-400">{s.label}</span>
                <div className="w-16 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-cyan-500 rounded-full" style={{ width: `${s.value}%` }} />
                </div>
                <span className="font-semibold w-8 text-end">{s.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
          <Globe2 className="size-4 text-cyan-600" />
          <p className="font-semibold">Top pages</p>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-slate-50 dark:bg-slate-800/50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="text-start px-5 py-2.5">#</th>
              <th className="text-start px-5 py-2.5">Page</th>
              <th className="text-start px-5 py-2.5">Path</th>
              <th className="text-start px-5 py-2.5">Views</th>
              <th className="text-start px-5 py-2.5">Share</th>
            </tr>
          </thead>
          <tbody>
            {topPages.map((p, i) => (
              <tr key={p.path} className="border-t border-slate-100 dark:border-slate-800 hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                <td className="px-5 py-3 text-slate-400 font-mono text-xs">{i + 1}</td>
                <td className="px-5 py-3 font-medium">{p.label}</td>
                <td className="px-5 py-3 font-mono text-xs text-slate-500">{p.path}</td>
                <td className="px-5 py-3 tabular-nums">{p.views.toLocaleString()}</td>
                <td className="px-5 py-3">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-cyan-500 rounded-full" style={{ width: `${(p.views / topPages[0].views) * 100}%` }} />
                    </div>
                    <span className="text-xs text-slate-400 w-10 text-end">{((p.views / Math.max(1, totalPV)) * 100).toFixed(1)}%</span>
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

// ─── System Report ────────────────────────────────────────────────────────────

function SystemReport() {
  const [autoRefresh, setAutoRefresh] = useState(false);

  const services = [
    { name: "API Gateway", status: "operational", latency: "48ms", uptime: "99.99%", requests: "1.2M/d" },
    { name: "Search Engine", status: "operational", latency: "124ms", uptime: "99.97%", requests: "840K/d" },
    { name: "Chat / Messaging", status: "degraded", latency: "312ms", uptime: "97.21%", requests: "92K/d" },
    { name: "Payment Gateway", status: "operational", latency: "88ms", uptime: "99.99%", requests: "18K/d" },
    { name: "Image CDN", status: "operational", latency: "22ms", uptime: "100%", requests: "4.8M/d" },
    { name: "Auction Engine", status: "operational", latency: "56ms", uptime: "99.95%", requests: "230K/d" },
    { name: "Email Service", status: "operational", latency: "210ms", uptime: "99.88%", requests: "45K/d" },
    { name: "Webhook Dispatcher", status: "incident", latency: "1.2s", uptime: "91.4%", requests: "12K/d" },
    { name: "Database (Primary)", status: "operational", latency: "4ms", uptime: "100%", requests: "28M/d" },
    { name: "Redis Cache", status: "operational", latency: "1ms", uptime: "100%", requests: "62M/d" },
  ];

  const statusBadge = (s: string) => {
    if (s === "operational") return "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300";
    if (s === "degraded") return "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300";
    return "bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300";
  };

  const systemMetrics = [
    { label: "CPU Usage", value: 42, unit: "%", color: "#3b82f6", icon: Cpu },
    { label: "Memory", value: 67, unit: "%", color: "#8b5cf6", icon: Server },
    { label: "Disk I/O", value: 28, unit: "%", color: "#10b981", icon: HardDrive },
    { label: "Network", value: 55, unit: "%", color: "#f59e0b", icon: Activity },
  ];

  const logs = [
    { level: "error", msg: "Webhook dispatcher: timeout after 3 retries for event auction.closed", time: "5m ago" },
    { level: "warn", msg: "Chat service: P95 latency exceeded 300ms threshold", time: "12m ago" },
    { level: "info", msg: "Redis cache: eviction threshold reached, LRU cleanup triggered", time: "24m ago" },
    { level: "info", msg: "Search index rebuilt: 14,382 documents indexed in 8.2s", time: "1h ago" },
    { level: "warn", msg: "API Gateway: rate limit reached for IP 185.x.x.x", time: "2h ago" },
    { level: "info", msg: "Payment gateway: daily settlement completed AED 284,192", time: "3h ago" },
    { level: "info", msg: "Database backup completed: 42GB compressed, 4.1min", time: "6h ago" },
    { level: "error", msg: "Email service: bounce rate spiked to 4.2% for batch #2891", time: "8h ago" },
  ];

  const logBadge = (l: string) => {
    if (l === "error") return "bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400";
    if (l === "warn") return "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400";
    return "bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400";
  };

  const overall = services.every((s) => s.status === "operational") ? "operational" : services.some((s) => s.status === "incident") ? "incident" : "degraded";

  return (
    <div className="space-y-5">
      {/* Status banner */}
      <div className={`rounded-xl p-4 flex items-start gap-4 border ${overall === "operational" ? "bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800" : overall === "degraded" ? "bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800" : "bg-rose-50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-800"}`}>
        <span className={`size-3 rounded-full mt-1 shrink-0 ${overall === "operational" ? "bg-emerald-500" : overall === "degraded" ? "bg-amber-500" : "bg-rose-500"} shadow-lg`} />
        <div>
          <p className={`font-bold ${overall === "operational" ? "text-emerald-800 dark:text-emerald-200" : overall === "degraded" ? "text-amber-800 dark:text-amber-200" : "text-rose-800 dark:text-rose-200"}`}>
            {overall === "operational" ? "All systems operational" : overall === "degraded" ? "Partial service degradation" : "Active incident in progress"}
          </p>
          <p className={`text-sm ${overall === "operational" ? "text-emerald-700 dark:text-emerald-300" : overall === "degraded" ? "text-amber-700 dark:text-amber-300" : "text-rose-700 dark:text-rose-300"}`}>
            {services.filter((s) => s.status !== "operational").length} service(s) need attention · Last checked: just now
          </p>
        </div>
        <div className="ms-auto flex items-center gap-2">
          <span className="text-xs text-slate-500">Auto-refresh</span>
          <button onClick={() => setAutoRefresh(!autoRefresh)}
            className={`relative w-9 h-5 rounded-full transition-colors ${autoRefresh ? "bg-blue-600" : "bg-slate-300 dark:bg-slate-700"}`}>
            <span className={`absolute top-0.5 size-4 rounded-full bg-white shadow transition-all ${autoRefresh ? "start-4" : "start-0.5"}`} />
          </button>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {systemMetrics.map((m) => (
          <div key={m.label} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400"><m.icon className="size-4" />{m.label}</div>
              <span className="font-bold text-lg tabular-nums">{m.value}{m.unit}</span>
            </div>
            <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full rounded-full transition-all" style={{ width: `${m.value}%`, background: m.color }} />
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
          <Server className="size-4 text-slate-600" />
          <p className="font-semibold">Service health</p>
          <span className="ms-auto text-xs text-slate-500">{services.filter((s) => s.status === "operational").length}/{services.length} operational</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800/50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="text-start px-5 py-2.5">Service</th>
                <th className="text-start px-5 py-2.5">Status</th>
                <th className="text-start px-5 py-2.5">Latency</th>
                <th className="text-start px-5 py-2.5">Uptime (30d)</th>
                <th className="text-start px-5 py-2.5">Requests</th>
              </tr>
            </thead>
            <tbody>
              {services.map((s) => (
                <tr key={s.name} className="border-t border-slate-100 dark:border-slate-800 hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                  <td className="px-5 py-3 font-medium flex items-center gap-2">
                    <span className={`size-2 rounded-full ${s.status === "operational" ? "bg-emerald-500" : s.status === "degraded" ? "bg-amber-500" : "bg-rose-500"}`} />
                    {s.name}
                  </td>
                  <td className="px-5 py-3"><span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${statusBadge(s.status)}`}>{s.status}</span></td>
                  <td className="px-5 py-3 tabular-nums font-mono text-xs">{s.latency}</td>
                  <td className="px-5 py-3 tabular-nums font-semibold">{s.uptime}</td>
                  <td className="px-5 py-3 text-slate-500">{s.requests}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2"><Database className="size-4 text-slate-600" /><p className="font-semibold">System log</p></div>
          <button onClick={() => toast.success("Log exported")}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs hover:bg-slate-50 dark:hover:bg-slate-800 transition">
            <Download className="size-3" /> Export
          </button>
        </div>
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {logs.map((l, i) => (
            <div key={i} className="px-5 py-2.5 flex items-start gap-3">
              <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold uppercase mt-0.5 shrink-0 ${logBadge(l.level)}`}>{l.level}</span>
              <p className="text-xs text-slate-700 dark:text-slate-300 flex-1 font-mono">{l.msg}</p>
              <span className="text-[10px] text-slate-400 whitespace-nowrap">{l.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Custom Report Builder ────────────────────────────────────────────────────

function CustomReportBuilder() {
  const [metric, setMetric] = useState("revenue");
  const [dimension, setDimension] = useState("category");
  const [chartType, setChartType] = useState("bar");
  const [generated, setGenerated] = useState(false);

  const generate = () => { setGenerated(true); toast.success("Custom report generated"); };

  const presets = [
    { name: "Revenue by Category", m: "revenue", d: "category" },
    { name: "Users by Location", m: "users", d: "emirate" },
    { name: "Listings by Status", m: "listings", d: "status" },
    { name: "Reports by Reason", m: "reports", d: "reason" },
  ];

  const previewData = useMemo(() => {
    if (!generated) return [];
    const labels = dimension === "category" ? CATEGORIES : dimension === "emirate" ? EMIRATES : ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
    return labels.map((l, i) => ({ label: l, value: Math.round(1000 + seededRand(i * 91)() * 90000) }));
  }, [generated, dimension]);

  return (
    <div className="space-y-5">
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5">
        <p className="font-semibold mb-1 flex items-center gap-2"><Sliders className="size-4 text-indigo-600" /> Custom Report Builder</p>
        <p className="text-sm text-slate-500 mb-5">Build any cross-dimension report and export it.</p>

        <div className="grid sm:grid-cols-3 gap-4 mb-5">
          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-2">Metric</label>
            <select value={metric} onChange={(e) => setMetric(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm outline-none">
              <option value="revenue">Revenue (AED)</option>
              <option value="listings">Listings count</option>
              <option value="users">User signups</option>
              <option value="traffic">Page views</option>
              <option value="reports">Reports filed</option>
              <option value="conversion">Conversion rate</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-2">Dimension</label>
            <select value={dimension} onChange={(e) => setDimension(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm outline-none">
              <option value="category">Category</option>
              <option value="emirate">Emirate</option>
              <option value="date">Date</option>
              <option value="status">Status</option>
              <option value="source">Traffic source</option>
              <option value="reason">Report reason</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-2">Chart type</label>
            <div className="flex gap-1 p-1 rounded-lg border border-slate-200 dark:border-slate-700">
              {[["bar", "Bar"], ["line", "Line"], ["pie", "Pie"]].map(([v, l]) => (
                <button key={v} onClick={() => setChartType(v)}
                  className={`flex-1 py-1.5 text-sm rounded-md transition ${chartType === v ? "bg-indigo-600 text-white font-semibold" : "text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"}`}>{l}</button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex gap-2 mb-6">
          <button onClick={generate}
            className="px-5 py-2 rounded-lg bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition">Generate Report</button>
          <button onClick={() => toast.success("Report exported as CSV")}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition">
            <Download className="size-3.5" /> Export CSV
          </button>
          <button onClick={() => toast.success("Saved to scheduled reports")}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition">
            <Bell className="size-3.5" /> Schedule
          </button>
        </div>

        {generated && previewData.length > 0 && (
          <div>
            <p className="text-sm font-semibold mb-3 text-slate-700 dark:text-slate-300">
              {metric.charAt(0).toUpperCase() + metric.slice(1)} by {dimension} — Preview
            </p>
            {chartType === "bar" && (
              <div className="space-y-2">
                {previewData.map((d) => (
                  <div key={d.label} className="flex items-center gap-3">
                    <span className="text-sm text-slate-600 dark:text-slate-400 w-24 shrink-0 truncate">{d.label}</span>
                    <div className="flex-1 h-7 bg-slate-100 dark:bg-slate-800 rounded-lg overflow-hidden">
                      <div className="h-full bg-indigo-500 rounded-lg flex items-center ps-2" style={{ width: `${(d.value / Math.max(...previewData.map((x) => x.value))) * 100}%` }}>
                        <span className="text-xs text-white font-semibold truncate">{d.value.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {chartType === "line" && (
              <AreaChart data={previewData.map((d) => d.value)} color="#6366f1" />
            )}
            {chartType === "pie" && (
              <div className="flex flex-wrap gap-3 justify-center">
                {previewData.map((d, i) => {
                  const colors = ["#6366f1", "#3b82f6", "#10b981", "#f59e0b", "#f43f5e", "#8b5cf6", "#06b6d4"];
                  const total = previewData.reduce((s, x) => s + x.value, 0);
                  return (
                    <div key={d.label} className="flex items-center gap-1.5 text-sm">
                      <span className="size-3 rounded-full" style={{ background: colors[i % colors.length] }} />
                      <span className="text-slate-600 dark:text-slate-400">{d.label}</span>
                      <span className="font-semibold">{((d.value / total) * 100).toFixed(1)}%</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {!generated && (
          <div className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl p-8 text-center text-slate-500">
            <Sliders className="size-8 mx-auto mb-2 text-slate-300 dark:text-slate-600" />
            <p className="text-sm">Select metrics and dimensions above, then click Generate</p>
          </div>
        )}
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5">
        <p className="font-semibold mb-4 flex items-center gap-2"><Zap className="size-4 text-indigo-600" /> Quick report presets</p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {presets.map((p) => (
            <button key={p.name} onClick={() => { setMetric(p.m); setDimension(p.d); setGenerated(true); toast.success(`Loaded: ${p.name}`); }}
              className="p-3 rounded-lg border border-slate-200 dark:border-slate-700 text-start hover:border-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/20 transition group">
              <ChevronRight className="size-4 text-indigo-600 mb-2 group-hover:translate-x-1 transition-transform" />
              <p className="text-sm font-medium">{p.name}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Shared sub-components ────────────────────────────────────────────────────

function KpiCard({ label, value, icon: Icon, color, pct, up, unit }: {
  label: string; value: string; icon: typeof BarChart3; color: string; pct: number; up: boolean; unit: string;
}) {
  const colorMap: Record<string, string> = {
    blue: "text-blue-600 bg-blue-50 dark:bg-blue-950/30",
    emerald: "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30",
    violet: "text-violet-600 bg-violet-50 dark:bg-violet-950/30",
    amber: "text-amber-600 bg-amber-50 dark:bg-amber-950/30",
  };
  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4">
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm text-slate-500">{label}</p>
        <span className={`size-8 rounded-lg flex items-center justify-center ${colorMap[color]}`}>
          <Icon className="size-4" />
        </span>
      </div>
      <p className="text-2xl font-bold tabular-nums">{value}</p>
      <div className="flex items-center justify-between mt-1">
        <span className={`text-xs font-medium flex items-center gap-0.5 ${up ? "text-emerald-600" : "text-rose-600"}`}>
          {up ? <ArrowUpRight className="size-3" /> : <ArrowDownRight className="size-3" />}
          {Math.abs(pct).toFixed(1)}% vs prior period
        </span>
      </div>
    </div>
  );
}

function StatCard({ label, value, color, icon: Icon, isText }: {
  label: string; value: number | string; color: string; icon: typeof BarChart3; isText?: boolean;
}) {
  const colorMap: Record<string, string> = {
    blue: "text-blue-600 bg-blue-50 dark:bg-blue-950/30", emerald: "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30",
    rose: "text-rose-600 bg-rose-50 dark:bg-rose-950/30", amber: "text-amber-600 bg-amber-50 dark:bg-amber-950/30",
    violet: "text-violet-600 bg-violet-50 dark:bg-violet-950/30", cyan: "text-cyan-600 bg-cyan-50 dark:bg-cyan-950/30",
  };
  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 flex items-center gap-3">
      <span className={`size-10 rounded-lg flex items-center justify-center shrink-0 ${colorMap[color]}`}>
        <Icon className="size-5" />
      </span>
      <div>
        <p className="text-xl font-bold tabular-nums">{isText ? value : Number(value).toLocaleString()}</p>
        <p className="text-xs text-slate-500">{label}</p>
      </div>
    </div>
  );
}

function MetricRow({ label, value, color }: { label: string; value: string; color: string }) {
  const cols: Record<string, string> = { blue: "text-blue-600", emerald: "text-emerald-600", violet: "text-violet-600", rose: "text-rose-600" };
  return (
    <div className="flex items-center justify-between py-1.5 border-b border-slate-100 dark:border-slate-800 last:border-0">
      <span className="text-slate-600 dark:text-slate-400">{label}</span>
      <span className={`font-bold ${cols[color]}`}>{value}</span>
    </div>
  );
}

function AreaChart({ data, color }: { data: number[]; color: string }) {
  const w = 800, h = 160, pad = 12;
  const max = Math.max(...data), min = Math.min(...data), range = max - min || 1;
  const pts = data.map((v, i) => `${pad + (i / (data.length - 1)) * (w - pad * 2)},${h - pad - ((v - min) / range) * (h - pad * 2)}`).join(" ");
  const area = `${pad},${h - pad} ${pts} ${w - pad},${h - pad}`;
  const id = `g_${color.replace("#", "")}`;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-36">
      <defs>
        <linearGradient id={id} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.3} /><stop offset="100%" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>
      {[0,1,2,3].map((i) => <line key={i} x1={pad} x2={w-pad} y1={pad + i*((h-pad*2)/3)} y2={pad + i*((h-pad*2)/3)} stroke="currentColor" strokeOpacity="0.07" />)}
      <polygon points={area} fill={`url(#${id})`} />
      <polyline points={pts} fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function DualLineChart({ series1, series2, color1, color2, label1, label2 }: {
  series1: number[]; series2: number[]; color1: string; color2: string; label1: string; label2: string;
}) {
  const w = 800, h = 180, pad = 16;
  const all = [...series1, ...series2], max = Math.max(...all), min = Math.min(...all), range = max - min || 1;
  const toPts = (s: number[]) => s.map((v, i) => `${pad + (i / (s.length - 1)) * (w - pad * 2)},${h - pad - ((v - min) / range) * (h - pad * 2)}`).join(" ");
  return (
    <div>
      <div className="flex gap-4 mb-2 text-xs">
        <span className="flex items-center gap-1"><span className="size-2 rounded-full" style={{ background: color1 }} /> {label1}</span>
        <span className="flex items-center gap-1"><span className="size-2 rounded-full" style={{ background: color2 }} /> {label2}</span>
      </div>
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-44">
        {[0,1,2,3].map((i) => <line key={i} x1={pad} x2={w-pad} y1={pad + i*((h-pad*2)/3)} y2={pad + i*((h-pad*2)/3)} stroke="currentColor" strokeOpacity="0.08" />)}
        <polyline points={toPts(series1)} fill="none" stroke={color1} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
        <polyline points={toPts(series2)} fill="none" stroke={color2} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}

function StackedBarChart({ data1, data2, color1, color2 }: { data1: number[]; data2: number[]; color1: string; color2: string }) {
  const maxVal = Math.max(...data1.map((v, i) => v + data2[i]));
  const w = 800, h = 160, pad = 12;
  const barW = Math.max(2, ((w - pad * 2) / data1.length) * 0.7);
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-40">
      {[0,1,2,3].map((i) => <line key={i} x1={pad} x2={w-pad} y1={pad + i*((h-pad*2)/3)} y2={pad + i*((h-pad*2)/3)} stroke="currentColor" strokeOpacity="0.07" />)}
      {data1.map((v1, i) => {
        const v2 = data2[i];
        const x = pad + (i / (data1.length - 1)) * (w - pad * 2) - barW / 2;
        const h1 = ((v1 / maxVal) * (h - pad * 2));
        const h2 = ((v2 / maxVal) * (h - pad * 2));
        return (
          <g key={i}>
            <rect x={x} y={h - pad - h1 - h2} width={barW} height={h2} fill={color2} rx={2} />
            <rect x={x} y={h - pad - h1} width={barW} height={h1} fill={color1} rx={2} />
          </g>
        );
      })}
    </svg>
  );
}
