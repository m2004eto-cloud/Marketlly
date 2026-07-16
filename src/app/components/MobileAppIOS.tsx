import React, { useState } from "react";
import {
  Search, Bell, Heart, Car, Smartphone, Gavel, House, MessageCircle,
  User, ChevronRight, Star, MapPin, Clock, SlidersHorizontal, ArrowLeft,
  Camera, Plus, X, Check, Shield, Phone, MessageSquare, Share,
  Bookmark, Settings, ChevronLeft, TrendingUp, Package, ArrowUpRight,
} from "lucide-react";
import { toast } from "sonner";

const LISTINGS_IOS = [
  { id: 1, title: "Toyota Camry 2023 XLE", price: 89000, location: "Dubai", img: "https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=400&q=80", category: "Cars", tag: "Featured", km: "8,200", year: "2023", seller: "Premium Motors", rating: 4.8, ago: "2h ago" },
  { id: 2, title: "iPhone 15 Pro Max 256GB", price: 4800, location: "Abu Dhabi", img: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=400&q=80", category: "Mobiles", tag: "New", km: null, year: null, seller: "Tech Store UAE", rating: 4.9, ago: "5h ago" },
  { id: 3, title: "Mercedes-Benz C300 2022", price: 178000, location: "Dubai", img: "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=400&q=80", category: "Cars", tag: "Hot", km: "22,400", year: "2022", seller: "Gulf Auto", rating: 4.7, ago: "1d ago" },
  { id: 4, title: "MacBook Pro M3 16-inch", price: 9200, location: "Sharjah", img: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&q=80", category: "Electronics", tag: null, km: null, year: null, seller: "iCenter UAE", rating: 4.6, ago: "1d ago" },
  { id: 5, title: "BMW X5 xDrive40i 2023", price: 245000, location: "Dubai", img: "https://images.unsplash.com/photo-1555215695-3004980ad54e?w=400&q=80", category: "Cars", tag: "Featured", km: "4,100", year: "2023", seller: "BMW Abu Dhabi", rating: 5.0, ago: "3h ago" },
  { id: 6, title: "Samsung Galaxy S24 Ultra", price: 5200, location: "Ajman", img: "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=400&q=80", category: "Mobiles", tag: null, km: null, year: null, seller: "Samsung Store", rating: 4.5, ago: "12h ago" },
];

type IOSScreen = "home" | "search" | "browse" | "detail" | "post" | "messages" | "profile";

export function MobileAppIOS() {
  const [screen, setScreen] = useState<IOSScreen>("home");
  const [activeTab, setActiveTab] = useState<"home" | "search" | "post" | "messages" | "profile">("home");
  const [selectedId, setSelectedId] = useState(1);
  const [savedIds, setSavedIds] = useState<number[]>([1, 3]);

  const selected = LISTINGS_IOS.find((l) => l.id === selectedId) || LISTINGS_IOS[0];
  const toggleSave = (id: number) => setSavedIds((s) => s.includes(id) ? s.filter((x) => x !== id) : [...s, id]);

  const tabs = [
    { id: "home" as const, icon: House, label: "Home", screen: "home" as IOSScreen },
    { id: "search" as const, icon: Search, label: "Search", screen: "search" as IOSScreen },
    { id: "post" as const, icon: Plus, label: "", screen: "post" as IOSScreen },
    { id: "messages" as const, icon: MessageCircle, label: "Messages", screen: "messages" as IOSScreen },
    { id: "profile" as const, icon: User, label: "Profile", screen: "profile" as IOSScreen },
  ];

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-900 py-8 px-4">
      <div className="mb-4 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/20 border border-blue-500/30 text-blue-400 text-xs font-semibold">
          <div className="size-1.5 rounded-full bg-blue-400" /> iOS App — SwiftUI Style
        </div>
      </div>

      {/* iPhone 15 Pro Frame */}
      <div className="relative w-80 rounded-[56px] overflow-hidden"
        style={{
          background: "linear-gradient(145deg, #2a2a2a, #1a1a1a)",
          boxShadow: "0 0 0 1px #3a3a3a, inset 0 0 0 2px #404040, 0 40px 80px -20px rgba(0,0,0,0.9), 0 0 0 8px #111",
          padding: 3,
        }}>
        <div className="rounded-[53px] overflow-hidden bg-black relative">
          {/* Dynamic island */}
          <div className="absolute top-3 left-1/2 -translate-x-1/2 z-20 w-24 h-7 rounded-full bg-black flex items-center justify-around px-4">
            <div className="size-3.5 rounded-full border-2 border-slate-700 bg-slate-900" />
            <div className="size-2 rounded-full bg-slate-800" />
          </div>

          {/* Status bar */}
          <div className="bg-white pt-10 px-6 pb-1 flex items-center justify-between text-[11px] font-semibold text-slate-900">
            <span>9:41</span>
            <div className="flex items-center gap-1">
              <span className="text-[10px]">●●●</span>
              <span className="font-bold">WiFi</span>
              <span className="text-[10px]">■■■</span>
            </div>
          </div>

          {/* Screen */}
          <div className="bg-[#F2F2F7]" style={{ height: 630 }}>
            <div className="h-full flex flex-col overflow-hidden">
              <div className="flex-1 overflow-hidden">
                {screen === "home" && <IOSHome listings={LISTINGS_IOS} savedIds={savedIds} onSave={toggleSave} onOpen={(id) => { setSelectedId(id); setScreen("detail"); }} onSearch={() => { setScreen("search"); setActiveTab("search"); }} />}
                {screen === "search" && <IOSSearch listings={LISTINGS_IOS} onOpen={(id) => { setSelectedId(id); setScreen("detail"); }} />}
                {screen === "browse" && <IOSBrowse listings={LISTINGS_IOS} savedIds={savedIds} onSave={toggleSave} onOpen={(id) => { setSelectedId(id); setScreen("detail"); }} />}
                {screen === "detail" && <IOSDetail listing={selected} onBack={() => { setScreen("home"); setActiveTab("home"); }} saved={savedIds.includes(selected.id)} onSave={() => toggleSave(selected.id)} />}
                {screen === "post" && <IOSPostAd onBack={() => { setScreen("home"); setActiveTab("home"); }} />}
                {screen === "messages" && <IOSMessages />}
                {screen === "profile" && <IOSProfile />}
              </div>

              {/* Tab bar — iOS style */}
              {!["detail", "post"].includes(screen) && (
                <div className="bg-white/80 backdrop-blur-xl border-t border-slate-200/50 px-2 pb-4 pt-2 flex items-center justify-around"
                  style={{ backdropFilter: "blur(20px) saturate(180%)" }}>
                  {tabs.map((t) => {
                    const active = activeTab === t.id;
                    return (
                      <button key={t.id} onClick={() => { setActiveTab(t.id); setScreen(t.screen); }}
                        className="flex flex-col items-center gap-0.5" style={{ minWidth: 48 }}>
                        {t.id === "post" ? (
                          <div className="size-12 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/30 -mt-5">
                            <Plus className="size-5 text-white" />
                          </div>
                        ) : (
                          <>
                            <t.icon className={`size-5 ${active ? "text-blue-500" : "text-slate-400"}`} fill={active ? "currentColor" : "none"} />
                            <span className={`text-[10px] ${active ? "text-blue-500 font-semibold" : "text-slate-500"}`}>{t.label}</span>
                          </>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Home indicator */}
          <div className="bg-white py-2 flex justify-center">
            <div className="w-28 h-1 rounded-full bg-slate-900/20" />
          </div>
        </div>
      </div>
      <p className="mt-4 text-xs text-slate-500">iOS 17 · iPhone 15 Pro</p>
    </div>
  );
}

// ─── iOS Screens ──────────────────────────────────────────────────────────────

function IOSHome({ listings, savedIds, onSave, onOpen, onSearch }: {
  listings: typeof LISTINGS_IOS; savedIds: number[];
  onSave: (id: number) => void; onOpen: (id: number) => void;
  onSearch: () => void;
}) {
  const featured = listings.slice(0, 3);
  const nearby = listings.slice(1, 5);
  return (
    <div className="h-full overflow-y-auto bg-[#F2F2F7]" style={{ scrollbarWidth: "none" }}>
      {/* Large title header */}
      <div className="px-4 pt-2 pb-1 bg-[#F2F2F7]">
        <div className="flex items-center justify-between mb-2">
          <div>
            <p className="text-[26px] font-bold text-slate-900 tracking-tight leading-tight">Marketly</p>
            <p className="text-xs text-slate-500">Dubai, UAE</p>
          </div>
          <button onClick={() => toast("Notifications")} className="size-9 rounded-full bg-white flex items-center justify-center shadow-sm relative">
            <Bell className="size-4 text-slate-700" />
            <span className="absolute top-0.5 end-0.5 size-4 rounded-full bg-red-500 text-white text-[8px] font-bold flex items-center justify-center">3</span>
          </button>
        </div>
        {/* Search bar */}
        <button onClick={onSearch} className="w-full flex items-center gap-2 px-3 py-2.5 rounded-[10px] bg-white shadow-sm text-slate-400 text-sm mb-3">
          <Search className="size-4 text-slate-400" />
          <span>Search cars, mobiles, more…</span>
          <SlidersHorizontal className="size-4 text-slate-400 ms-auto" />
        </button>
        {/* Category chips */}
        <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
          {[
            { label: "Cars", icon: Car, color: "bg-blue-500" },
            { label: "Mobiles", icon: Smartphone, color: "bg-purple-500" },
            { label: "Auctions", icon: Gavel, color: "bg-orange-500" },
            { label: "Electronics", icon: Package, color: "bg-emerald-500" },
          ].map((c) => (
            <button key={c.label} onClick={() => toast(c.label)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white shadow-sm text-xs font-medium text-slate-700 shrink-0 border border-slate-100">
              <span className={`size-5 rounded-full ${c.color} flex items-center justify-center`}>
                <c.icon className="size-3 text-white" />
              </span>
              {c.label}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 space-y-4 pb-4">
        {/* Featured cards */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-base font-bold text-slate-900">Featured</p>
            <button onClick={() => toast("See all")} className="text-sm text-blue-500 font-semibold">See All</button>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
            {featured.map((l) => (
              <button key={l.id} onClick={() => onOpen(l.id)}
                className="shrink-0 w-52 rounded-2xl overflow-hidden bg-white shadow-sm border border-slate-100/50 text-start">
                <div className="relative h-32 overflow-hidden">
                  <img src={l.img} alt={l.title} className="w-full h-full object-cover" />
                  {l.tag && (
                    <span className="absolute top-2 start-2 text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500 text-white">{l.tag}</span>
                  )}
                  <button onClick={(e) => { e.stopPropagation(); onSave(l.id); }}
                    className="absolute top-2 end-2 size-7 rounded-full bg-white/90 backdrop-blur flex items-center justify-center">
                    <Heart className={`size-3.5 ${savedIds.includes(l.id) ? "fill-red-500 text-red-500" : "text-slate-500"}`} />
                  </button>
                </div>
                <div className="p-3">
                  <p className="text-xs font-bold text-slate-900 truncate">{l.title}</p>
                  <p className="text-sm font-bold text-blue-600 mt-0.5">AED {l.price.toLocaleString()}</p>
                  <div className="flex items-center justify-between mt-1.5">
                    <div className="flex items-center gap-0.5">
                      <MapPin className="size-2.5 text-slate-400" />
                      <span className="text-[10px] text-slate-500">{l.location}</span>
                    </div>
                    <div className="flex items-center gap-0.5">
                      <Star className="size-2.5 text-amber-400 fill-amber-400" />
                      <span className="text-[10px] text-slate-500">{l.rating}</span>
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Nearby listings */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-base font-bold text-slate-900">Nearby Listings</p>
            <button onClick={() => toast("See all")} className="text-sm text-blue-500 font-semibold">See All</button>
          </div>
          <div className="space-y-2">
            {nearby.map((l) => (
              <button key={l.id} onClick={() => onOpen(l.id)}
                className="w-full flex gap-3 items-center p-3 rounded-2xl bg-white shadow-sm border border-slate-100/50 text-start">
                <img src={l.img} alt={l.title} className="size-16 rounded-xl object-cover shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-slate-900 truncate">{l.title}</p>
                  <p className="text-blue-600 font-bold text-sm">AED {l.price.toLocaleString()}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <MapPin className="size-3 text-slate-400" />
                    <span className="text-[10px] text-slate-500">{l.location}</span>
                    <Clock className="size-3 text-slate-400 ms-1" />
                    <span className="text-[10px] text-slate-500">{l.ago}</span>
                  </div>
                </div>
                <button onClick={(e) => { e.stopPropagation(); onSave(l.id); }}>
                  <Heart className={`size-4 ${savedIds.includes(l.id) ? "fill-red-500 text-red-500" : "text-slate-300"}`} />
                </button>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function IOSSearch({ listings, onOpen }: { listings: typeof LISTINGS_IOS; onOpen: (id: number) => void }) {
  const [q, setQ] = useState("");
  const filtered = listings.filter((l) => !q || l.title.toLowerCase().includes(q.toLowerCase()));
  const recents = ["Toyota Camry", "iPhone 15 Pro", "BMW X5", "MacBook Pro"];
  return (
    <div className="h-full flex flex-col bg-[#F2F2F7]">
      <div className="px-4 pt-2 pb-2 bg-[#F2F2F7]">
        <p className="text-[26px] font-bold text-slate-900 tracking-tight mb-2">Search</p>
        <div className="flex items-center gap-2 px-3 py-2 rounded-[10px] bg-white shadow-sm">
          <Search className="size-4 text-slate-400 shrink-0" />
          <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="Cars, mobiles, electronics…" className="bg-transparent flex-1 text-sm outline-none" />
          {q && <button onClick={() => setQ("")}><X className="size-3.5 text-slate-400" /></button>}
        </div>
      </div>
      <div className="flex-1 overflow-y-auto px-4" style={{ scrollbarWidth: "none" }}>
        {!q && (
          <div className="mt-2">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Recents</p>
            {recents.map((r) => (
              <button key={r} onClick={() => setQ(r)} className="w-full flex items-center gap-3 py-2.5 border-b border-slate-200/60 text-start">
                <Clock className="size-4 text-slate-400" />
                <span className="flex-1 text-sm text-slate-700">{r}</span>
                <ArrowUpRight className="size-3.5 text-slate-400" />
              </button>
            ))}
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mt-4 mb-2">Trending</p>
            {["Mercedes GLE 2023", "PlayStation 5", "Dubai Marina Bikes"].map((t) => (
              <button key={t} onClick={() => setQ(t)} className="w-full flex items-center gap-3 py-2.5 border-b border-slate-200/60 text-start">
                <TrendingUp className="size-4 text-slate-400" />
                <span className="flex-1 text-sm text-slate-700">{t}</span>
              </button>
            ))}
          </div>
        )}
        {q && (
          <div className="space-y-2 pt-2">
            {filtered.map((l) => (
              <button key={l.id} onClick={() => onOpen(l.id)} className="w-full flex gap-3 items-center p-3 rounded-2xl bg-white shadow-sm text-start">
                <img src={l.img} alt={l.title} className="size-14 rounded-xl object-cover shrink-0" />
                <div>
                  <p className="text-sm font-bold text-slate-900 truncate max-w-[180px]">{l.title}</p>
                  <p className="text-blue-600 font-bold text-sm">AED {l.price.toLocaleString()}</p>
                  <p className="text-xs text-slate-500">{l.location}</p>
                </div>
              </button>
            ))}
            {filtered.length === 0 && <p className="text-center text-sm text-slate-400 py-8">No results</p>}
          </div>
        )}
      </div>
    </div>
  );
}

function IOSBrowse({ listings, savedIds, onSave, onOpen }: {
  listings: typeof LISTINGS_IOS; savedIds: number[];
  onSave: (id: number) => void; onOpen: (id: number) => void;
}) {
  return (
    <div className="h-full overflow-y-auto bg-[#F2F2F7] px-4 pt-4 space-y-2 pb-4" style={{ scrollbarWidth: "none" }}>
      {listings.map((l) => (
        <button key={l.id} onClick={() => onOpen(l.id)} className="w-full flex gap-3 items-center p-3 rounded-2xl bg-white shadow-sm text-start">
          <img src={l.img} alt={l.title} className="size-20 rounded-xl object-cover shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-slate-900 truncate">{l.title}</p>
            <p className="text-blue-600 font-bold text-sm mt-0.5">AED {l.price.toLocaleString()}</p>
            {l.km && <p className="text-xs text-slate-500">{l.km} km · {l.year}</p>}
            <div className="flex items-center gap-2 mt-1">
              <MapPin className="size-3 text-slate-400" />
              <span className="text-[10px] text-slate-500">{l.location}</span>
              {l.tag && <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-600 ms-auto">{l.tag}</span>}
            </div>
          </div>
          <Heart className={`size-4 shrink-0 ${savedIds.includes(l.id) ? "fill-red-500 text-red-500" : "text-slate-300"}`}
            onClick={(e) => { e.stopPropagation(); onSave(l.id); }} />
        </button>
      ))}
    </div>
  );
}

function IOSDetail({ listing, onBack, saved, onSave }: {
  listing: typeof LISTINGS_IOS[0]; onBack: () => void; saved: boolean; onSave: () => void;
}) {
  return (
    <div className="h-full flex flex-col bg-white overflow-hidden">
      <div className="relative h-60 shrink-0">
        <img src={listing.img} alt={listing.title} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        {/* Nav */}
        <div className="absolute top-0 inset-x-0 flex items-center justify-between px-4 pt-3">
          <button onClick={onBack} className="flex items-center gap-1 text-white text-sm font-semibold">
            <ChevronLeft className="size-5" /> Back
          </button>
          <div className="flex gap-3">
            <button onClick={onSave}>
              <Heart className={`size-5 ${saved ? "fill-white text-white" : "text-white"}`} />
            </button>
            <button onClick={() => toast("Link shared")}>
              <Share className="size-5 text-white" />
            </button>
          </div>
        </div>
        {/* Price overlay */}
        <div className="absolute bottom-3 start-4 end-4 flex items-end justify-between">
          <div>
            <p className="text-white font-bold text-lg leading-tight">{listing.title}</p>
            <p className="text-white/80 text-xs">{listing.location} · {listing.ago}</p>
          </div>
          <p className="text-white font-bold text-xl">AED {listing.price.toLocaleString()}</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: "none" }}>
        <div className="px-4 py-3 space-y-3">
          {/* Quick info */}
          {listing.km && (
            <div className="flex gap-2">
              {[["Mileage", `${listing.km} km`], ["Year", listing.year || ""], ["Location", listing.location]].map(([k, v]) => (
                <div key={k} className="flex-1 rounded-xl bg-[#F2F2F7] p-2.5 text-center">
                  <p className="text-[10px] text-slate-500">{k}</p>
                  <p className="text-xs font-bold text-slate-900">{v}</p>
                </div>
              ))}
            </div>
          )}

          {/* Seller */}
          <div className="flex items-center gap-3 p-3 rounded-2xl border border-slate-200">
            <div className="size-11 rounded-full bg-blue-100 flex items-center justify-center">
              <span className="text-blue-700 font-bold">{listing.seller.charAt(0)}</span>
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-slate-900">{listing.seller}</p>
              <div className="flex items-center gap-1 mt-0.5">
                <Star className="size-3 text-amber-400 fill-amber-400" />
                <span className="text-xs text-slate-500">{listing.rating} · Verified</span>
                <Shield className="size-3 text-blue-500 ms-1" />
              </div>
            </div>
            <button onClick={() => toast("Viewing profile")} className="text-blue-500 text-xs font-semibold">View</button>
          </div>

          {/* Description */}
          <div>
            <p className="text-sm font-bold text-slate-900 mb-1">About</p>
            <p className="text-sm text-slate-600 leading-relaxed">
              Excellent condition. Single owner, full service history. All documents clear and ready for transfer. No accidents, smoke-free. Available for test drive in {listing.location}.
            </p>
          </div>

          {/* Features */}
          <div className="grid grid-cols-3 gap-2">
            {["No Accidents", "Service Record", "Warranty"].map((f) => (
              <div key={f} className="flex flex-col items-center gap-1 p-2.5 rounded-xl bg-blue-50 border border-blue-100">
                <Check className="size-4 text-blue-600" />
                <span className="text-[9px] text-center text-blue-700 font-semibold">{f}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="px-4 py-3 border-t border-slate-200/50 bg-white flex gap-2">
        <button onClick={() => toast("Calling seller…")}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-[14px] border border-slate-300 text-slate-700 text-sm font-semibold">
          <Phone className="size-4" /> Call
        </button>
        <button onClick={() => toast("Opening iMessage…")}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-[14px] bg-blue-500 text-white text-sm font-semibold shadow-lg shadow-blue-500/25">
          <MessageSquare className="size-4" /> Message
        </button>
      </div>
    </div>
  );
}

function IOSPostAd({ onBack }: { onBack: () => void }) {
  const [step, setStep] = useState(1);
  return (
    <div className="h-full flex flex-col bg-[#F2F2F7]">
      <div className="px-4 pt-3 pb-2 bg-white border-b border-slate-200/50">
        <div className="flex items-center justify-between mb-1">
          <button onClick={onBack} className="text-blue-500 text-sm font-semibold">Cancel</button>
          <p className="text-base font-bold text-slate-900">New Ad</p>
          <span className="text-xs text-slate-400">{step}/3</span>
        </div>
        <div className="flex gap-1 mt-2">
          {[1,2,3].map((s) => <div key={s} className={`flex-1 h-1 rounded-full transition-all ${s <= step ? "bg-blue-500" : "bg-slate-200"}`} />)}
        </div>
      </div>
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3" style={{ scrollbarWidth: "none" }}>
        {step === 1 && (
          <>
            <p className="text-[13px] font-bold text-slate-500 uppercase tracking-wide">Category</p>
            <div className="grid grid-cols-2 gap-3">
              {[["Cars", Car, "blue"], ["Mobiles", Smartphone, "purple"], ["Electronics", Package, "emerald"], ["Auctions", Gavel, "amber"]].map(([l, Icon, c]) => (
                <button key={l as string} onClick={() => toast(`Selected ${l}`)}
                  className="flex items-center gap-3 p-3 rounded-2xl bg-white shadow-sm border border-slate-100/50 text-start">
                  <span className={`size-9 rounded-xl flex items-center justify-center bg-${c}-100`}>
                    <Icon className={`size-5 text-${c}-600`} />
                  </span>
                  <span className="text-sm font-semibold text-slate-800">{l as string}</span>
                </button>
              ))}
            </div>
            <p className="text-[13px] font-bold text-slate-500 uppercase tracking-wide mt-2">Details</p>
            {["Title", "Price (AED)", "Description"].map((f) => (
              <div key={f} className="bg-white rounded-xl px-4 shadow-sm">
                <input placeholder={f} className="w-full py-3 text-sm outline-none border-b border-slate-100 last:border-0 bg-transparent" />
              </div>
            ))}
          </>
        )}
        {step === 2 && (
          <>
            <p className="text-[13px] font-bold text-slate-500 uppercase tracking-wide">Photos</p>
            <div className="grid grid-cols-3 gap-2">
              <button onClick={() => toast("Add photo")} className="aspect-square rounded-2xl border-2 border-dashed border-blue-300 bg-blue-50 flex flex-col items-center justify-center gap-1">
                <Camera className="size-6 text-blue-400" />
                <span className="text-[9px] text-blue-500 font-semibold">Add</span>
              </button>
              {[...Array(5)].map((_, i) => (
                <div key={i} className="aspect-square rounded-2xl bg-white shadow-sm flex items-center justify-center">
                  <span className="text-xs text-slate-300">{i + 1}</span>
                </div>
              ))}
            </div>
          </>
        )}
        {step === 3 && (
          <>
            <p className="text-[13px] font-bold text-slate-500 uppercase tracking-wide">Contact</p>
            {["Phone Number", "WhatsApp", "Location (City)"].map((f) => (
              <div key={f} className="bg-white rounded-xl px-4 shadow-sm">
                <input placeholder={f} className="w-full py-3 text-sm outline-none border-b border-slate-100 last:border-0 bg-transparent" />
              </div>
            ))}
          </>
        )}
      </div>
      <div className="px-4 py-3 bg-white border-t border-slate-200/50 flex gap-2">
        {step > 1 && (
          <button onClick={() => setStep(step - 1)} className="px-5 py-3 rounded-[14px] border border-slate-300 text-sm font-semibold text-slate-700">Back</button>
        )}
        <button onClick={() => { if (step < 3) setStep(step + 1); else { toast.success("Ad posted!"); onBack(); } }}
          className="flex-1 py-3 rounded-[14px] bg-blue-500 text-white text-sm font-bold shadow-lg shadow-blue-500/25">
          {step < 3 ? "Continue" : "Post Ad"}
        </button>
      </div>
    </div>
  );
}

function IOSMessages() {
  const convos = [
    { name: "Premium Motors", last: "Is the car still available?", time: "Now", unread: 2, color: "bg-blue-500" },
    { name: "Tech Store UAE", last: "We have a special offer", time: "1h", unread: 0, color: "bg-purple-500" },
    { name: "Gulf Auto", last: "I will check with management", time: "3h", unread: 1, color: "bg-green-500" },
    { name: "iCenter UAE", last: "Thank you for your interest", time: "1d", unread: 0, color: "bg-amber-500" },
  ];
  return (
    <div className="h-full flex flex-col bg-[#F2F2F7]">
      <div className="px-4 pt-2 pb-2">
        <p className="text-[26px] font-bold text-slate-900 tracking-tight">Messages</p>
      </div>
      <div className="flex-1 overflow-y-auto bg-white mx-0" style={{ scrollbarWidth: "none" }}>
        {convos.map((c, i) => (
          <button key={i} onClick={() => toast(`Chat with ${c.name}`)}
            className="w-full flex items-center gap-3 px-4 py-3.5 border-b border-slate-100 text-start">
            <div className={`size-11 rounded-full ${c.color} flex items-center justify-center`}>
              <span className="text-white font-bold text-sm">{c.name.charAt(0)}</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <p className="text-sm font-bold text-slate-900">{c.name}</p>
                <span className="text-[11px] text-slate-400">{c.time}</span>
              </div>
              <p className="text-xs text-slate-500 truncate mt-0.5">{c.last}</p>
            </div>
            {c.unread > 0 ? (
              <span className="size-5 rounded-full bg-blue-500 text-white text-[10px] font-bold flex items-center justify-center">{c.unread}</span>
            ) : (
              <ChevronRight className="size-4 text-slate-300" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

function IOSProfile() {
  const items = [
    { label: "My Listings", sub: "6 active", icon: Package },
    { label: "Saved Ads", sub: "12 saved", icon: Bookmark },
    { label: "My Bids", sub: "3 active", icon: Gavel },
    { label: "KYC Verification", sub: "Verified", icon: Shield },
    { label: "Notifications", sub: "Enabled", icon: Bell },
    { label: "Settings", sub: null, icon: Settings },
  ];
  return (
    <div className="h-full overflow-y-auto bg-[#F2F2F7]" style={{ scrollbarWidth: "none" }}>
      <div className="px-4 pt-2 pb-4 flex flex-col items-center">
        <p className="text-[26px] font-bold text-slate-900 tracking-tight self-start mb-3">Profile</p>
        <div className="size-20 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/30 mb-2">
          <span className="text-white font-bold text-3xl">A</span>
        </div>
        <p className="text-lg font-bold text-slate-900">Ahmed Al Mansoori</p>
        <p className="text-sm text-slate-500">ahmed@example.ae</p>
        <div className="flex items-center gap-1 mt-1">
          <Shield className="size-3.5 text-blue-500" />
          <span className="text-xs text-blue-500 font-semibold">Verified member</span>
        </div>
        <div className="flex gap-8 mt-3">
          {[["6", "Listings"], ["12", "Saved"], ["3", "Bids"]].map(([n, l]) => (
            <div key={l} className="text-center">
              <p className="text-lg font-bold text-slate-900">{n}</p>
              <p className="text-xs text-slate-500">{l}</p>
            </div>
          ))}
        </div>
      </div>
      <div className="mx-4 rounded-2xl overflow-hidden bg-white shadow-sm">
        {items.map((item, i) => (
          <button key={item.label} onClick={() => toast(item.label)}
            className="w-full flex items-center gap-3 px-4 py-3.5 border-b border-slate-100 last:border-0 text-start">
            <span className="size-8 rounded-xl bg-blue-100 flex items-center justify-center">
              <item.icon className="size-4 text-blue-600" />
            </span>
            <div className="flex-1">
              <p className="text-sm font-medium text-slate-800">{item.label}</p>
              {item.sub && <p className="text-xs text-slate-400">{item.sub}</p>}
            </div>
            <ChevronRight className="size-4 text-slate-300" />
          </button>
        ))}
      </div>
    </div>
  );
}
