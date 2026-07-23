import React, { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
  Plus, Gavel, TrendingUp, Clock, CheckCircle, DollarSign,
  Trash2, Square, Eye, Edit3, X, ChevronDown, ShieldCheck, Zap, AlertTriangle,
} from "lucide-react";
import { useAuction, getStatus, type Auction, type NewAuctionDraft } from "../AuctionContext";
import { formatCurrency } from "../utils";
import { toast } from "sonner";
import { listCarMakes, modelsForMake } from "../data/carMakeModels";

type AdminUser = { name: string };
type Props = { admin: AdminUser; onViewAuction: (id: string) => void };

function StatusPill({ auction }: { auction: Auction }) {
  const { t } = useTranslation();
  const s = getStatus(auction);
  if (s === "live") return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-950/40 text-red-700 dark:text-red-400 text-xs font-semibold"><span className="size-1.5 rounded-full bg-red-600 animate-pulse" />{t("auction.statusLive")}</span>;
  if (s === "upcoming") return <span className="px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 text-xs font-semibold">{t("auction.statusUpcoming")}</span>;
  if (s === "ended-sold") return <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 text-xs font-semibold">{t("auction.statusSold")}</span>;
  return <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-semibold">{t("auction.statusUnsold")}</span>;
}

function MiniCountdown({ endTime }: { endTime: number }) {
  const { t } = useTranslation();
  const diff = Math.max(0, endTime - Date.now());
  if (diff === 0) return <span className="text-xs text-red-500">{t("auction.ended")}</span>;
  const h = Math.floor(diff / 3_600_000);
  const m = Math.floor((diff % 3_600_000) / 60_000);
  if (h > 24) return <span className="text-xs text-slate-500">{Math.floor(h / 24)}{t("auction.unitD")} {h % 24}{t("auction.unitH")}</span>;
  return <span className={`text-xs font-mono ${h === 0 && m < 30 ? "text-red-600 font-bold" : "text-slate-600 dark:text-slate-400"}`}>{h}{t("auction.unitH")} {m}{t("auction.unitM")}</span>;
}

function AdminBidModal({ auction, adminName, onClose }: { auction: Auction; adminName: string; onClose: () => void }) {
  const { t } = useTranslation();
  const { placeBid } = useAuction();
  const [amount, setAmount] = useState("");
  const minBid = auction.currentBid + auction.minIncrement;
  const adminId = adminName.toLowerCase().replace(/\s+/g, "-");

  const submit = () => {
    const val = parseFloat(amount.replace(/,/g, ""));
    if (isNaN(val)) { toast.error("Enter a valid amount."); return; }
    const err = placeBid(auction.id, val, adminId, adminName, true);
    if (err) toast.error(err);
    else { toast.success(`${t("auction.adminBidModal")}: ${formatCurrency(val)}`); onClose(); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 w-full max-w-md shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-2">
            <div className="size-8 rounded-lg bg-amber-500 flex items-center justify-center">
              <ShieldCheck className="size-4 text-white" />
            </div>
            <div>
              <p className="font-semibold">{t("auction.adminBidModal")}</p>
              <p className="text-xs text-slate-500">{t("auction.adminBidModalSub")}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500"><X className="size-4" /></button>
        </div>
        <div className="p-5 space-y-4">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800">
            <img src={auction.images[0]} alt="" className="size-14 rounded-lg object-cover" />
            <div>
              <p className="text-sm font-semibold leading-tight">{auction.title}</p>
              <p className="text-xs text-slate-500 mt-0.5">{t("auction.currentLabel")} {formatCurrency(auction.currentBid)}</p>
              {auction.currentBidder && <p className="text-xs text-slate-500">{t("auction.leaderLabel")} {auction.currentBidder}</p>}
            </div>
          </div>
          <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900">
            <div className="flex items-start gap-2">
              <AlertTriangle className="size-4 text-amber-600 mt-0.5 shrink-0" />
              <p className="text-xs text-amber-700 dark:text-amber-400">{t("auction.adminBidWarning")}</p>
            </div>
          </div>
          <div>
            <label className="text-xs text-slate-500 uppercase tracking-wide block mb-1.5">{t("auction.bidAmountMin")} {formatCurrency(minBid)})</label>
            <div className="relative">
              <span className="absolute start-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm font-medium">AED</span>
              <input type="number" autoFocus value={amount} onChange={(e) => setAmount(e.target.value)} placeholder={minBid.toLocaleString()} min={minBid} step={auction.minIncrement} className="w-full ps-14 pe-3 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 outline-none focus:border-amber-500 text-lg font-bold tabular-nums" />
            </div>
            <div className="flex gap-2 mt-2">
              {[1, 2, 3].map((m) => (
                <button key={m} onClick={() => setAmount(String(minBid + auction.minIncrement * (m - 1)))} className="flex-1 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs hover:border-amber-500 hover:text-amber-600 transition">
                  +{formatCurrency(auction.minIncrement * m)}
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-3 pt-1">
            <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition">{t("auction.cancel")}</button>
            <button onClick={submit} className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-sm transition flex items-center justify-center gap-2">
              <ShieldCheck className="size-4" />{t("auction.adminBidModal")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const BLANK_DRAFT: Partial<NewAuctionDraft> = {
  make: "", model: "", year: new Date().getFullYear(), mileage: 0,
  color: "White", condition: "Excellent", transmission: "Automatic",
  fuelType: "Petrol", bodyType: "Coupe", vin: "",
  title: "", description: "", images: [],
  location: "Dubai", startingPrice: 0, reservePrice: 0, minIncrement: 2000,
  startTime: Date.now() + 3_600_000, endTime: Date.now() + 86_400_000,
  featured: false, sellerId: "admin", sellerName: "Admin",
};

function toDatetimeLocal(ms: number) {
  const d = new Date(ms);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function AuctionForm({ initial, onSubmit, onCancel, label }: {
  initial: Partial<NewAuctionDraft>;
  onSubmit: (d: NewAuctionDraft) => void;
  onCancel: () => void;
  label: string;
}) {
  const { t } = useTranslation();
  const [f, setF] = useState<Partial<NewAuctionDraft>>(initial);
  const set = <K extends keyof NewAuctionDraft>(k: K, v: NewAuctionDraft[K]) => setF((p) => ({ ...p, [k]: v }));

  const submit = () => {
    if (!f.title?.trim()) { toast.error("Title is required"); return; }
    if (!f.make?.trim()) { toast.error("Make is required"); return; }
    if (!f.startingPrice || f.startingPrice <= 0) { toast.error("Starting price required"); return; }
    if (!f.reservePrice || f.reservePrice < f.startingPrice) { toast.error("Reserve price must be ≥ starting price"); return; }
    if (!f.startTime || !f.endTime || f.endTime <= f.startTime) { toast.error("End time must be after start time"); return; }
    const imgs = f.images?.length ? f.images : ["https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=1200"];
    onSubmit({ ...(f as NewAuctionDraft), images: imgs, title: f.title || `${f.year} ${f.make} ${f.model}` });
  };

  const Field = ({ label: lbl, children }: { label: string; children: React.ReactNode }) => (
    <div>
      <label className="text-xs text-slate-500 uppercase tracking-wide block mb-1.5">{lbl}</label>
      {children}
    </div>
  );

  const cls = "w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 outline-none focus:border-blue-600 text-sm";

  return (
    <div className="space-y-5">
      <div className="grid sm:grid-cols-2 gap-4">
        <Field label={t("auction.formMake")}>
          <select
            value={f.make || ""}
            onChange={(e) => { set("make", e.target.value); set("model", ""); }}
            className={cls + " appearance-none"}
          >
            <option value="">Select Make…</option>
            {listCarMakes().map((m) => <option key={m} value={m}>{m}</option>)}
          </select>
        </Field>
        <Field label={t("auction.formModel")}>
          <select
            value={f.model || ""}
            onChange={(e) => set("model", e.target.value)}
            disabled={!f.make}
            className={cls + " appearance-none disabled:opacity-50"}
          >
            <option value="">{f.make ? "Select Model…" : "Select Make first"}</option>
            {modelsForMake(f.make || "").map((m) => <option key={m} value={m}>{m}</option>)}
          </select>
        </Field>
        <Field label={t("auction.formYear")}><input type="number" value={f.year || ""} onChange={(e) => set("year", +e.target.value)} className={cls} /></Field>
        <Field label={t("auction.formMileage")}><input type="number" value={f.mileage || ""} onChange={(e) => set("mileage", +e.target.value)} className={cls} /></Field>
        <Field label={t("auction.formColour")}><input value={f.color || ""} onChange={(e) => set("color", e.target.value)} className={cls} /></Field>
        <Field label={t("auction.formVin")}><input value={f.vin || ""} onChange={(e) => set("vin", e.target.value)} placeholder="17-character VIN" className={cls} /></Field>
        <Field label={t("auction.formCondition")}>
          <select value={f.condition} onChange={(e) => set("condition", e.target.value as NewAuctionDraft["condition"])} className={cls + " appearance-none"}>
            {["Excellent", "Good", "Fair", "Poor"].map((c) => <option key={c}>{c}</option>)}
          </select>
        </Field>
        <Field label={t("auction.formTransmission")}>
          <select value={f.transmission} onChange={(e) => set("transmission", e.target.value as NewAuctionDraft["transmission"])} className={cls + " appearance-none"}>
            {["Automatic", "Manual"].map((c) => <option key={c}>{c}</option>)}
          </select>
        </Field>
        <Field label={t("auction.formFuelType")}>
          <select value={f.fuelType} onChange={(e) => set("fuelType", e.target.value as NewAuctionDraft["fuelType"])} className={cls + " appearance-none"}>
            {["Petrol", "Diesel", "Electric", "Hybrid"].map((c) => <option key={c}>{c}</option>)}
          </select>
        </Field>
        <Field label={t("auction.formBodyType")}><input value={f.bodyType || ""} onChange={(e) => set("bodyType", e.target.value)} placeholder="e.g. Coupe" className={cls} /></Field>
        <Field label={t("auction.formLocation")}>
          <select value={f.location} onChange={(e) => set("location", e.target.value)} className={cls + " appearance-none"}>
            {["Dubai", "Abu Dhabi", "Sharjah", "Ajman", "Ras Al Khaimah", "Fujairah"].map((c) => <option key={c}>{c}</option>)}
          </select>
        </Field>
        <Field label={t("auction.formSellerName")}><input value={f.sellerName || ""} onChange={(e) => set("sellerName", e.target.value)} className={cls} /></Field>
      </div>
      <Field label={t("auction.titleAuto")}>
        <input value={f.title || ""} onChange={(e) => set("title", e.target.value)} placeholder={`${f.year} ${f.make} ${f.model}`} className={cls} />
      </Field>
      <Field label={t("auction.formDescription")}>
        <textarea value={f.description || ""} onChange={(e) => set("description", e.target.value)} rows={3} className={cls + " resize-none"} />
      </Field>
      <Field label={t("auction.formImageUrl")}>
        <input value={f.images?.[0] || ""} onChange={(e) => set("images", [e.target.value, ...(f.images?.slice(1) || [])])} placeholder="https://images.unsplash.com/..." className={cls} />
      </Field>
      <div className="grid sm:grid-cols-3 gap-4">
        <Field label={t("auction.formStartingPrice")}><input type="number" value={f.startingPrice || ""} onChange={(e) => set("startingPrice", +e.target.value)} className={cls} /></Field>
        <Field label={t("auction.formReservePrice")}><input type="number" value={f.reservePrice || ""} onChange={(e) => set("reservePrice", +e.target.value)} className={cls} /></Field>
        <Field label={t("auction.formMinIncrement")}><input type="number" value={f.minIncrement || ""} onChange={(e) => set("minIncrement", +e.target.value)} className={cls} /></Field>
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        <Field label={t("auction.formStartDateTime")}>
          <input type="datetime-local" value={f.startTime ? toDatetimeLocal(f.startTime) : ""} onChange={(e) => set("startTime", new Date(e.target.value).getTime())} className={cls} />
        </Field>
        <Field label={t("auction.formEndDateTime")}>
          <input type="datetime-local" value={f.endTime ? toDatetimeLocal(f.endTime) : ""} onChange={(e) => set("endTime", new Date(e.target.value).getTime())} className={cls} />
        </Field>
      </div>
      <label className="flex items-center gap-2 cursor-pointer">
        <input type="checkbox" checked={!!f.featured} onChange={(e) => set("featured", e.target.checked)} className="size-4 accent-blue-600" />
        <span className="text-sm font-medium">{t("auction.featureHomepage")}</span>
      </label>
      <div className="flex gap-3 pt-2">
        <button onClick={onCancel} className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition">{t("auction.cancel")}</button>
        <button onClick={submit} className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm transition">{label}</button>
      </div>
    </div>
  );
}

export function AuctionAdmin({ admin, onViewAuction }: Props) {
  const { t } = useTranslation();
  const { auctions, createAuction, updateAuction, endAuction, deleteAuction } = useAuction();
  const [view, setView] = useState<"list" | "create" | "edit">("list");
  const [editTarget, setEditTarget] = useState<Auction | null>(null);
  const [bidTarget, setBidTarget] = useState<Auction | null>(null);
  const [filterStatus, setFilterStatus] = useState<"all" | "live" | "upcoming" | "ended">("all");
  const [confirmEnd, setConfirmEnd] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const stats = useMemo(() => ({
    total: auctions.length,
    live: auctions.filter((a) => getStatus(a) === "live").length,
    totalBids: auctions.reduce((s, a) => s + a.bids.length, 0),
    sold: auctions.filter((a) => getStatus(a) === "ended-sold").length,
    pendingRevenue: auctions.filter((a) => getStatus(a) === "ended-sold").reduce((s, a) => s + a.currentBid, 0),
  }), [auctions]);

  const filtered = useMemo(() => {
    if (filterStatus === "all") return auctions;
    if (filterStatus === "ended") return auctions.filter((a) => getStatus(a) === "ended-sold" || getStatus(a) === "ended-unsold");
    return auctions.filter((a) => getStatus(a) === filterStatus);
  }, [auctions, filterStatus]);

  const filterTabs: { key: "all" | "live" | "upcoming" | "ended"; label: string }[] = [
    { key: "all", label: t("auction.tabAll") },
    { key: "live", label: t("auction.tabLive") },
    { key: "upcoming", label: t("auction.tabUpcoming") },
    { key: "ended", label: t("auction.tabEnded") },
  ];

  if (view === "create") return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <button onClick={() => setView("list")} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500"><X className="size-4" /></button>
        <div>
          <p className="font-semibold">{t("auction.createNew")}</p>
          <p className="text-xs text-slate-500">{t("auction.createDesc")}</p>
        </div>
      </div>
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
        <AuctionForm initial={{ ...BLANK_DRAFT }} label={t("auction.createAuction")} onCancel={() => setView("list")} onSubmit={(d) => { createAuction(d); toast.success("Auction created!"); setView("list"); }} />
      </div>
    </div>
  );

  if (view === "edit" && editTarget) return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <button onClick={() => { setView("list"); setEditTarget(null); }} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500"><X className="size-4" /></button>
        <div>
          <p className="font-semibold">{t("auction.editAuction")}</p>
          <p className="text-xs text-slate-500 truncate max-w-xs">{editTarget.title}</p>
        </div>
      </div>
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
        <AuctionForm initial={editTarget} label={t("auction.saveChanges")} onCancel={() => { setView("list"); setEditTarget(null); }} onSubmit={(d) => { updateAuction(editTarget.id, d); toast.success("Auction updated!"); setView("list"); setEditTarget(null); }} />
      </div>
    </div>
  );

  return (
    <div className="space-y-5">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { icon: Gavel, label: t("auction.adminStatTotal"), val: stats.total, color: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-950/30" },
          { icon: Zap, label: t("auction.adminStatLive"), val: stats.live, color: "text-red-600", bg: "bg-red-50 dark:bg-red-950/30" },
          { icon: TrendingUp, label: t("auction.adminStatBids"), val: stats.totalBids, color: "text-purple-600", bg: "bg-purple-50 dark:bg-purple-950/30" },
          { icon: DollarSign, label: t("auction.adminStatRevenue"), val: formatCurrency(stats.pendingRevenue), color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-950/30" },
        ].map(({ icon: Icon, label, val, color, bg }) => (
          <div key={label} className={`rounded-xl p-4 flex items-center gap-3 ${bg}`}>
            <div className={`size-9 rounded-lg bg-white dark:bg-slate-900 flex items-center justify-center ${color}`}><Icon className="size-5" /></div>
            <div>
              <p className="text-lg font-bold tabular-nums">{val}</p>
              <p className="text-xs text-slate-500">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex gap-1 p-1 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
          {filterTabs.map(({ key, label }) => (
            <button key={key} onClick={() => setFilterStatus(key)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${filterStatus === key ? "bg-blue-600 text-white" : "text-slate-500 hover:text-slate-900 dark:hover:text-white"}`}>
              {key === "live" ? <span className="flex items-center gap-1"><span className="size-1.5 rounded-full bg-current" />{label}</span> : label}
            </button>
          ))}
        </div>
        <button onClick={() => setView("create")} className="ms-auto flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition">
          <Plus className="size-4" />{t("auction.newAuction")}
        </button>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        {filtered.length === 0 ? (
          <div className="text-center py-16 text-slate-400">
            <Gavel className="size-10 mx-auto mb-3 opacity-30" />
            <p>{t("auction.noAuctionsInCategory")}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-xs text-slate-500 uppercase tracking-wide">
                  <th className="text-start px-4 py-3 font-medium">{t("auction.colVehicle")}</th>
                  <th className="text-start px-3 py-3 font-medium hidden md:table-cell">{t("auction.colStatus")}</th>
                  <th className="text-start px-3 py-3 font-medium">{t("auction.colCurrentBid")}</th>
                  <th className="text-start px-3 py-3 font-medium hidden sm:table-cell">{t("auction.colReserve")}</th>
                  <th className="text-start px-3 py-3 font-medium hidden lg:table-cell">{t("auction.colBids")}</th>
                  <th className="text-start px-3 py-3 font-medium hidden lg:table-cell">{t("auction.colEnds")}</th>
                  <th className="text-end px-4 py-3 font-medium">{t("auction.colActions")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filtered.map((a) => {
                  const s = getStatus(a);
                  const isLive = s === "live";
                  const reserveMet = a.currentBid >= a.reservePrice;
                  return (
                    <tr key={a.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <img src={a.images[0]} alt="" className="size-12 rounded-lg object-cover shrink-0 hidden sm:block" />
                          <div className="min-w-0">
                            <p className="font-medium truncate max-w-[160px]">{a.title}</p>
                            <p className="text-xs text-slate-500 truncate">{a.location} · {a.year}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-3 hidden md:table-cell"><StatusPill auction={a} /></td>
                      <td className="px-3 py-3">
                        <p className={`font-bold tabular-nums ${isLive ? "text-red-600" : ""}`}>{formatCurrency(a.currentBid)}</p>
                        {a.currentBidder && <p className="text-xs text-slate-500 truncate max-w-[100px]">{a.currentBidder}</p>}
                      </td>
                      <td className="px-3 py-3 hidden sm:table-cell">
                        <span className={`text-xs font-medium ${reserveMet ? "text-emerald-600" : "text-amber-600"}`}>{reserveMet ? "✓ Met" : "✗ Not met"}</span>
                      </td>
                      <td className="px-3 py-3 hidden lg:table-cell text-slate-600 dark:text-slate-400">{a.bids.length}</td>
                      <td className="px-3 py-3 hidden lg:table-cell">
                        {isLive ? <MiniCountdown endTime={a.endTime} /> : (
                          <span className="text-xs text-slate-500">{new Date(a.endTime).toLocaleDateString(undefined, { month: "short", day: "numeric" })}</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => onViewAuction(a.id)} title="View" className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-blue-600 transition"><Eye className="size-4" /></button>
                          <button onClick={() => { setEditTarget(a); setView("edit"); }} title="Edit" className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-blue-600 transition"><Edit3 className="size-4" /></button>
                          {isLive && (
                            <button onClick={() => setBidTarget(a)} title="Admin Bid" className="p-1.5 rounded-lg hover:bg-amber-100 dark:hover:bg-amber-900/30 text-slate-500 hover:text-amber-600 transition"><Gavel className="size-4" /></button>
                          )}
                          {(isLive || getStatus(a) === "upcoming") && (
                            <button onClick={() => setConfirmEnd(a.id)} title="End Auction" className="p-1.5 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 text-slate-500 hover:text-red-600 transition"><Square className="size-4" /></button>
                          )}
                          <button onClick={() => setConfirmDelete(a.id)} title="Delete" className="p-1.5 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 text-slate-500 hover:text-red-600 transition"><Trash2 className="size-4" /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {confirmEnd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 max-w-sm w-full shadow-2xl">
            <AlertTriangle className="size-8 text-amber-500 mx-auto mb-3" />
            <p className="text-center font-semibold">{t("auction.confirmEnd")}</p>
            <p className="text-center text-sm text-slate-500 mt-1">{t("auction.confirmEndDetail")}</p>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setConfirmEnd(null)} className="flex-1 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-medium">{t("auction.cancel")}</button>
              <button onClick={() => { endAuction(confirmEnd); toast.success("Auction ended."); setConfirmEnd(null); }} className="flex-1 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-bold transition">{t("auction.endNow")}</button>
            </div>
          </div>
        </div>
      )}

      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 max-w-sm w-full shadow-2xl">
            <Trash2 className="size-8 text-red-500 mx-auto mb-3" />
            <p className="text-center font-semibold">{t("auction.confirmDelete")}</p>
            <p className="text-center text-sm text-slate-500 mt-1">{t("auction.confirmDeleteDetail")}</p>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setConfirmDelete(null)} className="flex-1 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-medium">{t("auction.cancel")}</button>
              <button onClick={() => { deleteAuction(confirmDelete); toast.success("Auction deleted."); setConfirmDelete(null); }} className="flex-1 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-bold transition">{t("auction.delete")}</button>
            </div>
          </div>
        </div>
      )}

      {bidTarget && <AdminBidModal auction={bidTarget} adminName={admin.name} onClose={() => setBidTarget(null)} />}
    </div>
  );
}
