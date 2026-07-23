import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
  ArrowLeft, Gavel, Clock, Eye, Heart, Search, SlidersHorizontal,
  Flame, CheckCircle, XCircle, ChevronDown, Calendar, TrendingUp, Zap,
} from "lucide-react";
import { useAuction, getStatus, useCountdown, type Auction, type AuctionStatus } from "../AuctionContext";
import { HeaderControls } from "./HeaderControls";
import { formatCurrency } from "../utils";
import { listCarMakes } from "../data/carMakeModels";

type Props = { onBack: () => void; onOpen: (id: string) => void };
type FilterTab = "all" | "live" | "upcoming" | "ended";

// ─── Countdown ────────────────────────────────────────────────────────────────

function Countdown({ endTime, compact = false }: { endTime: number; compact?: boolean }) {
  const { t } = useTranslation();
  const { days, hours, minutes, seconds, isExpired } = useCountdown(endTime);
  if (isExpired) return <span className="text-red-500 text-xs font-medium">{t("auction.ended")}</span>;
  const urgent = days === 0 && hours === 0 && minutes < 30;
  if (compact) {
    const d = t("auction.unitD"), h = t("auction.unitH"), m = t("auction.unitM"), s = t("auction.unitS");
    return (
      <span className={`font-mono text-xs tabular-nums ${urgent ? "text-red-500 font-bold" : "text-slate-600 dark:text-slate-400"}`}>
        {days > 0 ? `${days}${d} ${hours}${h}` : hours > 0 ? `${hours}${h} ${minutes}${m}` : `${minutes}${m} ${seconds}${s}`}
      </span>
    );
  }
  return (
    <div className="flex gap-1">
      {days > 0 && <CDUnit val={days} label={t("auction.unitD")} urgent={urgent} />}
      <CDUnit val={hours} label={t("auction.unitH")} urgent={urgent} />
      <CDUnit val={minutes} label={t("auction.unitM")} urgent={urgent} />
      <CDUnit val={seconds} label={t("auction.unitS")} urgent={urgent} />
    </div>
  );
}

function CDUnit({ val, label, urgent }: { val: number; label: string; urgent: boolean }) {
  return (
    <div className={`flex flex-col items-center min-w-[34px] rounded-md px-1.5 py-0.5 ${urgent ? "bg-red-50 dark:bg-red-950/40" : "bg-slate-100 dark:bg-slate-800"}`}>
      <span className={`font-mono text-sm font-bold tabular-nums leading-tight ${urgent ? "text-red-600" : "text-slate-800 dark:text-slate-200"}`}>{String(val).padStart(2, "0")}</span>
      <span className={`text-[9px] uppercase tracking-wide ${urgent ? "text-red-400" : "text-slate-400"}`}>{label}</span>
    </div>
  );
}

// ─── Status badge ─────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: AuctionStatus }) {
  const { t } = useTranslation();
  if (status === "live") return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-600 text-white text-[11px] font-semibold uppercase tracking-wide">
      <span className="size-1.5 rounded-full bg-white animate-pulse" />{t("auction.statusLive")}
    </span>
  );
  if (status === "upcoming") return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-600 text-white text-[11px] font-semibold uppercase tracking-wide">
      <Calendar className="size-2.5" />{t("auction.statusUpcoming")}
    </span>
  );
  if (status === "ended-sold") return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-600 text-white text-[11px] font-semibold uppercase tracking-wide">
      <CheckCircle className="size-2.5" />{t("auction.statusSold")}
    </span>
  );
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-500 text-white text-[11px] font-semibold uppercase tracking-wide">
      <XCircle className="size-2.5" />{t("auction.statusUnsold")}
    </span>
  );
}

// ─── Auction card ─────────────────────────────────────────────────────────────

function AuctionCard({ auction, onOpen }: { auction: Auction; onOpen: () => void }) {
  const { t } = useTranslation();
  const status = getStatus(auction);
  const isLive = status === "live";
  const isUpcoming = status === "upcoming";

  return (
    <div
      onClick={onOpen}
      className={`group cursor-pointer rounded-2xl overflow-hidden border bg-white dark:bg-slate-900 transition-all hover:shadow-lg hover:-translate-y-0.5 ${isLive ? "border-red-200 dark:border-red-900/50" : "border-slate-200 dark:border-slate-800"}`}
    >
      <div className="relative aspect-[16/9] overflow-hidden bg-slate-100">
        <img src={auction.images[0]} alt={auction.title} className="size-full object-cover transition-transform duration-500 group-hover:scale-105" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
        <div className="absolute top-3 start-3"><StatusBadge status={status} /></div>
        {auction.featured && (
          <div className="absolute top-3 end-3">
            <span className="px-2 py-0.5 rounded-full bg-amber-500 text-white text-[11px] font-semibold uppercase tracking-wide">{t("auction.featured")}</span>
          </div>
        )}
        <div className="absolute bottom-3 end-3 flex items-center gap-1 bg-black/60 backdrop-blur-sm text-white px-2 py-1 rounded-lg text-xs">
          <Eye className="size-3" />{auction.views.toLocaleString()}
        </div>
      </div>

      <div className="p-4">
        <p className="font-semibold text-slate-900 dark:text-slate-100 truncate">{auction.title}</p>
        <p className="text-xs text-slate-500 mt-0.5">{auction.year} · {auction.mileage.toLocaleString()} km · {auction.location}</p>

        <div className="mt-3 flex items-end justify-between gap-2">
          <div>
            <p className="text-[11px] text-slate-500 uppercase tracking-wide">
              {isLive ? t("auction.currentBid") : isUpcoming ? t("auction.startingPrice") : t("auction.finalBid")}
            </p>
            <p className={`text-xl font-bold tabular-nums ${isLive ? "text-red-600" : "text-slate-900 dark:text-slate-100"}`}>
              {formatCurrency(auction.currentBid)}
            </p>
            {isLive && auction.currentBid >= auction.reservePrice && (
              <p className="text-[10px] text-emerald-600 font-medium mt-0.5">✓ {t("auction.reserveMet")}</p>
            )}
          </div>
          <div className="text-end">
            <p className="text-[11px] text-slate-500 uppercase tracking-wide mb-1">
              {isLive ? t("auction.endsIn") : isUpcoming ? t("auction.startsIn") : t("auction.duration")}
            </p>
            {isLive || isUpcoming ? (
              <Countdown endTime={isLive ? auction.endTime : auction.startTime} compact />
            ) : (
              <span className="text-xs text-slate-500">
                {new Date(auction.endTime).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" })}
              </span>
            )}
          </div>
        </div>

        <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
          <span className="flex items-center gap-1">
            <Gavel className="size-3" />{auction.bids.length} {auction.bids.length !== 1 ? t("auction.bids") : t("auction.bid")}
          </span>
          <span className="flex items-center gap-1">
            <Heart className="size-3" />{auction.watchers} {t("auction.watching")}
          </span>
          <span className="px-3 py-1.5 rounded-lg text-xs font-medium bg-blue-600 text-white group-hover:bg-blue-700 transition">
            {isLive ? t("auction.bidNow") : isUpcoming ? t("auction.watch") : t("auction.view")}
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── Featured hero ────────────────────────────────────────────────────────────

function HeroUnit({ val, label }: { val: number; label: string }) {
  return (
    <div className="bg-white/20 backdrop-blur-sm rounded-lg px-2 py-1 text-center min-w-[36px]">
      <p className="text-white font-mono font-bold text-sm tabular-nums leading-tight">{String(val).padStart(2, "0")}</p>
      <p className="text-white/60 text-[9px] uppercase">{label}</p>
    </div>
  );
}

function FeaturedHero({ auction, onOpen }: { auction: Auction; onOpen: () => void }) {
  const { t } = useTranslation();
  const status = getStatus(auction);
  const { days, hours, minutes, seconds } = useCountdown(status === "upcoming" ? auction.startTime : auction.endTime);
  return (
    <div onClick={onOpen} className="relative rounded-2xl overflow-hidden cursor-pointer group h-64 sm:h-80">
      <img src={auction.images[0]} alt={auction.title} className="size-full object-cover transition-transform duration-700 group-hover:scale-105" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />
      <div className="absolute inset-0 p-6 sm:p-8 flex flex-col justify-end">
        <div className="mb-2"><StatusBadge status={status} /></div>
        <h3 className="text-white text-xl sm:text-2xl font-bold tracking-tight mb-1">{auction.title}</h3>
        <p className="text-white/70 text-sm mb-3">{auction.year} · {auction.mileage.toLocaleString()} km · {auction.location}</p>
        <div className="flex flex-wrap items-center gap-4">
          <div>
            <p className="text-white/60 text-xs uppercase tracking-wide">{t("auction.currentBid")}</p>
            <p className="text-white text-2xl font-bold tabular-nums">{formatCurrency(auction.currentBid)}</p>
          </div>
          <div className="flex gap-1.5">
            {days > 0 && <HeroUnit val={days} label={t("auction.unitD")} />}
            <HeroUnit val={hours} label={t("auction.unitH")} />
            <HeroUnit val={minutes} label={t("auction.unitM")} />
            <HeroUnit val={seconds} label={t("auction.unitS")} />
          </div>
          <span className="ms-auto px-4 py-2 bg-white text-slate-900 rounded-xl font-semibold text-sm hover:bg-white/90 transition">
            {t("auction.bidNow")} →
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export function AuctionList({ onBack, onOpen }: Props) {
  const { t } = useTranslation();
  const { auctions } = useAuction();
  const [filterTab, setFilterTab] = useState<FilterTab>("all");
  const [q, setQ] = useState("");
  const [make, setMake] = useState("");
  const [sort, setSort] = useState<"ending" | "starting" | "bids" | "price">("ending");
  const [filtersOpen, setFiltersOpen] = useState(false);

  const allMakesLabel = t("auction.allMakes");
  const MAKES = useMemo(() => [allMakesLabel, ...listCarMakes()], [allMakesLabel]);

  const liveCount = useMemo(() => auctions.filter((a) => getStatus(a) === "live").length, [auctions]);

  const filtered = useMemo(() => {
    let list = auctions.filter((a) => {
      const s = getStatus(a);
      if (filterTab === "live" && s !== "live") return false;
      if (filterTab === "upcoming" && s !== "upcoming") return false;
      if (filterTab === "ended" && s !== "ended-sold" && s !== "ended-unsold") return false;
      if (make && a.make !== make) return false;
      if (q && !a.title.toLowerCase().includes(q.toLowerCase()) && !a.make.toLowerCase().includes(q.toLowerCase()) && !a.model.toLowerCase().includes(q.toLowerCase())) return false;
      return true;
    });
    return [...list].sort((a, b) => {
      if (sort === "ending") return a.endTime - b.endTime;
      if (sort === "starting") return a.startTime - b.startTime;
      if (sort === "bids") return b.bids.length - a.bids.length;
      if (sort === "price") return b.currentBid - a.currentBid;
      return 0;
    });
  }, [auctions, filterTab, q, make, sort]);

  const featured = useMemo(() => auctions.filter((a) => a.featured && getStatus(a) === "live").slice(0, 2), [auctions]);

  const tabs: { key: FilterTab; label: string }[] = [
    { key: "all", label: t("auction.tabAll") },
    { key: "live", label: t("auction.tabLive") },
    { key: "upcoming", label: t("auction.tabUpcoming") },
    { key: "ended", label: t("auction.tabEnded") },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center gap-4">
          <button onClick={onBack} className="flex items-center gap-2 text-slate-500 hover:text-slate-900 dark:hover:text-white transition">
            <ArrowLeft className="size-4" /><span className="hidden sm:inline text-sm">{t("auction.back")}</span>
          </button>
          <div className="flex items-center gap-2.5">
            <div className="size-9 rounded-xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center">
              <Gavel className="size-5 text-white" />
            </div>
            <div>
              <p className="font-bold tracking-tight leading-tight">{t("auction.title")}</p>
              {liveCount > 0 && (
                <p className="text-xs text-red-600 font-medium flex items-center gap-1">
                  <span className="size-1.5 rounded-full bg-red-600 animate-pulse inline-block" />
                  {liveCount} {t("auction.liveNow")}
                </p>
              )}
            </div>
          </div>
          <div className="ms-auto flex items-center gap-3"><HeaderControls /></div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Featured hero */}
        {featured.length > 0 && filterTab === "all" && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Flame className="size-4 text-orange-500" />
              <span className="font-semibold text-sm">{t("auction.featuredLive")}</span>
            </div>
            <div className={`grid gap-4 ${featured.length > 1 ? "md:grid-cols-2" : ""}`}>
              {featured.map((a) => <FeaturedHero key={a.id} auction={a} onOpen={() => onOpen(a.id)} />)}
            </div>
          </div>
        )}

        {/* Search + filters */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 space-y-3">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute start-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder={t("auction.searchPh")}
                className="w-full ps-10 pe-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 outline-none focus:border-blue-600 text-sm"
              />
            </div>
            <button
              onClick={() => setFiltersOpen((f) => !f)}
              className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm font-medium transition ${filtersOpen ? "border-blue-600 text-blue-600 bg-blue-50 dark:bg-blue-950/30" : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300"}`}
            >
              <SlidersHorizontal className="size-4" />
              <span className="hidden sm:inline">{t("auction.filters")}</span>
            </button>
          </div>

          {filtersOpen && (
            <div className="flex flex-wrap gap-3 pt-1">
              <div className="flex items-center gap-2">
                <label className="text-xs text-slate-500 uppercase tracking-wide">{t("auction.make")}</label>
                <div className="relative">
                  <select
                    value={make}
                    onChange={(e) => setMake(e.target.value === allMakesLabel ? "" : e.target.value)}
                    className="appearance-none ps-3 pe-8 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm outline-none focus:border-blue-600"
                  >
                    {MAKES.map((m) => <option key={m} value={m === allMakesLabel ? "" : m}>{m}</option>)}
                  </select>
                  <ChevronDown className="absolute end-2 top-1/2 -translate-y-1/2 size-3.5 text-slate-400 pointer-events-none" />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <label className="text-xs text-slate-500 uppercase tracking-wide">{t("auction.sort")}</label>
                <div className="relative">
                  <select
                    value={sort}
                    onChange={(e) => setSort(e.target.value as typeof sort)}
                    className="appearance-none ps-3 pe-8 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm outline-none focus:border-blue-600"
                  >
                    <option value="ending">{t("auction.endingSoonest")}</option>
                    <option value="starting">{t("auction.startingSoonest")}</option>
                    <option value="bids">{t("auction.mostBids")}</option>
                    <option value="price">{t("auction.highestBid")}</option>
                  </select>
                  <ChevronDown className="absolute end-2 top-1/2 -translate-y-1/2 size-3.5 text-slate-400 pointer-events-none" />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-1 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 w-fit">
          {tabs.map(({ key, label }) => {
            const count = key === "all" ? auctions.length
              : key === "live" ? auctions.filter((a) => getStatus(a) === "live").length
              : key === "upcoming" ? auctions.filter((a) => getStatus(a) === "upcoming").length
              : auctions.filter((a) => getStatus(a) === "ended-sold" || getStatus(a) === "ended-unsold").length;
            return (
              <button
                key={key}
                onClick={() => setFilterTab(key)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition whitespace-nowrap ${filterTab === key ? "bg-blue-600 text-white shadow-sm" : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"}`}
              >
                {key === "live" && <span className="size-1.5 rounded-full bg-current animate-pulse" />}
                {label}
                <span className={`text-xs px-1.5 py-0.5 rounded-full ${filterTab === key ? "bg-white/20" : "bg-slate-100 dark:bg-slate-800 text-slate-500"}`}>{count}</span>
              </button>
            );
          })}
        </div>

        {/* Stats bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { icon: Zap, label: t("auction.statLiveAuctions"), val: auctions.filter((a) => getStatus(a) === "live").length, color: "text-red-600" },
            { icon: Clock, label: t("auction.statUpcoming"), val: auctions.filter((a) => getStatus(a) === "upcoming").length, color: "text-blue-600" },
            { icon: CheckCircle, label: t("auction.statSold"), val: auctions.filter((a) => getStatus(a) === "ended-sold").length, color: "text-emerald-600" },
            { icon: TrendingUp, label: t("auction.statTotalBids"), val: auctions.reduce((s, a) => s + a.bids.length, 0), color: "text-purple-600" },
          ].map(({ icon: Icon, label, val, color }) => (
            <div key={label} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 px-4 py-3 flex items-center gap-3">
              <Icon className={`size-5 ${color}`} />
              <div>
                <p className="text-lg font-bold tabular-nums">{val}</p>
                <p className="text-xs text-slate-500">{label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Grid */}
        {filtered.length === 0 ? (
          <div className="text-center py-20 text-slate-400">
            <Gavel className="size-10 mx-auto mb-3 opacity-30" />
            <p className="font-medium">{t("auction.noAuctions")}</p>
            <p className="text-sm mt-1">{t("auction.adjustFilters")}</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((a) => <AuctionCard key={a.id} auction={a} onOpen={() => onOpen(a.id)} />)}
          </div>
        )}
      </div>
    </div>
  );
}
