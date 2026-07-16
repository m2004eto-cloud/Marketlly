import { useState } from "react";
import {
  Search, MapPin, Bell, BookmarkCheck, Heart, MessageCircle, UserCog, X,
  Car, Tag, ArrowRight, Smartphone, Gavel, Flame,
  ChevronDown, User, Globe, FileText, BadgeCheck, Calendar, Wrench, Bookmark, Settings, LogOut, ShieldCheck,
} from "lucide-react";
import { useAuction, getStatus, useCountdown } from "../AuctionContext";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { HeaderControls } from "./HeaderControls";
import { MotorsMenu } from "./MotorsMenu";
import { ClassifiedsMenu } from "./ClassifiedsMenu";
import { MobilesMenu } from "./MobilesMenu";
import { useApp } from "../AppContext";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Editable } from "./Editable";
import { Banners } from "./Banners";
import { LISTINGS } from "../data";
import { useRecentlyViewed } from "../hooks";
import { formatCurrency } from "../utils";

type Props = {
  onNavigate: (page: string, params?: Record<string, string>) => void;
  user: { name: string; role: string } | null;
  onLogout: () => void;
};

const cityImg =
  "https://images.unsplash.com/photo-1518684079-3c830dcef090?w=1600&q=80";

const popular: { id: string; label: string; icon: typeof Car; category: string; items: string[] }[] = [
  { id: "motors", label: "Motors", icon: Car, category: "motors", items: ["Used Cars", "Rental Cars", "New Cars", "Export Cars"] },
  { id: "classifieds", label: "Classifieds", icon: Tag, category: "classifieds", items: ["Electronics", "Computers & Networking", "Mobile Phones & Tablets", "Cameras & Imaging"] },
  { id: "mobiles", label: "Mobile Phones & Tablets", icon: Smartphone, category: "classifieds", items: ["Mobile Phones", "Mobile Phone & Tablet Accessories", "Tablets", "Other Mobile Phones & Tablets"] },
];

const navCats = [
  { id: "motors", label: "Motors", badge: "" },
  { id: "classifieds", label: "Classifieds", badge: "" },
  { id: "mobiles", label: "Mobiles & Tablets", badge: "" },
  { id: "auction", label: "Cars Auction", badge: "LIVE" },
];

const searchTabs = ["All", "Motors", "Classifieds"];

// ─── Live Auctions Section ────────────────────────────────────────────────────

function AuctionCountdown({ endTime }: { endTime: number }) {
  const { days, hours, minutes, seconds, isExpired } = useCountdown(endTime);
  if (isExpired) return <span className="text-red-400 text-xs">Ended</span>;
  const urgent = days === 0 && hours === 0 && minutes < 30;
  const parts = days > 0 ? `${days}d ${hours}h ${minutes}m` : hours > 0 ? `${hours}h ${minutes}m ${seconds}s` : `${minutes}m ${seconds}s`;
  return <span className={`font-mono text-xs tabular-nums ${urgent ? "text-red-400 font-bold" : "text-white/70"}`}>{parts}</span>;
}

function LiveAuctionsSection({ onNavigate }: { onNavigate: (page: string, params?: Record<string, string>) => void }) {
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
              Live Auctions
              <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-red-600 text-white font-medium">
                <span className="size-1.5 rounded-full bg-white animate-pulse" />{liveAuctions.length} Live
              </span>
            </h2>
            <p className="text-xs text-slate-500">Online bidding · Real-time updates</p>
          </div>
        </div>
        <button
          onClick={() => onNavigate("auction")}
          className="flex items-center gap-1 text-sm text-blue-600 hover:underline"
        >
          View all <ArrowRight className="size-3.5" />
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
                <span className="size-1.5 rounded-full bg-white animate-pulse" />LIVE
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
                <span className="text-xs text-slate-500">{a.bids.length} bids · {a.watchers} watching</span>
                <span className="text-xs text-blue-600 font-medium group-hover:underline">Bid Now</span>
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
  const { lang } = useApp();
  const [showBanner, setShowBanner] = useState(true);
  const [tab, setTab] = useState("All");
  const [motorsOpen, setMotorsOpen] = useState(false);
  const [classifiedsOpen, setClassifiedsOpen] = useState(false);
  const [mobilesOpen, setMobilesOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [city, setCity] = useState("Dubai");
  const { ids: recentIds } = useRecentlyViewed();
  const recent = recentIds.map((id) => LISTINGS.find((l) => l.id === id)).filter(Boolean) as typeof LISTINGS;

  const search = () => {
    const cat = tab.toLowerCase() === "all" ? "" : tab.toLowerCase().includes("motor") ? "motors" : tab.toLowerCase().includes("classified") ? "classifieds" : "";
    onNavigate("browse", { q: query, location: city, category: cat });
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      {showBanner && (
        <div className="bg-white border-b border-slate-200 dark:bg-slate-950 dark:border-slate-800">
          <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-center gap-3 relative">
            <p className="text-sm text-center text-slate-700 dark:text-slate-300">
              Join us in building a safer community. Get verified to boost your credibility and assist us in creating trust amongst our users!
            </p>
            <button
              onClick={() => toast.success("Verification started")}
              className="bg-[#3b6dd8] text-white px-3 py-1 rounded-md text-sm hover:bg-blue-700 whitespace-nowrap"
            >
              Verify Now
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
            <button onClick={() => toast("No new notifications")} className="flex items-center gap-1 hover:text-slate-900 dark:hover:text-white">
              <Bell className="size-4" /> Notifications
            </button>
            <button onClick={() => onNavigate("browse")} className="flex items-center gap-1 hover:text-slate-900 dark:hover:text-white">
              <BookmarkCheck className="size-4" /> My Searches
            </button>
            <button onClick={() => onNavigate("browse")} className="flex items-center gap-1 hover:text-slate-900 dark:hover:text-white">
              <Heart className="size-4" /> Favorites
            </button>
            <button onClick={() => toast("Opening chats…")} className="flex items-center gap-1 hover:text-slate-900 dark:hover:text-white">
              <MessageCircle className="size-4" /> Chats
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
                            <span className="flex-1 truncate">Admin Panel</span>
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/20">ADMIN</span>
                          </button>
                          <button
                            onClick={() => { setProfileOpen(false); onNavigate("mobile-android"); }}
                            className="w-full flex items-center gap-3 px-4 py-2.5 text-start hover:bg-slate-50 dark:hover:bg-slate-800 border-b border-slate-100 dark:border-slate-800"
                          >
                            <Smartphone className="size-4 text-emerald-600" />
                            <span className="flex-1 truncate text-sm">Android App Preview</span>
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700">APK</span>
                          </button>
                          <button
                            onClick={() => { setProfileOpen(false); onNavigate("mobile-ios"); }}
                            className="w-full flex items-center gap-3 px-4 py-2.5 text-start hover:bg-slate-50 dark:hover:bg-slate-800 border-b border-slate-100 dark:border-slate-800"
                          >
                            <Smartphone className="size-4 text-blue-500" />
                            <span className="flex-1 truncate text-sm">iOS App Preview</span>
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-100 text-blue-700">IPA</span>
                          </button>
                        </>
                      )}
                      {[
                        { icon: User, label: "My Profile" },
                        { icon: Globe, label: "My Public Profile" },
                        { icon: FileText, label: "My Ads" },
                        { icon: BadgeCheck, label: "Get Verified", verified: true },
                        { icon: MessageCircle, label: "Chats" },
                        { icon: Heart, label: "Favorites" },
                        { icon: BookmarkCheck, label: "My Searches" },
                        { icon: Calendar, label: "Car Appointments", badge: "NEW" },
                        { icon: Wrench, label: "Car Inspections", badge: "NEW" },
                        { icon: Bookmark, label: "My Bookmarks" },
                        { icon: Settings, label: "Account Settings" },
                      ].map((it) => (
                        <button
                          key={it.label}
                          onClick={() => { setProfileOpen(false); toast(it.label); }}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-start hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 border-b border-slate-100 dark:border-slate-800 last:border-0"
                        >
                          <it.icon className="size-4 text-slate-500" />
                          <span className="flex-1 truncate">{it.label}</span>
                          {it.verified && <BadgeCheck className="size-4 text-blue-600 fill-blue-600 text-white" />}
                          {it.badge && <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-600 text-white">{it.badge}</span>}
                        </button>
                      ))}
                      <button
                        onClick={() => { setProfileOpen(false); onLogout(); toast.success("Signed out"); }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-start hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200"
                      >
                        <LogOut className="size-4 text-slate-500" />
                        <span>Sign out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button onClick={() => onNavigate("auth")} className="flex items-center gap-1 hover:text-slate-900 dark:hover:text-white">
                <UserCog className="size-4" /> Login
              </button>
            )}
          </nav>

          <div className="flex items-center gap-2 ms-auto lg:ms-0">
            <HeaderControls />
            <button onClick={() => onNavigate("post")} className="px-4 py-2 rounded-lg bg-[#2563eb] text-white hover:bg-[#1d4ed8] whitespace-nowrap">
              <Editable id="landing.placeAdBtn" page="Landing" label="Place Your Ad Button" defaultValue="Place Your Ad" />
            </button>
          </div>
        </div>

        <div className="border-t border-slate-200 dark:border-slate-800 relative">
          <div className="w-full px-6 h-12 flex items-center gap-6 text-slate-700 dark:text-slate-200 relative">
            {navCats.map((c) => {
              const isMotors = c.id === "motors";
              const isClassifieds = c.id === "classifieds";
              const isMobiles = c.id === "mobiles";
              const isAuction = c.id === "auction";
              const open = (isMotors && motorsOpen) || (isClassifieds && classifiedsOpen) || (isMobiles && mobilesOpen);
              return (
                <div
                  key={c.id}
                  className={isMobiles ? "static" : "relative"}
                  onMouseEnter={() => { if (isMotors) setMotorsOpen(true); if (isClassifieds) setClassifiedsOpen(true); if (isMobiles) setMobilesOpen(true); }}
                  onMouseLeave={() => { if (isMotors) setMotorsOpen(false); if (isClassifieds) setClassifiedsOpen(false); if (isMobiles) setMobilesOpen(false); }}
                >
                  <button
                    onClick={() => {
                      if (isAuction) { onNavigate("auction"); return; }
                      onNavigate("browse", { category: isMotors ? "motors" : isClassifieds ? "classifieds" : "" });
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
                  {isMobiles && mobilesOpen && (
                    <MobilesMenu onPick={(p) => onNavigate("browse", p)} onClose={() => setMobilesOpen(false)} />
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
                defaultValue={`The best place to buy your house, sell your car or find a job in ${city}`}
              />
            </h1>

            <div className="mt-8 max-w-5xl mx-auto bg-white dark:bg-slate-900 rounded-xl shadow-xl p-3 sm:p-4">
              <div className="flex items-center gap-2 mb-3 overflow-x-auto">
                <span className="text-slate-500 whitespace-nowrap pe-2">Searching In</span>
                {searchTabs.map((s) => (
                  <button
                    key={s}
                    onClick={() => setTab(s)}
                    className={`px-3 py-1.5 rounded-full whitespace-nowrap transition ${tab === s ? "bg-[#2563eb] text-white" : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"}`}
                  >
                    {s}
                  </button>
                ))}
              </div>
              <form onSubmit={(e) => { e.preventDefault(); search(); }} className="flex items-center gap-2 border border-slate-200 dark:border-slate-700 rounded-lg p-1">
                <Search className="size-5 text-slate-400 ms-2" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search for anything"
                  className="flex-1 outline-none py-2 bg-transparent"
                />
                <button type="submit" className="px-6 py-2.5 rounded-md bg-[#2563eb] text-white hover:bg-[#1d4ed8]">
                  <Editable id="landing.searchBtn" page="Landing" label="Search Button" defaultValue="Search" />
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>


      <LiveAuctionsSection onNavigate={onNavigate} />

      <section className="max-w-7xl mx-auto px-4 mt-8 mb-12">
        <h2 className="tracking-tight mb-6">Popular Categories</h2>
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
                      {it === "Rental Cars" ? (
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
                    <span>All in {p.label}</span>
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
          <p className="tracking-tight mb-4">Recently viewed</p>
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
              defaultValue="Popular searches" />
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
                defaultValue="Find amazing deals on the go." />
            </p>
            <p className="text-[#2563eb]">
              <Editable id="landing.appPromoSub" page="Landing" label="App Promo Subtitle"
                defaultValue="Download the app now!" />
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
          <div className="max-w-7xl mx-auto px-4 py-10 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6 text-slate-600 dark:text-slate-300">
            {[
              { title: "Company", items: ["About Us", "Advertising", "Careers", "Legal Hub", "Sitemap"] },
              { title: "UAE", items: ["Dubai", "Abu Dhabi", "Ras Al Khaimah", "Sharjah", "Fujairah", "Ajman", "Umm Al Quwain", "Al Ain"] },
              { title: "Other Countries", items: ["Egypt", "Bahrain", "Saudi Arabia", "Kuwait", "Oman", "Qatar"] },
              { title: "Get Social", items: ["Facebook", "X", "Youtube", "Instagram"] },
              { title: "Support", items: ["Help", "Contact Us", "Call Us"] },
              { title: "Languages", items: ["English", "العربية"] },
            ].map((col) => (
              <div key={col.title}>
                <p className="text-slate-900 dark:text-slate-100 mb-3">{col.title}</p>
                <ul className="space-y-2">
                  {col.items.map((it) => (
                    <li key={it}>
                      <button onClick={() => toast(it)} className="hover:text-blue-600">{it}</button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="border-t border-slate-200 dark:border-slate-800">
            <div className="max-w-7xl mx-auto px-4 py-5 flex items-center justify-between">
              <span className="tracking-tight text-xl bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">{t("brand")}</span>
              <p className="text-slate-500">© 2026 {t("brand")}</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
