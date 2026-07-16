import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
  ArrowLeft, Gavel, Heart, Share2, Eye, ChevronLeft, ChevronRight,
  Clock, MapPin, CheckCircle, XCircle, ShieldCheck, Info,
  Fuel, Settings2, Gauge, Palette, Hash, Calendar,
} from "lucide-react";
import { useAuction, getStatus, useCountdown, type Bid } from "../AuctionContext";
import { HeaderControls } from "./HeaderControls";
import { formatCurrency } from "../utils";
import { toast } from "sonner";

type User = { name: string; role: "customer" | "dealer" | "admin" } | null;
type Props = { id: string; onBack: () => void; user: User; onLogin: () => void };

function LiveCountdown({ endTime }: { endTime: number }) {
  const { t } = useTranslation();
  const { days, hours, minutes, seconds, isExpired } = useCountdown(endTime);
  if (isExpired) return <div className="text-red-500 font-bold text-lg">{t("auction.auctionEnded")}</div>;
  const urgent = days === 0 && hours === 0 && minutes < 10;
  return (
    <div className={`flex gap-2 ${urgent ? "animate-pulse" : ""}`}>
      {days > 0 && <CDUnit val={days} label={t("auction.unitDays")} urgent={urgent} />}
      <CDUnit val={hours} label={t("auction.unitHrs")} urgent={urgent} />
      <CDUnit val={minutes} label={t("auction.unitMin")} urgent={urgent} />
      <CDUnit val={seconds} label={t("auction.unitSec")} urgent={urgent} />
    </div>
  );
}

function CDUnit({ val, label, urgent }: { val: number; label: string; urgent: boolean }) {
  return (
    <div className={`flex flex-col items-center rounded-xl px-3 py-2 min-w-[52px] ${urgent ? "bg-red-50 dark:bg-red-950/40 ring-1 ring-red-200 dark:ring-red-800" : "bg-slate-100 dark:bg-slate-800"}`}>
      <span className={`font-mono text-2xl font-black tabular-nums leading-none ${urgent ? "text-red-600" : "text-slate-900 dark:text-slate-100"}`}>{String(val).padStart(2, "0")}</span>
      <span className={`text-[10px] uppercase tracking-wider mt-0.5 ${urgent ? "text-red-400" : "text-slate-500"}`}>{label}</span>
    </div>
  );
}

function BidRow({ bid, index, total }: { bid: Bid; index: number; total: number }) {
  const { t } = useTranslation();
  const isLeading = index === total - 1;
  const timeAgo = (() => {
    const diff = Date.now() - bid.timestamp;
    if (diff < 60_000) return `${Math.floor(diff / 1000)}s ago`;
    if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`;
    if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ago`;
    return `${Math.floor(diff / 86_400_000)}d ago`;
  })();
  return (
    <div className={`flex items-center gap-3 py-2.5 px-3 rounded-xl transition ${isLeading ? "bg-blue-50 dark:bg-blue-950/30 ring-1 ring-blue-200 dark:ring-blue-800" : "hover:bg-slate-50 dark:hover:bg-slate-800/50"}`}>
      <div className={`size-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${isLeading ? "bg-blue-600 text-white" : "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300"}`}>
        {bid.bidderName.charAt(0)}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="text-sm font-medium truncate">{bid.bidderName}</span>
          {bid.isAdmin && <span className="px-1.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400 text-[10px] font-semibold">{t("auction.adminBadge")}</span>}
          {isLeading && <span className="px-1.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400 text-[10px] font-semibold">{t("auction.leading")}</span>}
        </div>
        <span className="text-xs text-slate-500">{timeAgo}</span>
      </div>
      <span className={`font-bold tabular-nums text-sm ${isLeading ? "text-blue-600" : "text-slate-900 dark:text-slate-100"}`}>{formatCurrency(bid.amount)}</span>
    </div>
  );
}

export function AuctionDetail({ id, onBack, user, onLogin }: Props) {
  const { t } = useTranslation();
  const { auctions, placeBid } = useAuction();
  const auction = useMemo(() => auctions.find((a) => a.id === id), [auctions, id]);
  const [imgIdx, setImgIdx] = useState(0);
  const [bidAmount, setBidAmount] = useState("");
  const [tab, setTab] = useState<"details" | "bids" | "seller">("details");
  const [watched, setWatched] = useState(false);

  if (!auction) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="text-center">
          <Gavel className="size-12 mx-auto text-slate-300 mb-3" />
          <p className="text-slate-500">{t("auction.notFound")}</p>
          <button onClick={onBack} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm">{t("auction.goBack")}</button>
        </div>
      </div>
    );
  }

  const status = getStatus(auction);
  const isLive = status === "live";
  const isUpcoming = status === "upcoming";
  const isEnded = status === "ended-sold" || status === "ended-unsold";
  const reserveMet = auction.currentBid >= auction.reservePrice;
  const userId = user ? user.name.toLowerCase().replace(/\s+/g, "-") : "";
  const isLeading = Boolean(user) && auction.currentBidderId === userId;
  const minNextBid = auction.currentBid + auction.minIncrement;

  const handleBid = () => {
    if (!user) { onLogin(); return; }
    const amount = parseFloat(bidAmount.replace(/,/g, ""));
    if (isNaN(amount)) { toast.error("Please enter a valid bid amount."); return; }
    const err = placeBid(auction.id, amount, userId, user.name, user.role === "admin");
    if (err) { toast.error(err); }
    else { toast.success(`${t("auction.placeBid")}: ${formatCurrency(amount)}`); setBidAmount(""); }
  };

  const sortedBids = [...auction.bids].sort((a, b) => a.timestamp - b.timestamp);

  const detailFields = [
    { icon: Calendar, label: t("auction.year"), val: String(auction.year) },
    { icon: Gauge, label: t("auction.mileage"), val: `${auction.mileage.toLocaleString()} km` },
    { icon: Settings2, label: t("auction.transmission"), val: auction.transmission },
    { icon: Fuel, label: t("auction.fuelType"), val: auction.fuelType },
    { icon: Palette, label: t("auction.color"), val: auction.color },
    { icon: Info, label: t("auction.condition"), val: auction.condition },
    { icon: Info, label: t("auction.bodyType"), val: auction.bodyType },
    { icon: Hash, label: t("auction.vin"), val: auction.vin.slice(0, 10) + "…" },
  ];

  const infoRows = [
    { label: t("auction.auctionId"), val: auction.id.toUpperCase() },
    { label: t("auction.startingPrice"), val: formatCurrency(auction.startingPrice) },
    { label: t("auction.reservePrice"), val: reserveMet ? `${formatCurrency(auction.reservePrice)} ✓` : t("auction.undisclosed") },
    { label: t("auction.minIncrement"), val: formatCurrency(auction.minIncrement) },
    { label: t("auction.startDate"), val: new Date(auction.startTime).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" }) },
    { label: t("auction.endDate"), val: new Date(auction.endTime).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" }) },
    { label: t("auction.tabSeller"), val: auction.sellerName },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center gap-3">
          <button onClick={onBack} className="flex items-center gap-2 text-slate-500 hover:text-slate-900 dark:hover:text-white transition">
            <ArrowLeft className="size-4" /><span className="hidden sm:inline text-sm">{t("auction.backToAuctions")}</span>
          </button>
          <div className="h-5 w-px bg-slate-200 dark:bg-slate-700" />
          <p className="text-sm font-medium truncate flex-1">{auction.title}</p>
          {isLive && (
            <span className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 bg-red-50 dark:bg-red-950/40 text-red-600 rounded-full text-xs font-semibold">
              <span className="size-1.5 rounded-full bg-red-600 animate-pulse" />{t("auction.statusLive")}
            </span>
          )}
          <div className="flex items-center gap-2">
            <button onClick={() => setWatched((w) => !w)} className={`p-2 rounded-lg border transition ${watched ? "border-red-200 bg-red-50 text-red-500 dark:bg-red-950/30 dark:border-red-800" : "border-slate-200 dark:border-slate-700 text-slate-500 hover:text-red-500"}`}>
              <Heart className={`size-4 ${watched ? "fill-current" : ""}`} />
            </button>
            <button onClick={() => toast(t("auction.linkCopied"))} className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-slate-900 dark:hover:text-white transition">
              <Share2 className="size-4" />
            </button>
            <HeaderControls />
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-[1fr_380px] gap-6">
          <div className="space-y-5">
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
              <div className="relative aspect-[16/9] bg-slate-100 dark:bg-slate-800">
                <img src={auction.images[imgIdx]} alt={auction.title} className="size-full object-cover" />
                {auction.images.length > 1 && (
                  <>
                    <button onClick={() => setImgIdx((i) => (i - 1 + auction.images.length) % auction.images.length)} className="absolute start-3 top-1/2 -translate-y-1/2 size-9 rounded-full bg-black/50 backdrop-blur text-white flex items-center justify-center hover:bg-black/70 transition">
                      <ChevronLeft className="size-5" />
                    </button>
                    <button onClick={() => setImgIdx((i) => (i + 1) % auction.images.length)} className="absolute end-3 top-1/2 -translate-y-1/2 size-9 rounded-full bg-black/50 backdrop-blur text-white flex items-center justify-center hover:bg-black/70 transition">
                      <ChevronRight className="size-5" />
                    </button>
                  </>
                )}
                <div className="absolute bottom-3 end-3 flex items-center gap-1 bg-black/60 backdrop-blur text-white text-xs px-2 py-1 rounded-lg">
                  <Eye className="size-3" />{auction.views.toLocaleString()} {t("auction.views")}
                </div>
              </div>
              {auction.images.length > 1 && (
                <div className="flex gap-2 p-3">
                  {auction.images.map((img, i) => (
                    <button key={i} onClick={() => setImgIdx(i)} className={`size-16 rounded-lg overflow-hidden border-2 transition ${i === imgIdx ? "border-blue-600" : "border-transparent"}`}>
                      <img src={img} alt="" className="size-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
              <div className="flex border-b border-slate-200 dark:border-slate-800">
                {(["details", "bids", "seller"] as const).map((tabKey) => (
                  <button key={tabKey} onClick={() => setTab(tabKey)} className={`flex-1 py-3 text-sm font-medium transition ${tab === tabKey ? "border-b-2 border-blue-600 text-blue-600" : "text-slate-500 hover:text-slate-900 dark:hover:text-white"}`}>
                    {tabKey === "details" ? t("auction.tabDetails") : tabKey === "bids" ? `${t("auction.tabBids")} (${auction.bids.length})` : t("auction.tabSeller")}
                  </button>
                ))}
              </div>
              <div className="p-5">
                {tab === "details" && (
                  <div className="space-y-5">
                    <div>
                      <h2 className="text-xl font-bold tracking-tight">{auction.title}</h2>
                      <p className="flex items-center gap-1.5 text-slate-500 text-sm mt-1"><MapPin className="size-3.5" />{auction.location}</p>
                    </div>
                    <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">{auction.description}</p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {detailFields.map(({ icon: Icon, label, val }) => (
                        <div key={label} className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-800">
                          <Icon className="size-4 text-blue-600 mt-0.5 shrink-0" />
                          <div>
                            <p className="text-xs text-slate-500 uppercase tracking-wide">{label}</p>
                            <p className="text-sm font-medium mt-0.5">{val}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/50">
                      <div className="flex items-start gap-2">
                        <ShieldCheck className="size-4 text-blue-600 mt-0.5 shrink-0" />
                        <div>
                          <p className="text-sm font-semibold text-blue-900 dark:text-blue-300">{t("auction.inspectionReport")}</p>
                          <p className="text-xs text-blue-700 dark:text-blue-400 mt-0.5">{t("auction.inspectionDetail")}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                {tab === "bids" && (
                  <div className="space-y-1">
                    {sortedBids.length === 0 ? (
                      <div className="text-center py-10 text-slate-400">
                        <Gavel className="size-8 mx-auto mb-2 opacity-30" />
                        <p className="text-sm">{t("auction.noBids")}</p>
                      </div>
                    ) : (
                      [...sortedBids].reverse().map((bid, i) => <BidRow key={bid.id} bid={bid} index={sortedBids.length - 1 - i} total={sortedBids.length} />)
                    )}
                  </div>
                )}
                {tab === "seller" && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800">
                      <div className="size-14 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-xl font-bold">
                        {auction.sellerName.charAt(0)}
                      </div>
                      <div>
                        <p className="font-semibold">{auction.sellerName}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{t("auction.verifiedDealer")}</p>
                        <div className="flex items-center gap-1 mt-1">
                          <ShieldCheck className="size-3.5 text-emerald-600" />
                          <span className="text-xs text-emerald-600 font-medium">{t("auction.kycVerified")}</span>
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800">
                        <p className="text-xs text-slate-500">{t("auction.totalAuctions")}</p>
                        <p className="font-bold text-lg mt-0.5">24</p>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800">
                        <p className="text-xs text-slate-500">{t("auction.successRate")}</p>
                        <p className="font-bold text-lg mt-0.5 text-emerald-600">94%</p>
                      </div>
                    </div>
                    <button onClick={() => toast(t("auction.messageSeller"))} className="w-full py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition">
                      {t("auction.messageSeller")}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className={`bg-white dark:bg-slate-900 rounded-2xl border overflow-hidden ${isLive ? "border-red-200 dark:border-red-900/50" : "border-slate-200 dark:border-slate-800"}`}>
              {isLive && (
                <div className="bg-gradient-to-r from-red-600 to-red-500 px-4 py-2 flex items-center gap-2">
                  <span className="size-2 rounded-full bg-white animate-pulse" />
                  <span className="text-white text-xs font-semibold uppercase tracking-widest">{t("auction.liveInProgress")}</span>
                </div>
              )}
              {isUpcoming && (
                <div className="bg-gradient-to-r from-blue-600 to-blue-500 px-4 py-2 flex items-center gap-2">
                  <Clock className="size-3.5 text-white" />
                  <span className="text-white text-xs font-semibold uppercase tracking-widest">{t("auction.startingSoon")}</span>
                </div>
              )}
              {isEnded && (
                <div className={`px-4 py-2 flex items-center gap-2 ${status === "ended-sold" ? "bg-emerald-600" : "bg-slate-500"}`}>
                  {status === "ended-sold" ? <CheckCircle className="size-3.5 text-white" /> : <XCircle className="size-3.5 text-white" />}
                  <span className="text-white text-xs font-semibold uppercase tracking-widest">
                    {status === "ended-sold" ? t("auction.closedSold") : t("auction.closedUnsold")}
                  </span>
                </div>
              )}
              <div className="p-5 space-y-4">
                <div className="text-center">
                  <p className="text-xs text-slate-500 uppercase tracking-widest mb-1">
                    {isLive ? t("auction.currentBid") : isUpcoming ? t("auction.startingPrice") : t("auction.finalBid")}
                  </p>
                  <p className={`text-4xl font-black tabular-nums tracking-tight ${isLive ? "text-red-600" : "text-slate-900 dark:text-slate-100"}`}>{formatCurrency(auction.currentBid)}</p>
                  <div className="flex items-center justify-center gap-2 mt-2">
                    {reserveMet ? (
                      <span className="flex items-center gap-1 text-xs text-emerald-600 font-medium"><CheckCircle className="size-3" />{t("auction.reserveMet")}</span>
                    ) : (
                      <span className="flex items-center gap-1 text-xs text-amber-600 font-medium"><Info className="size-3" />{t("auction.reserveNotMetShort")}</span>
                    )}
                    <span className="text-slate-300 dark:text-slate-700">·</span>
                    <span className="text-xs text-slate-500">{auction.bids.length} {auction.bids.length !== 1 ? t("auction.bids") : t("auction.bid")}</span>
                  </div>
                </div>
                {(isLive || isUpcoming) && (
                  <div className="border-t border-b border-slate-100 dark:border-slate-800 py-4">
                    <p className="text-xs text-slate-500 uppercase tracking-widest text-center mb-3">
                      {isLive ? t("auction.timeRemaining") : t("auction.startsIn2")}
                    </p>
                    <div className="flex justify-center">
                      <LiveCountdown endTime={isLive ? auction.endTime : auction.startTime} />
                    </div>
                  </div>
                )}
                {isLeading && isLive && (
                  <div className="flex items-center gap-2 p-3 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900">
                    <ShieldCheck className="size-4 text-blue-600 shrink-0" />
                    <p className="text-sm text-blue-700 dark:text-blue-300 font-medium">{t("auction.youAreLeading")}</p>
                  </div>
                )}
                {isLive && (
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs text-slate-500 uppercase tracking-wide block mb-1.5">{t("auction.yourBidMin")} {formatCurrency(minNextBid)})</label>
                      <div className="relative">
                        <span className="absolute start-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm font-medium">AED</span>
                        <input type="number" value={bidAmount} onChange={(e) => setBidAmount(e.target.value)} placeholder={minNextBid.toLocaleString()} min={minNextBid} step={auction.minIncrement} className="w-full ps-14 pe-3 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 outline-none focus:border-blue-600 text-lg font-bold tabular-nums" />
                      </div>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      {[1, 2, 5].map((mult) => (
                        <button key={mult} onClick={() => setBidAmount(String(minNextBid + auction.minIncrement * (mult - 1)))} className="flex-1 min-w-fit py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-medium hover:border-blue-600 hover:text-blue-600 transition">
                          +{formatCurrency(auction.minIncrement * mult)}
                        </button>
                      ))}
                    </div>
                    <button onClick={handleBid} className={`w-full py-3.5 rounded-xl font-bold text-sm tracking-wide transition ${user?.role === "admin" ? "bg-amber-500 hover:bg-amber-600 text-white" : "bg-blue-600 hover:bg-blue-700 text-white"}`}>
                      {user ? (user.role === "admin" ? t("auction.placeAdminBid") : t("auction.placeBid")) : t("auction.signInToBid")}
                    </button>
                    {user?.role === "admin" && (
                      <p className="text-center text-xs text-amber-600 font-medium flex items-center justify-center gap-1">
                        <ShieldCheck className="size-3" />{t("auction.adminBidNote")}
                      </p>
                    )}
                    <p className="text-center text-xs text-slate-500">
                      {t("auction.termsNote")} <button onClick={() => toast("Opening T&C…")} className="text-blue-600 underline">{t("auction.termsLink")}</button>
                    </p>
                  </div>
                )}
                {isUpcoming && (
                  <div className="space-y-3">
                    <button onClick={() => { setWatched(true); toast.success("Added to watchlist — we'll notify you when bidding opens."); }} className="w-full py-3 rounded-xl border-2 border-blue-600 text-blue-600 font-semibold text-sm hover:bg-blue-50 dark:hover:bg-blue-950/30 transition flex items-center justify-center gap-2">
                      <Heart className="size-4" />{t("auction.watchAuction")}
                    </button>
                    <p className="text-center text-xs text-slate-500">{auction.watchers + (watched ? 1 : 0)} {t("auction.watchNotify")}</p>
                  </div>
                )}
                {isEnded && (
                  <div className="text-center py-2">
                    {status === "ended-sold" && auction.currentBidder && (
                      <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900">
                        <CheckCircle className="size-6 text-emerald-600 mx-auto mb-2" />
                        <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-300">{t("auction.soldTo")} {auction.currentBidder}</p>
                        <p className="text-xs text-emerald-600 mt-0.5">{t("auction.finalPrice")} {formatCurrency(auction.currentBid)}</p>
                      </div>
                    )}
                    {status === "ended-unsold" && (
                      <div className="p-4 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                        <XCircle className="size-6 text-slate-400 mx-auto mb-2" />
                        <p className="text-sm font-medium text-slate-600 dark:text-slate-300">{t("auction.reserveNotMet")}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{t("auction.highestBidLabel")} {formatCurrency(auction.currentBid)}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 space-y-3 text-sm">
              <p className="font-semibold">{t("auction.auctionDetails")}</p>
              {infoRows.map(({ label, val }) => (
                <div key={label} className="flex items-start justify-between gap-2">
                  <span className="text-slate-500 shrink-0">{label}</span>
                  <span className="font-medium text-end">{val}</span>
                </div>
              ))}
            </div>
            {auction.bids.length > 0 && (
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4">
                <div className="flex items-center justify-between mb-3">
                  <p className="font-semibold text-sm">{t("auction.recentBids")}</p>
                  <button onClick={() => setTab("bids")} className="text-xs text-blue-600 hover:underline">{t("auction.viewAll")}</button>
                </div>
                <div className="space-y-1">
                  {[...sortedBids].reverse().slice(0, 4).map((bid, i) => <BidRow key={bid.id} bid={bid} index={sortedBids.length - 1 - i} total={sortedBids.length} />)}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
