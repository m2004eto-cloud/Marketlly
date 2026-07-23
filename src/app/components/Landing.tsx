import { useEffect, useState } from "react";
import {
  Search, MapPin, Bell, BookmarkCheck, Heart, MessageCircle, UserCog, X,
  Car, Tag, ArrowRight, Smartphone, Gavel, Flame,
  ChevronDown, User, Globe, FileText, BadgeCheck, Calendar, Wrench, Bookmark, Settings, LogOut, ShieldCheck, Zap,
  Phone, Sparkles,
} from "lucide-react";
import { authApi, messagesApi, type BillingCycle, type PlanId } from "@marketly/core";
import { useAuction, getStatus, useCountdown } from "../AuctionContext";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { HeaderControls } from "./HeaderControls";
import { MotorsMenu } from "./MotorsMenu";
import { ClassifiedsMenu } from "./ClassifiedsMenu";
import { useAuth } from "../AuthContext";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Editable } from "./Editable";
import { Banners } from "./Banners";
import { getListings } from "../data";
import { useRecentlyViewed } from "../hooks";
import { formatCurrency } from "../utils";
import { SubscriptionManager } from "./SubscriptionPlans";

type Props = {
  onNavigate: (page: string, params?: Record<string, string>) => void;
  user: { name: string; role: string } | null;
  onLogout: () => void;
};

const cityImg =
  "https://images.unsplash.com/photo-1518684079-3c830dcef090?w=1600&q=80";

// ─── Live Auctions Section ────────────────────────────────────────────────────

function AuctionCountdown({ endTime }: { endTime: number }) {
  const { t } = useTranslation();
  const { days, hours, minutes, seconds, isExpired } = useCountdown(endTime);
  if (isExpired) return <span className="text-red-400 text-xs">{t("landing.ended")}</span>;
  const urgent = days === 0 && hours === 0 && minutes < 30;
  const parts = days > 0 ? `${days}d ${hours}h ${minutes}m` : hours > 0 ? `${hours}h ${minutes}m ${seconds}s` : `${minutes}m ${seconds}s`;
  return <span className={`font-mono text-xs tabular-nums ${urgent ? "text-red-400 font-bold" : "text-white/70"}`}>{parts}</span>;
}

function LiveAuctionsSection({ onNavigate }: { onNavigate: (page: string, params?: Record<string, string>) => void }) {
  const { t } = useTranslation();
  const { auctions } = useAuction();
  const liveAuctions = auctions.filter((a) => getStatus(a) === "live").slice(0, 4);
  if (liveAuctions.length === 0) return null;

  return (
    <section className="max-w-7xl mx-auto px-4 mt-8">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="size-8 rounded-lg bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center">
            <Gavel className="size-4 text-white" />
          </div>
          <div>
            <h2 className="tracking-tight flex items-center gap-2">
              {t("landing.liveAuctions")}
              <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-red-600 text-white font-medium">
                <span className="size-1.5 rounded-full bg-white animate-pulse" />
                {t("landing.liveCount", { count: liveAuctions.length })}
              </span>
            </h2>
            <p className="text-xs text-slate-500">{t("landing.onlineBidding")}</p>
          </div>
        </div>
        <button
          onClick={() => onNavigate("auction")}
          className="flex items-center gap-1 text-sm text-blue-600 hover:underline"
        >
          {t("landing.viewAll")} <ArrowRight className="size-3.5" />
        </button>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {liveAuctions.map((a) => (
          <button
            key={a.id}
            onClick={() => onNavigate("auction-detail", { id: a.id })}
            className="group text-start rounded-2xl overflow-hidden border border-red-200 dark:border-red-900/50 bg-white dark:bg-slate-900 hover:shadow-lg hover:-translate-y-0.5 transition-all"
          >
            <div className="relative aspect-[16/9] overflow-hidden bg-slate-100">
              <img src={a.images[0]} alt={a.title} className="size-full object-cover group-hover:scale-105 transition-transform duration-500" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              <div className="absolute top-2 start-2 flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-600 text-white text-[10px] font-bold uppercase">
                <span className="size-1.5 rounded-full bg-white animate-pulse" />{t("auction.statusLive")}
              </div>
              {a.featured && (
                <div className="absolute top-2 end-2 px-1.5 py-0.5 rounded-full bg-amber-500 text-white text-[10px] font-semibold">★</div>
              )}
              <div className="absolute bottom-2 start-2 end-2 flex items-center justify-between">
                <span className="text-white font-bold text-sm tabular-nums">{formatCurrency(a.currentBid)}</span>
                <AuctionCountdown endTime={a.endTime} />
              </div>
            </div>
            <div className="p-3">
              <p className="text-sm font-semibold truncate">{a.title}</p>
              <div className="flex items-center justify-between mt-1">
                <span className="text-xs text-slate-500">
                  {t("landing.bidsWatching", { bids: a.bids.length, watchers: a.watchers })}
                </span>
                <span className="text-xs text-blue-600 font-medium group-hover:underline">{t("auction.bidNow")}</span>
              </div>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}

export function Landing({ onNavigate, user, onLogout }: Props) {
  const { t } = useTranslation();
  const { can, user: session, upgradePlan, renewPlan } = useAuth();
  const [showBanner, setShowBanner] = useState(true);
  const [tab, setTab] = useState<"all" | "motors" | "classifieds">("all");
  const [motorsOpen, setMotorsOpen] = useState(false);
  const [classifiedsOpen, setClassifiedsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [showSubscription, setShowSubscription] = useState(false);
  const [subBusy, setSubBusy] = useState(false);
  const [unreadChats, setUnreadChats] = useState(0);
  const [comingSoonFor, setComingSoonFor] = useState<string | null>(null);
  const [showCallUs, setShowCallUs] = useState(false);

  const UAE_LOCATIONS = [
    "Dubai",
    "Abu Dhabi",
    "Ras Al Khaimah",
    "Sharjah",
    "Fujairah",
    "Ajman",
    "Umm Al Quwain",
    "Al Ain",
  ];
  const OTHER_COUNTRIES = ["Egypt", "Bahrain", "Saudi Arabia", "Kuwait", "Oman", "Qatar"];
  const SOCIALS = ["Facebook", "X", "Youtube", "Instagram"];
  const SUPPORT_PHONE = "+971 4 000 0000";
  const quota = session && session.role !== "admin" ? authApi.getAdQuotaSync(session.email) : null;

  useEffect(() => {
    if (!session || !can("canMessage")) {
      setUnreadChats(0);
      return;
    }
    const refresh = () => setUnreadChats(messagesApi.getUnreadCountSync());
    refresh();
    return messagesApi.subscribeMessages(refresh);
  }, [session, can]);

  const navCats = [
    { id: "motors", label: t("nav.motors"), badge: "" },
    { id: "classifieds", label: t("nav.classifieds"), badge: "" },
    { id: "auction", label: t("nav.auction"), badge: t("auction.statusLive") },
  ];
  const searchTabs: { id: "all" | "motors" | "classifieds"; label: string }[] = [
    { id: "all", label: t("hero.tabAll") },
    { id: "motors", label: t("nav.motors") },
    { id: "classifieds", label: t("nav.classifieds") },
  ];
  const popular: { id: string; label: string; icon: typeof Car; category: string; items: string[] }[] = [
    {
      id: "motors",
      label: t("nav.motors"),
      icon: Car,
      category: "motors",
      items: [t("landing.usedCars"), t("landing.rentalCars"), t("landing.newCars"), t("landing.exportCars")],
    },
    {
      id: "classifieds",
      label: t("nav.classifieds"),
      icon: Tag,
      category: "classifieds",
      items: [t("landing.electronics"), t("landing.computers"), t("landing.mobiles"), t("landing.cameras")],
    },
  ];
  const profileMenu = [
    { icon: User, label: t("nav.myProfile") },
    { icon: Globe, label: t("nav.publicProfile") },
    { icon: FileText, label: t("nav.myAds") },
    { icon: BadgeCheck, label: t("nav.getVerified"), verified: true },
    { icon: MessageCircle, label: t("nav.chats") },
    { icon: Heart, label: t("nav.favorites") },
    { icon: BookmarkCheck, label: t("nav.mySearches") },
    { icon: Calendar, label: t("nav.appointments"), badge: "NEW" },
    { icon: Wrench, label: t("nav.inspections"), badge: "NEW" },
    { icon: Bookmark, label: t("nav.bookmarks") },
    { icon: Settings, label: t("nav.accountSettings") },
  ];

  const categoryAllowed = (id: string) => {
    if (!session || session.role === "admin") return true;
    const map: Record<string, Parameters<typeof can>[0]> = {
      motors: "canBrowseMotors",
      classifieds: "canBrowseClassifieds",
      auction: "canBrowseAuctions",
    };
    const key = map[id];
    return key ? can(key) : true;
  };
  const visibleNavCats = navCats.filter((c) => categoryAllowed(c.id));
  const [query, setQuery] = useState("");
  const [city, setCity] = useState("Dubai");
  const { ids: recentIds } = useRecentlyViewed();
  const allListings = getListings();
  const recent = recentIds.map((id) => allListings.find((l) => l.id === id)).filter(Boolean) as typeof allListings;

  const search = () => {
    const cat = tab === "all" ? "" : tab;
    onNavigate("browse", { q: query, location: city, category: cat });
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      {showBanner && (
        <div className="bg-white border-b border-slate-200 dark:bg-slate-950 dark:border-slate-800">
          <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-center gap-3 relative">
            <p className="text-sm text-center text-slate-700 dark:text-slate-300">
              {t("landing.verifyBanner")}
            </p>
            <button
              onClick={() => toast.success(t("nav.getVerified"))}
              className="bg-[#3b6dd8] text-white px-3 py-1 rounded-md text-sm hover:bg-blue-700 whitespace-nowrap"
            >
              {t("landing.verifyNow")}
            </button>
            <button
              onClick={() => setShowBanner(false)}
              className="absolute end-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
              aria-label="close"
            >
              <X className="size-4" />
            </button>
          </div>
        </div>
      )}

      <header className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
        <div className="w-full px-6 h-16 flex items-center gap-6">
          <button onClick={() => onNavigate("landing")} className="flex items-center gap-2">
            <span className="tracking-tight bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent text-[32px] font-[Agu_Display] font-bold">{t("brand")}</span>
          </button>

          <button className="hidden md:flex items-center gap-1 text-slate-700 dark:text-slate-200 px-2 py-1 rounded hover:bg-slate-50 dark:hover:bg-slate-800">
            <MapPin className="size-4 text-slate-400" />
            <select value={city} onChange={(e) => setCity(e.target.value)} className="bg-transparent outline-none">
              <option>Dubai</option><option>Abu Dhabi</option><option>Sharjah</option><option>Ajman</option>
            </select>
          </button>

          <nav className="hidden lg:flex items-center gap-5 text-slate-600 dark:text-slate-300 ms-auto">
            <button onClick={() => toast(t("nav.notifications"))} className="flex items-center gap-1 hover:text-slate-900 dark:hover:text-white">
              <Bell className="size-4" /> {t("nav.notifications")}
            </button>
            <button onClick={() => onNavigate("browse")} className="flex items-center gap-1 hover:text-slate-900 dark:hover:text-white">
              <BookmarkCheck className="size-4" /> {t("nav.mySearches")}
            </button>
            <button onClick={() => onNavigate("browse")} className="flex items-center gap-1 hover:text-slate-900 dark:hover:text-white">
              <Heart className="size-4" /> {t("nav.favorites")}
            </button>
            <button onClick={() => onNavigate("chats")} className="relative flex items-center gap-1 hover:text-slate-900 dark:hover:text-white">
              <MessageCircle className="size-4" /> {t("nav.chats")}
              {unreadChats > 0 && (
                <span className="absolute -top-1.5 -end-2 min-w-[1.1rem] h-4 px-1 rounded-full bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center">
                  {unreadChats > 9 ? "9+" : unreadChats}
                </span>
              )}
            </button>
            {user ? (
              <div
                className="relative"
                onMouseEnter={() => setProfileOpen(true)}
                onMouseLeave={() => setProfileOpen(false)}
              >
                <button className="flex items-center gap-2 hover:text-slate-900 dark:hover:text-white">
                  <span className="size-7 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs">
                    {user.name.charAt(0).toUpperCase()}
                  </span>
                  <span className="max-w-[100px] truncate">{user.name}</span>
                  <ChevronDown className={`size-3 text-blue-600 transition ${profileOpen ? "rotate-180" : ""}`} />
                </button>
                {profileOpen && (
                  <div className="absolute end-0 top-full pt-2 z-50">
                    <div className="w-64 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl overflow-hidden">
                      <div className="px-4 py-3 flex items-center gap-2 border-b border-slate-100 dark:border-slate-800">
                        <span className="size-8 rounded-full bg-slate-900 text-white flex items-center justify-center">
                          {user.name.charAt(0).toUpperCase()}
                        </span>
                        <span className="truncate text-slate-900 dark:text-slate-100">{user.name}</span>
                      </div>
                      {user.role === "admin" && (
                        <>
                          <button
                            onClick={() => { setProfileOpen(false); onNavigate("admin"); }}
                            className="w-full flex items-center gap-3 px-4 py-2.5 text-start bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:opacity-95 border-b border-slate-100 dark:border-slate-800"
                          >
                            <ShieldCheck className="size-4" />
                            <span className="flex-1 truncate">{t("nav.adminPanel")}</span>
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/20">ADMIN</span>
                          </button>
                          <button
                            onClick={() => { setProfileOpen(false); onNavigate("mobile-android"); }}
                            className="w-full flex items-center gap-3 px-4 py-2.5 text-start hover:bg-slate-50 dark:hover:bg-slate-800 border-b border-slate-100 dark:border-slate-800"
                          >
                            <Smartphone className="size-4 text-emerald-600" />
                            <span className="flex-1 truncate text-sm">{t("nav.androidPreview")}</span>
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700">APK</span>
                          </button>
                          <button
                            onClick={() => { setProfileOpen(false); onNavigate("mobile-ios"); }}
                            className="w-full flex items-center gap-3 px-4 py-2.5 text-start hover:bg-slate-50 dark:hover:bg-slate-800 border-b border-slate-100 dark:border-slate-800"
                          >
                            <Smartphone className="size-4 text-blue-500" />
                            <span className="flex-1 truncate text-sm">{t("nav.iosPreview")}</span>
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-100 text-blue-700">IPA</span>
                          </button>
                        </>
                      )}
                      {session?.role !== "admin" && (
                        <button
                          onClick={() => { setProfileOpen(false); setShowSubscription(true); }}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-start hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 border-b border-slate-100 dark:border-slate-800"
                        >
                          <Zap className="size-4 text-amber-500" />
                          <span className="flex-1 truncate text-sm">{t("nav.subscription")}</span>
                          {quota && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-100 text-amber-800">
                              {quota.planName}
                            </span>
                          )}
                        </button>
                      )}
                      {profileMenu.map((it) => (
                        <button
                          key={it.label}
                          onClick={() => {
                            setProfileOpen(false);
                            if (it.label === t("nav.chats")) {
                              onNavigate("chats");
                              return;
                            }
                            toast(it.label);
                          }}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-start hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 border-b border-slate-100 dark:border-slate-800 last:border-0"
                        >
                          <it.icon className="size-4 text-slate-500" />
                          <span className="flex-1 truncate">{it.label}</span>
                          {"verified" in it && it.verified && <BadgeCheck className="size-4 text-blue-600 fill-blue-600 text-white" />}
                          {"badge" in it && it.badge && <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-600 text-white">{it.badge}</span>}
                        </button>
                      ))}
                      <button
                        onClick={() => { setProfileOpen(false); onLogout(); toast.success(t("nav.signOut")); }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-start hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200"
                      >
                        <LogOut className="size-4 text-slate-500" />
                        <span>{t("nav.signOut")}</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button onClick={() => onNavigate("auth")} className="flex items-center gap-1 hover:text-slate-900 dark:hover:text-white">
                <UserCog className="size-4" /> {t("nav.login")}
              </button>
            )}
          </nav>

          <div className="flex items-center gap-2 ms-auto lg:ms-0">
            <HeaderControls />
            {session && can("canPostAuction") && (session.role === "dealer" || session.role === "admin") && (
              <button
                onClick={() => onNavigate("post")}
                className="px-3 py-2 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 dark:border-red-900 dark:hover:bg-red-950/30 whitespace-nowrap text-sm font-medium inline-flex items-center gap-1.5"
              >
                <Gavel className="size-3.5" /> {t("nav.postAuction")}
              </button>
            )}
            {(!session || can("canPostAds")) && (
              <button onClick={() => onNavigate("post")} className="px-4 py-2 rounded-lg bg-[#2563eb] text-white hover:bg-[#1d4ed8] whitespace-nowrap">
                <Editable id="landing.placeAdBtn" page="Landing" label="Place Your Ad Button" defaultValue={t("nav.placeAd")} />
              </button>
            )}
          </div>
        </div>

        <div className="border-t border-slate-200 dark:border-slate-800 relative">
          <div className="w-full px-6 h-12 flex items-center gap-6 text-slate-700 dark:text-slate-200 relative">
            {visibleNavCats.map((c) => {
              const isMotors = c.id === "motors";
              const isClassifieds = c.id === "classifieds";
              const isAuction = c.id === "auction";
              const open = (isMotors && motorsOpen) || (isClassifieds && classifiedsOpen);
              return (
                <div
                  key={c.id}
                  className="relative"
                  onMouseEnter={() => {
                    if (isMotors) setMotorsOpen(true);
                    if (isClassifieds) setClassifiedsOpen(true);
                  }}
                  onMouseLeave={() => {
                    if (isMotors) setMotorsOpen(false);
                    if (isClassifieds) setClassifiedsOpen(false);
                  }}
                >
                  <button
                    onClick={() => {
                      if (isAuction) { onNavigate("auction"); return; }
                      onNavigate("browse", { category: c.id });
                    }}
                    className={`flex items-center gap-2 whitespace-nowrap hover:text-blue-600 h-12 ${open ? "text-[#2563eb]" : ""} ${isAuction ? "text-red-600 hover:text-red-700 font-semibold" : ""}`}
                  >
                    {isAuction && <span className="size-1.5 rounded-full bg-red-600 animate-pulse" />}
                    {c.label}
                    {c.badge && !isAuction && <span className="text-xs px-1.5 py-0.5 rounded bg-[#2563eb] text-white">{c.badge}</span>}
                    {isAuction && <span className="text-xs px-1.5 py-0.5 rounded bg-red-600 text-white">{c.badge}</span>}
                  </button>
                  {isMotors && motorsOpen && (
                    <MotorsMenu onPick={(p) => onNavigate("browse", p)} onClose={() => setMotorsOpen(false)} />
                  )}
                  {isClassifieds && classifiedsOpen && (
                    <ClassifiedsMenu onPick={(p) => onNavigate("browse", p)} onClose={() => setClassifiedsOpen(false)} />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </header>

      <Banners placement="landing-top" className="max-w-7xl mx-auto px-4 pt-4" />

      <section className="max-w-7xl mx-auto px-4 pt-6">
        <div className="relative rounded-2xl overflow-hidden">
          <div className="absolute inset-0">
            <ImageWithFallback src={cityImg} alt="city" className="size-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/40 to-black/60" />
          </div>
          <div className="relative px-4 sm:px-8 py-10 sm:py-14">
            <h1 className="text-white text-center tracking-tight" style={{ fontSize: "clamp(1.5rem, 3.5vw, 2.25rem)" }}>
              <Editable
                id="landing.heroTitle"
                page="Landing"
                label="Hero Title"
                multiline
                defaultValue={t("hero.heroTitle", { city })}
              />
            </h1>

            <div className="mt-8 max-w-5xl mx-auto bg-white dark:bg-slate-900 rounded-xl shadow-xl p-3 sm:p-4">
              <div className="flex items-center gap-2 mb-3 overflow-x-auto">
                <span className="text-slate-500 whitespace-nowrap pe-2">{t("hero.searchingIn")}</span>
                {searchTabs.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setTab(s.id)}
                    className={`px-3 py-1.5 rounded-full whitespace-nowrap transition ${tab === s.id ? "bg-[#2563eb] text-white" : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"}`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
              <form onSubmit={(e) => { e.preventDefault(); search(); }} className="flex items-center gap-2 border border-slate-200 dark:border-slate-700 rounded-lg p-1">
                <Search className="size-5 text-slate-400 ms-2" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={t("hero.searchPh")}
                  className="flex-1 outline-none py-2 bg-transparent"
                />
                <button type="submit" className="px-6 py-2.5 rounded-md bg-[#2563eb] text-white hover:bg-[#1d4ed8]">
                  <Editable id="landing.searchBtn" page="Landing" label="Search Button" defaultValue={t("hero.search")} />
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>


      <LiveAuctionsSection onNavigate={onNavigate} />

      <section className="max-w-7xl mx-auto px-4 mt-8 mb-12">
        <h2 className="tracking-tight mb-6">{t("landing.popularCategories")}</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-x-6 gap-y-8">
          {popular.map((p) => (
            <div key={p.id}>
              <button
                onClick={() => onNavigate("browse", { category: p.category, q: p.label })}
                className="flex items-center gap-2 mb-3 text-start hover:text-blue-600 transition"
              >
                <p.icon className="size-5 text-blue-600 shrink-0" />
                <span className="tracking-tight">{p.label}</span>
              </button>
              <ul className="space-y-2">
                {p.items.map((it) => (
                  <li key={it}>
                    <button
                      onClick={() => onNavigate("browse", { category: p.category, q: it })}
                      className="text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 text-start flex items-center gap-1"
                    >
                      {it === t("landing.rentalCars") ? (
                        <span className="inline-flex items-center gap-1">
                          {it}
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-600 text-white">NEW</span>
                        </span>
                      ) : it}
                    </button>
                  </li>
                ))}
                <li>
                  <button
                    onClick={() => onNavigate("browse", { category: p.category })}
                    className="flex items-center gap-1 text-blue-600 hover:underline text-start"
                  >
                    <span>{t("landing.allIn", { label: p.label })}</span>
                    <ArrowRight className="size-3.5 shrink-0" />
                  </button>
                </li>
              </ul>
            </div>
          ))}
        </div>
      </section>

      {recent.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 mt-10">
          <p className="tracking-tight mb-4">{t("landing.recentlyViewed")}</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {recent.slice(0, 6).map((l) => (
              <button
                key={l.id}
                onClick={() => onNavigate("detail", { id: String(l.id) })}
                className="text-start rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:shadow-md transition"
              >
                <div className="aspect-[4/3] overflow-hidden">
                  <ImageWithFallback src={l.img} alt={l.title} className="size-full object-cover" />
                </div>
                <div className="p-3">
                  <p className="truncate text-sm">{l.title}</p>
                  <p className="text-blue-600 text-sm mt-1">{formatCurrency(l.price)}</p>
                </div>
              </button>
            ))}
          </div>
        </section>
      )}

      <Banners placement="landing-mid" className="max-w-7xl mx-auto px-4 mt-8" />
      <Banners placement="landing-bottom" className="max-w-7xl mx-auto px-4 mt-8" />

      <section className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 py-10">
          <p className="tracking-tight mb-4">
            <Editable id="landing.popularSearchesTitle" page="Landing" label="Popular Searches Title"
              defaultValue={t("landing.popularSearches")} />
          </p>
          <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-x-8 gap-y-2 text-sm text-slate-600 dark:text-slate-300">
            {[
              "Used Cars in Dubai", "Apartments for Rent in Dubai Marina", "Villas for Sale in Palm Jumeirah",
              "Toyota Land Cruiser", "iPhone 15 Pro Max", "MacBook Pro M3",
              "Used Cars in Abu Dhabi", "Studio for Rent in JLT", "Range Rover Sport",
              "Mercedes G63", "Furniture in Dubai", "PlayStation 5",
              "BMW M4", "Townhouses in Dubai South", "Honda Civic",
              "Office Space for Rent", "Nissan Patrol", "Apartments for Sale Downtown",
              "Tesla Model Y", "Cameras DSLR", "Porsche 911",
              "Apartments for Rent in JBR", "Audi RS6", "Mountain Bikes",
            ].map((s) => (
              null
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 py-8 flex flex-col md:flex-row md:items-center gap-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex-1">
            <p className="tracking-tight">
              <Editable id="landing.appPromoTitle" page="Landing" label="App Promo Title"
                defaultValue={t("landing.appPromoTitle")} />
            </p>
            <p className="text-[#2563eb]">
              <Editable id="landing.appPromoSub" page="Landing" label="App Promo Subtitle"
                defaultValue={t("landing.appPromoSub")} />
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button onClick={() => toast("Opening App Store…")} className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-black text-white">
              <svg viewBox="0 0 24 24" className="size-7 fill-white" aria-hidden>
                <path d="M16.365 1.43c0 1.14-.46 2.24-1.21 3.04-.81.86-2.13 1.52-3.22 1.43-.13-1.11.42-2.27 1.18-3.05.85-.88 2.27-1.55 3.25-1.42zM20.5 17.5c-.55 1.27-.81 1.83-1.51 2.95-1 1.6-2.41 3.6-4.16 3.62-1.55.02-1.95-1.01-4.06-1-2.11.01-2.55 1.02-4.1 1-1.75-.02-3.08-1.83-4.08-3.43C-.42 18.04-1.06 13.34.34 10.4 1.36 8.27 3.41 6.93 5.34 6.93c1.84 0 3 .96 4.52.96 1.47 0 2.36-.96 4.49-.96 1.7 0 3.5.94 4.79 2.55-4.21 2.31-3.53 8.31 1.36 8.02z"/>
              </svg>
              <span className="text-[10px] leading-tight text-start">Download on the<br /><span className="text-sm">App Store</span></span>
            </button>
            <button onClick={() => toast("Opening Google Play…")} className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-black text-white">
              <svg viewBox="0 0 512 512" className="size-7" aria-hidden>
                <path fill="#EA4335" d="M325.3 234.3 104.6 13l280.8 161.2-60.1 60.1z"/>
                <path fill="#FBBC04" d="m104.6 13 220.7 221.3-220.7 220.7c-7.6-3.4-12.6-10.7-12.6-19.4V32.4c0-8.7 5-16 12.6-19.4z"/>
                <path fill="#4285F4" d="m385.4 174.2 60.5 34.7c20.7 11.9 20.7 41.7 0 53.6l-60.9 34.9-65.1-60.6 65.5-62.6z"/>
                <path fill="#34A853" d="M104.6 455 325.3 234.3l60.1 60.1L104.6 455z"/>
              </svg>
              <span className="text-[10px] leading-tight text-start">GET IT ON<br /><span className="text-sm">Google Play</span></span>
            </button>
            <button onClick={() => toast("Opening AppGallery…")} className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-black text-white">
              <span className="size-7 rounded-md bg-[#e8333d] flex items-center justify-center text-[9px] tracking-tighter">HUAWEI</span>
              <span className="text-[10px] leading-tight text-start">EXPLORE IT ON<br /><span className="text-sm">AppGallery</span></span>
            </button>
          </div>
        </div>

        <div className="bg-slate-50 dark:bg-slate-900">
          <div className="max-w-7xl mx-auto px-4 py-10 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6 text-slate-600 dark:text-slate-300">
            <div>
              <p className="text-slate-900 dark:text-slate-100 mb-3">{t("landing.company")}</p>
              <ul className="space-y-2">
                <li>
                  <button type="button" onClick={() => onNavigate("about")} className="hover:text-blue-600">
                    {t("landing.aboutUs")}
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => onNavigate("contact", { reason: "advertising" })}
                    className="hover:text-blue-600"
                  >
                    {t("landing.advertising")}
                  </button>
                </li>
                <li>
                  <button type="button" onClick={() => onNavigate("sitemap")} className="hover:text-blue-600">
                    {t("landing.sitemap")}
                  </button>
                </li>
              </ul>
            </div>

            <div>
              <p className="text-slate-900 dark:text-slate-100 mb-3">UAE</p>
              <ul className="space-y-2">
                {UAE_LOCATIONS.map((loc) => (
                  <li key={loc}>
                    <button
                      type="button"
                      onClick={() => onNavigate("browse", { location: loc })}
                      className="hover:text-blue-600"
                    >
                      {loc}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <p className="text-slate-900 dark:text-slate-100 mb-3">{t("landing.otherCountries")}</p>
              <ul className="space-y-2">
                {OTHER_COUNTRIES.map((country) => (
                  <li key={country}>
                    <button
                      type="button"
                      onClick={() => onNavigate("browse", { location: country })}
                      className="hover:text-blue-600"
                    >
                      {country}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <p className="text-slate-900 dark:text-slate-100 mb-3">{t("landing.getSocial")}</p>
              <ul className="space-y-2">
                {SOCIALS.map((social) => (
                  <li key={social}>
                    <button
                      type="button"
                      onClick={() => setComingSoonFor(social)}
                      className="hover:text-blue-600"
                    >
                      {social}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <p className="text-slate-900 dark:text-slate-100 mb-3">{t("landing.support")}</p>
              <ul className="space-y-2">
                <li>
                  <button type="button" onClick={() => onNavigate("help")} className="hover:text-blue-600">
                    {t("landing.help")}
                  </button>
                </li>
                <li>
                  <button type="button" onClick={() => onNavigate("contact")} className="hover:text-blue-600">
                    {t("landing.contactUs")}
                  </button>
                </li>
                <li>
                  <button type="button" onClick={() => setShowCallUs(true)} className="hover:text-blue-600">
                    {t("landing.callUs")}
                  </button>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-200 dark:border-slate-800">
            <div className="max-w-7xl mx-auto px-4 py-5 flex items-center justify-between">
              <span className="tracking-tight text-xl bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">{t("brand")}</span>
              <p className="text-slate-500">© 2026 {t("brand")}</p>
            </div>
          </div>
        </div>
      </footer>

      {comingSoonFor && (
        <div className="fixed inset-0 z-[80] bg-black/60 flex items-center justify-center p-4" onClick={() => setComingSoonFor(null)}>
          <div
            className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 w-full max-w-sm p-6 shadow-2xl text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="size-12 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-600 flex items-center justify-center mx-auto mb-3">
              <Sparkles className="size-6" />
            </div>
            <h3 className="font-bold text-lg">Coming Soon</h3>
            <p className="text-sm text-slate-500 mt-2">
              Our {comingSoonFor} page is on the way. Follow Marketly updates for the official launch.
            </p>
            <button
              type="button"
              onClick={() => setComingSoonFor(null)}
              className="mt-5 w-full py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700"
            >
              Got it
            </button>
          </div>
        </div>
      )}

      {showCallUs && (
        <div className="fixed inset-0 z-[80] bg-black/60 flex items-center justify-center p-4" onClick={() => setShowCallUs(false)}>
          <div
            className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 w-full max-w-sm p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="size-12 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center mx-auto mb-3">
              <Phone className="size-6" />
            </div>
            <h3 className="font-bold text-lg text-center">Call Us</h3>
            <p className="text-sm text-slate-500 mt-2 text-center">
              Speak with Marketly support — Sun–Thu, 9:00–18:00 GST.
            </p>
            <a
              href={`tel:${SUPPORT_PHONE.replace(/\s/g, "")}`}
              className="mt-4 flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700"
            >
              <Phone className="size-4" /> {SUPPORT_PHONE}
            </a>
            <button
              type="button"
              onClick={() => setShowCallUs(false)}
              className="mt-2 w-full py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {showSubscription && session && session.role !== "admin" && (
        <SubscriptionManager
          role={session.role === "dealer" ? "dealer" : "customer"}
          currentPlanId={(session.subscription?.planId || quota?.planId || "free") as PlanId}
          periodEnd={quota?.periodEnd || session.subscription?.periodEnd}
          adsUsed={quota?.used ?? session.subscription?.adsUsedThisPeriod ?? 0}
          maxAds={quota?.maxAds ?? session.permissions.maxAdsPerMonth}
          status={quota?.status || session.subscription?.status}
          canRenew={Boolean(quota?.canRenew)}
          busy={subBusy}
          onClose={() => setShowSubscription(false)}
          onUpgrade={async (planId, cycle) => {
            setSubBusy(true);
            const res = await upgradePlan({ planId, billingCycle: cycle as BillingCycle });
            setSubBusy(false);
            if (!res.ok) {
              toast.error(res.error || "Upgrade failed");
              return;
            }
            toast.success(`Upgraded to ${planId}`);
            setShowSubscription(false);
          }}
          onRenew={async (cycle) => {
            setSubBusy(true);
            const res = await renewPlan(cycle as BillingCycle);
            setSubBusy(false);
            if (!res.ok) {
              toast.error(res.error || "Renew failed");
              return;
            }
            toast.success("Plan renewed — new period starts today");
            setShowSubscription(false);
          }}
        />
      )}
    </div>
  );
}
