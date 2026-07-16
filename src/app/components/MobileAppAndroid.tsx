import React, { useState } from "react";
import {
  Search, Bell, Heart, Car, Smartphone, Gavel, Home, MessageCircle,
  User, ChevronRight, Star, MapPin, Clock, Filter, ArrowLeft,
  Camera, Plus, Settings, Shield, Check, X, TrendingUp, Zap, Package,
  ChevronLeft, Share2, Phone, MessageSquare, Eye, Bookmark,
} from "lucide-react";
import { toast } from "sonner";

// ─── Seed data ────────────────────────────────────────────────────────────────

const LISTINGS_ANDROID = [
  { id: 1, title: "Toyota Camry 2023 XLE", price: 89000, location: "Dubai", img: "https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=400&q=80", category: "Cars", badge: "Featured", km: "8,200", year: "2023", seller: "Premium Motors", rating: 4.8 },
  { id: 2, title: "iPhone 15 Pro Max 256GB", price: 4800, location: "Abu Dhabi", img: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=400&q=80", category: "Mobiles", badge: "New", km: null, year: null, seller: "Tech Store UAE", rating: 4.9 },
  { id: 3, title: "Mercedes-Benz C300 2022", price: 178000, location: "Dubai", img: "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=400&q=80", category: "Cars", badge: "Hot", km: "22,400", year: "2022", seller: "Gulf Auto", rating: 4.7 },
  { id: 4, title: "MacBook Pro M3 16-inch", price: 9200, location: "Sharjah", img: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&q=80", category: "Electronics", badge: null, km: null, year: null, seller: "iCenter UAE", rating: 4.6 },
  { id: 5, title: "BMW X5 xDrive40i 2023", price: 245000, location: "Dubai", img: "https://images.unsplash.com/photo-1555215695-3004980ad54e?w=400&q=80", category: "Cars", badge: "Featured", km: "4,100", year: "2023", seller: "BMW Abu Dhabi", rating: 5.0 },
  { id: 6, title: "Samsung Galaxy S24 Ultra", price: 5200, location: "Ajman", img: "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=400&q=80", category: "Mobiles", badge: null, km: null, year: null, seller: "Samsung Store", rating: 4.5 },
];

type AndroidScreen = "home" | "browse" | "detail" | "post" | "messages" | "profile" | "search";

// ─── Main component ────────────────────────────────────────────────────────────

export function MobileAppAndroid() {
  const [screen, setScreen] = useState<AndroidScreen>("home");
  const [selectedId, setSelectedId] = useState<number>(1);
  const [savedIds, setSavedIds] = useState<number[]>([1, 3]);
  const [activeTab, setActiveTab] = useState<"home" | "browse" | "post" | "chat" | "profile">("home");

  const selected = LISTINGS_ANDROID.find((l) => l.id === selectedId) || LISTINGS_ANDROID[0];

  const navigate = (s: AndroidScreen, tab?: "home" | "browse" | "post" | "chat" | "profile") => {
    setScreen(s);
    if (tab) setActiveTab(tab);
  };

  const tabs = [
    { id: "home" as const, icon: Home, label: "Home", screen: "home" as AndroidScreen },
    { id: "browse" as const, icon: Search, label: "Browse", screen: "browse" as AndroidScreen },
    { id: "post" as const, icon: Plus, label: "Post", screen: "post" as AndroidScreen },
    { id: "chat" as const, icon: MessageCircle, label: "Messages", screen: "messages" as AndroidScreen },
    { id: "profile" as const, icon: User, label: "Profile", screen: "profile" as AndroidScreen },
  ];

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-900 py-8 px-4">
      <div className="mb-4 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
          <div className="size-1.5 rounded-full bg-emerald-400" /> Android App — Material You
        </div>
      </div>

      {/* Android Phone Frame */}
      <div className="relative w-80 rounded-[44px] bg-slate-950 shadow-2xl shadow-black/60 border border-slate-700/50"
        style={{ boxShadow: "0 0 0 8px #0f172a, 0 0 0 10px #334155, 0 40px 80px -20px rgba(0,0,0,0.8)" }}>
        {/* Camera notch */}
        <div className="absolute top-3 left-1/2 -translate-x-1/2 w-16 h-5 rounded-full bg-slate-950 border border-slate-800 flex items-center justify-center z-20">
          <div className="size-2.5 rounded-full bg-slate-800 ring-2 ring-slate-700" />
        </div>

        {/* Status bar */}
        <div className="pt-8 px-5 pb-1 flex items-center justify-between text-[10px] text-slate-300 font-medium">
          <span>9:41</span>
          <div className="flex items-center gap-1.5">
            <span>●●●</span>
            <span>WiFi</span>
            <span>■■■</span>
          </div>
        </div>

        {/* Screen content */}
        <div className="bg-[#FAFAFA] dark:bg-[#1C1B1F] mx-3 rounded-3xl overflow-hidden" style={{ height: 640 }}>
          <div className="h-full flex flex-col overflow-hidden">
            {/* Screen */}
            <div className="flex-1 overflow-hidden">
              {screen === "home" && <AndroidHome onNavigate={navigate} listings={LISTINGS_ANDROID} savedIds={savedIds} onSave={(id) => setSavedIds((s) => s.includes(id) ? s.filter((x) => x !== id) : [...s, id])} onOpen={(id) => { setSelectedId(id); setScreen("detail"); }} />}
              {screen === "browse" && <AndroidBrowse listings={LISTINGS_ANDROID} savedIds={savedIds} onSave={(id) => setSavedIds((s) => s.includes(id) ? s.filter((x) => x !== id) : [...s, id])} onOpen={(id) => { setSelectedId(id); setScreen("detail"); }} />}
              {screen === "detail" && <AndroidDetail listing={selected} onBack={() => setScreen("browse")} saved={savedIds.includes(selected.id)} onSave={() => setSavedIds((s) => s.includes(selected.id) ? s.filter((x) => x !== selected.id) : [...s, selected.id])} />}
              {screen === "post" && <AndroidPostAd onBack={() => navigate("home", "home")} />}
              {screen === "messages" && <AndroidMessages onBack={() => navigate("home", "home")} />}
              {screen === "profile" && <AndroidProfile onBack={() => navigate("home", "home")} />}
              {screen === "search" && <AndroidSearch listings={LISTINGS_ANDROID} onOpen={(id) => { setSelectedId(id); setScreen("detail"); }} onBack={() => setScreen("home")} />}
            </div>

            {/* Bottom nav */}
            {(screen === "home" || screen === "browse") && (
              <div className="bg-white border-t border-slate-100 px-2 py-1.5 flex items-center justify-around">
                {tabs.map((t) => {
                  const active = activeTab === t.id;
                  return (
                    <button key={t.id} onClick={() => navigate(t.screen, t.id)}
                      className="flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition"
                      style={{ minWidth: 52 }}>
                      {t.id === "post"
                        ? <div className="size-10 rounded-full bg-green-600 flex items-center justify-center -mt-3 shadow-lg shadow-green-600/40"><Plus className="size-5 text-white" /></div>
                        : <t.icon className={`size-5 ${active ? "text-green-600" : "text-slate-400"}`} />}
                      {t.id !== "post" && <span className={`text-[9px] font-semibold ${active ? "text-green-600" : "text-slate-400"}`}>{t.label}</span>}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Android home indicator */}
        <div className="flex justify-center py-3">
          <div className="w-24 h-1 rounded-full bg-slate-600" />
        </div>
      </div>

      <p className="mt-4 text-xs text-slate-500">Material You · Android 14</p>
    </div>
  );
}

// ─── Screens ──────────────────────────────────────────────────────────────────

function AndroidHome({ onNavigate, listings, savedIds, onSave, onOpen }: {
  onNavigate: (s: AndroidScreen, tab?: any) => void;
  listings: typeof LISTINGS_ANDROID; savedIds: number[];
  onSave: (id: number) => void; onOpen: (id: number) => void;
}) {
  const featured = listings.slice(0, 4);
  const recent = listings.slice(2);
  return (
    <div className="h-full overflow-y-auto bg-white" style={{ scrollbarWidth: "none" }}>
      {/* Header */}
      <div className="px-4 pt-3 pb-2 bg-white sticky top-0 z-10">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-xs text-slate-500">Good morning,</p>
            <p className="font-bold text-slate-900 text-base">Ahmed Al Mansoori</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => toast("Notifications")} className="size-9 rounded-full bg-slate-100 flex items-center justify-center relative">
              <Bell className="size-4 text-slate-700" />
              <span className="absolute top-0 end-0 size-4 rounded-full bg-red-500 text-white text-[8px] font-bold flex items-center justify-center">3</span>
            </button>
            <div className="size-9 rounded-full bg-green-600 flex items-center justify-center">
              <span className="text-white font-bold text-sm">A</span>
            </div>
          </div>
        </div>
        {/* Search */}
        <button onClick={() => onNavigate("search")} className="w-full flex items-center gap-2 px-4 py-2.5 rounded-full bg-slate-100 text-slate-500 text-sm">
          <Search className="size-4" /> Search cars, mobiles, more…
        </button>
      </div>

      <div className="px-4 space-y-4 pb-4">
        {/* Categories */}
        <div>
          <p className="text-sm font-bold text-slate-900 mb-2">Categories</p>
          <div className="flex gap-3 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
            {[
              { label: "Cars", icon: Car, color: "bg-blue-100 text-blue-700" },
              { label: "Mobiles", icon: Smartphone, color: "bg-purple-100 text-purple-700" },
              { label: "Auctions", icon: Gavel, color: "bg-amber-100 text-amber-700" },
              { label: "Electronics", icon: Package, color: "bg-emerald-100 text-emerald-700" },
            ].map((c) => (
              <button key={c.label} onClick={() => onNavigate("browse", "browse")}
                className="flex flex-col items-center gap-1.5 shrink-0">
                <span className={`size-14 rounded-2xl flex items-center justify-center ${c.color}`}>
                  <c.icon className="size-6" />
                </span>
                <span className="text-[10px] font-medium text-slate-700">{c.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Featured */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-bold text-slate-900">Featured</p>
            <button onClick={() => onNavigate("browse", "browse")} className="text-xs text-green-600 font-semibold">See all</button>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
            {featured.map((l) => (
              <button key={l.id} onClick={() => onOpen(l.id)} className="shrink-0 w-44 rounded-2xl overflow-hidden border border-slate-100 shadow-sm text-start">
                <div className="relative h-28 overflow-hidden">
                  <img src={l.img} alt={l.title} className="w-full h-full object-cover" />
                  {l.badge && (
                    <span className="absolute top-2 start-2 text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-green-600 text-white">{l.badge}</span>
                  )}
                  <button onClick={(e) => { e.stopPropagation(); onSave(l.id); }}
                    className="absolute top-2 end-2 size-6 rounded-full bg-white/90 flex items-center justify-center shadow">
                    <Heart className={`size-3.5 ${savedIds.includes(l.id) ? "fill-red-500 text-red-500" : "text-slate-400"}`} />
                  </button>
                </div>
                <div className="p-2">
                  <p className="text-xs font-bold text-slate-900 truncate">{l.title}</p>
                  <p className="text-xs text-green-600 font-bold mt-0.5">AED {l.price.toLocaleString()}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <MapPin className="size-2.5 text-slate-400" />
                    <span className="text-[10px] text-slate-500">{l.location}</span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Recent */}
        <div>
          <p className="text-sm font-bold text-slate-900 mb-2">Recent listings</p>
          <div className="space-y-2">
            {recent.map((l) => (
              <button key={l.id} onClick={() => onOpen(l.id)} className="w-full flex gap-3 items-center p-2.5 rounded-2xl border border-slate-100 hover:bg-slate-50 transition text-start">
                <img src={l.img} alt={l.title} className="size-16 rounded-xl object-cover shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-slate-900 truncate">{l.title}</p>
                  <p className="text-green-600 text-sm font-bold">AED {l.price.toLocaleString()}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <MapPin className="size-3 text-slate-400" />
                    <span className="text-[10px] text-slate-500">{l.location}</span>
                    <Star className="size-3 text-amber-400 fill-amber-400 ms-auto" />
                    <span className="text-[10px] text-slate-500">{l.rating}</span>
                  </div>
                </div>
                <Heart className={`size-4 shrink-0 ${savedIds.includes(l.id) ? "fill-red-500 text-red-500" : "text-slate-300"}`}
                  onClick={(e) => { e.stopPropagation(); onSave(l.id); }} />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function AndroidBrowse({ listings, savedIds, onSave, onOpen }: {
  listings: typeof LISTINGS_ANDROID; savedIds: number[];
  onSave: (id: number) => void; onOpen: (id: number) => void;
}) {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("All");
  const cats = ["All", "Cars", "Mobiles", "Electronics", "Auctions"];
  const filtered = listings.filter((l) => (cat === "All" || l.category === cat) && (!q || l.title.toLowerCase().includes(q.toLowerCase())));
  return (
    <div className="h-full flex flex-col bg-white">
      <div className="px-4 pt-3 pb-2 sticky top-0 bg-white z-10">
        <p className="text-base font-bold text-slate-900 mb-2">Browse</p>
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-100 mb-2">
          <Search className="size-4 text-slate-400 shrink-0" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search…" className="bg-transparent flex-1 text-sm outline-none" />
          {q && <button onClick={() => setQ("")}><X className="size-3.5 text-slate-400" /></button>}
          <button onClick={() => toast("Filters")} className="size-7 rounded-lg bg-white flex items-center justify-center shadow-sm">
            <Filter className="size-3.5 text-slate-600" />
          </button>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
          {cats.map((c) => (
            <button key={c} onClick={() => setCat(c)}
              className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition ${cat === c ? "bg-green-600 text-white" : "bg-slate-100 text-slate-600"}`}>{c}</button>
          ))}
        </div>
      </div>
      <div className="flex-1 overflow-y-auto px-4 space-y-2 pb-4" style={{ scrollbarWidth: "none" }}>
        {filtered.map((l) => (
          <button key={l.id} onClick={() => onOpen(l.id)} className="w-full flex gap-3 items-center p-2.5 rounded-2xl border border-slate-100 shadow-sm text-start hover:bg-slate-50 transition">
            <img src={l.img} alt={l.title} className="size-20 rounded-xl object-cover shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-1">
                <p className="text-sm font-bold text-slate-900 truncate flex-1">{l.title}</p>
                <Heart className={`size-4 shrink-0 mt-0.5 ${savedIds.includes(l.id) ? "fill-red-500 text-red-500" : "text-slate-300"}`}
                  onClick={(e) => { e.stopPropagation(); onSave(l.id); }} />
              </div>
              <p className="text-green-600 font-bold text-sm mt-0.5">AED {l.price.toLocaleString()}</p>
              {l.km && <p className="text-xs text-slate-500 mt-0.5">{l.km} km · {l.year}</p>}
              <div className="flex items-center gap-1.5 mt-1">
                <MapPin className="size-3 text-slate-400" />
                <span className="text-[10px] text-slate-500">{l.location}</span>
                <Star className="size-3 text-amber-400 fill-amber-400 ms-1" />
                <span className="text-[10px] text-slate-500">{l.rating}</span>
                {l.badge && <span className="ms-auto text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-green-100 text-green-700">{l.badge}</span>}
              </div>
            </div>
          </button>
        ))}
        {filtered.length === 0 && <div className="text-center py-12 text-slate-400 text-sm">No listings found</div>}
      </div>
    </div>
  );
}

function AndroidDetail({ listing, onBack, saved, onSave }: {
  listing: typeof LISTINGS_ANDROID[0]; onBack: () => void; saved: boolean; onSave: () => void;
}) {
  return (
    <div className="h-full flex flex-col bg-white overflow-hidden">
      {/* Image */}
      <div className="relative h-56 shrink-0">
        <img src={listing.img} alt={listing.title} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        <button onClick={onBack} className="absolute top-3 start-3 size-8 rounded-full bg-white/90 flex items-center justify-center shadow">
          <ArrowLeft className="size-4 text-slate-700" />
        </button>
        <div className="absolute top-3 end-3 flex gap-2">
          <button onClick={onSave} className="size-8 rounded-full bg-white/90 flex items-center justify-center shadow">
            <Heart className={`size-4 ${saved ? "fill-red-500 text-red-500" : "text-slate-600"}`} />
          </button>
          <button onClick={() => toast("Link copied")} className="size-8 rounded-full bg-white/90 flex items-center justify-center shadow">
            <Share2 className="size-4 text-slate-600" />
          </button>
        </div>
      </div>
      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3" style={{ scrollbarWidth: "none" }}>
        <div>
          {listing.badge && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-green-100 text-green-700 mb-1 inline-block">{listing.badge}</span>}
          <p className="text-base font-bold text-slate-900 leading-tight">{listing.title}</p>
          <p className="text-xl font-bold text-green-600 mt-1">AED {listing.price.toLocaleString()}</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <span className="flex items-center gap-1 text-xs text-slate-600 bg-slate-100 px-2 py-1 rounded-full">
            <MapPin className="size-3" /> {listing.location}
          </span>
          {listing.km && <span className="flex items-center gap-1 text-xs text-slate-600 bg-slate-100 px-2 py-1 rounded-full">{listing.km} km</span>}
          {listing.year && <span className="flex items-center gap-1 text-xs text-slate-600 bg-slate-100 px-2 py-1 rounded-full">{listing.year}</span>}
        </div>
        <div className="flex items-center gap-3 p-3 rounded-2xl border border-slate-200">
          <div className="size-10 rounded-full bg-green-100 flex items-center justify-center">
            <span className="font-bold text-green-700 text-sm">{listing.seller.charAt(0)}</span>
          </div>
          <div>
            <p className="text-sm font-bold text-slate-900">{listing.seller}</p>
            <div className="flex items-center gap-1">
              <Star className="size-3 text-amber-400 fill-amber-400" />
              <span className="text-xs text-slate-500">{listing.rating} · Verified dealer</span>
            </div>
          </div>
          <Shield className="size-4 text-green-600 ms-auto" />
        </div>
        <p className="text-xs text-slate-600 leading-relaxed">
          Excellent condition vehicle. Single owner, full service history with authorized dealer. Non-smoker. All documents clear. Ready for immediate transfer.
        </p>
        <div className="grid grid-cols-3 gap-2">
          {["No accidents", "Full service", "Warranty"].map((f) => (
            <div key={f} className="flex flex-col items-center gap-1 p-2 rounded-xl bg-green-50">
              <Check className="size-4 text-green-600" />
              <span className="text-[9px] text-center text-green-700 font-semibold">{f}</span>
            </div>
          ))}
        </div>
      </div>
      {/* CTA */}
      <div className="px-4 py-3 bg-white border-t border-slate-100 flex gap-2">
        <button onClick={() => toast("Calling seller…")} className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-slate-100 text-slate-700 text-sm font-semibold">
          <Phone className="size-4" /> Call
        </button>
        <button onClick={() => toast("Opening chat…")} className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-green-600 text-white text-sm font-semibold shadow-md shadow-green-600/30">
          <MessageSquare className="size-4" /> Chat
        </button>
      </div>
    </div>
  );
}

function AndroidSearch({ listings, onOpen, onBack }: { listings: typeof LISTINGS_ANDROID; onOpen: (id: number) => void; onBack: () => void }) {
  const [q, setQ] = useState("");
  const filtered = listings.filter((l) => !q || l.title.toLowerCase().includes(q.toLowerCase()));
  return (
    <div className="h-full flex flex-col bg-white">
      <div className="px-4 pt-3 pb-2">
        <div className="flex items-center gap-2">
          <button onClick={onBack}><ChevronLeft className="size-5 text-slate-700" /></button>
          <div className="flex-1 flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-100">
            <Search className="size-4 text-slate-400 shrink-0" />
            <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search…" className="bg-transparent flex-1 text-sm outline-none" />
          </div>
        </div>
        {!q && (
          <div className="mt-3">
            <p className="text-xs text-slate-500 mb-2">Recent searches</p>
            {["Toyota Camry", "iPhone 15 Pro", "BMW X5"].map((s) => (
              <button key={s} onClick={() => setQ(s)} className="flex items-center gap-2 w-full py-2 text-sm text-slate-700">
                <Clock className="size-3.5 text-slate-400" /> {s}
              </button>
            ))}
          </div>
        )}
      </div>
      <div className="flex-1 overflow-y-auto px-4 space-y-2" style={{ scrollbarWidth: "none" }}>
        {filtered.map((l) => (
          <button key={l.id} onClick={() => onOpen(l.id)} className="w-full flex gap-3 items-center p-2.5 rounded-xl border border-slate-100 text-start">
            <img src={l.img} alt={l.title} className="size-14 rounded-xl object-cover shrink-0" />
            <div>
              <p className="text-sm font-bold text-slate-900 truncate max-w-[180px]">{l.title}</p>
              <p className="text-green-600 font-bold text-sm">AED {l.price.toLocaleString()}</p>
              <p className="text-xs text-slate-500">{l.location}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

function AndroidPostAd({ onBack }: { onBack: () => void }) {
  const [step, setStep] = useState(1);
  return (
    <div className="h-full flex flex-col bg-white">
      <div className="px-4 pt-3 pb-2 border-b border-slate-100">
        <div className="flex items-center gap-2 mb-3">
          <button onClick={onBack}><X className="size-5 text-slate-700" /></button>
          <p className="text-base font-bold text-slate-900">Post an ad</p>
          <span className="ms-auto text-xs text-slate-500">{step}/3</span>
        </div>
        <div className="flex gap-1">
          {[1,2,3].map((s) => <div key={s} className={`flex-1 h-1 rounded-full ${s <= step ? "bg-green-600" : "bg-slate-200"}`} />)}
        </div>
      </div>
      <div className="flex-1 overflow-y-auto px-4 py-3" style={{ scrollbarWidth: "none" }}>
        {step === 1 && (
          <div className="space-y-3">
            <p className="text-sm font-bold text-slate-700">Category & Details</p>
            <div className="grid grid-cols-2 gap-2">
              {[["Cars", Car, "bg-blue-100 text-blue-700"], ["Mobiles", Smartphone, "bg-purple-100 text-purple-700"], ["Electronics", Package, "bg-emerald-100 text-emerald-700"], ["Auctions", Gavel, "bg-amber-100 text-amber-700"]].map(([l, Icon, c]) => (
                <button key={l as string} onClick={() => toast(`Selected: ${l}`)}
                  className={`flex flex-col items-center gap-2 p-3 rounded-2xl border-2 border-transparent hover:border-green-400 bg-slate-50 transition`}>
                  <span className={`size-10 rounded-xl flex items-center justify-center ${c as string}`}>
                    <Icon className="size-5" />
                  </span>
                  <span className="text-xs font-semibold text-slate-700">{l as string}</span>
                </button>
              ))}
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">Title</label>
              <input placeholder="e.g. Toyota Camry 2023" className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm outline-none focus:border-green-500" />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">Price (AED)</label>
              <input type="number" placeholder="e.g. 85000" className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm outline-none focus:border-green-500" />
            </div>
          </div>
        )}
        {step === 2 && (
          <div className="space-y-3">
            <p className="text-sm font-bold text-slate-700">Photos</p>
            <div className="grid grid-cols-3 gap-2">
              <button onClick={() => toast("Camera opened")} className="aspect-square rounded-xl border-2 border-dashed border-slate-300 flex flex-col items-center justify-center gap-1">
                <Camera className="size-5 text-slate-400" />
                <span className="text-[9px] text-slate-400">Add photo</span>
              </button>
              {[0,1,2,3,4].map((i) => (
                <div key={i} className="aspect-square rounded-xl bg-slate-100 flex items-center justify-center">
                  <span className="text-[9px] text-slate-400">{i + 1}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        {step === 3 && (
          <div className="space-y-3">
            <p className="text-sm font-bold text-slate-700">Contact & Location</p>
            {["Phone number", "WhatsApp", "Location"].map((f) => (
              <div key={f}>
                <label className="text-xs font-semibold text-slate-600 block mb-1">{f}</label>
                <input placeholder={`Enter ${f.toLowerCase()}`} className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm outline-none focus:border-green-500" />
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="px-4 py-3 border-t border-slate-100 flex gap-2">
        {step > 1 && (
          <button onClick={() => setStep(step - 1)} className="px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700">Back</button>
        )}
        <button onClick={() => { if (step < 3) setStep(step + 1); else { toast.success("Ad posted!"); onBack(); } }}
          className="flex-1 py-2.5 rounded-xl bg-green-600 text-white text-sm font-bold shadow-md shadow-green-600/30">
          {step < 3 ? "Continue" : "Post Ad"}
        </button>
      </div>
    </div>
  );
}

function AndroidMessages({ onBack }: { onBack: () => void }) {
  const convos = [
    { name: "Premium Motors", last: "Is the car still available?", time: "2m", unread: 2, color: "bg-blue-500" },
    { name: "Tech Store UAE", last: "We have a special offer for you", time: "1h", unread: 0, color: "bg-purple-500" },
    { name: "Gulf Auto", last: "Okay, I will check with management", time: "3h", unread: 1, color: "bg-green-500" },
    { name: "iCenter UAE", last: "Thank you for your interest", time: "1d", unread: 0, color: "bg-amber-500" },
  ];
  return (
    <div className="h-full flex flex-col bg-white">
      <div className="px-4 pt-3 pb-2 border-b border-slate-100 flex items-center gap-2">
        <button onClick={onBack}><ArrowLeft className="size-5 text-slate-700" /></button>
        <p className="text-base font-bold text-slate-900">Messages</p>
      </div>
      <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: "none" }}>
        {convos.map((c, i) => (
          <button key={i} onClick={() => toast(`Opening chat with ${c.name}`)}
            className="w-full flex items-center gap-3 px-4 py-3 border-b border-slate-50 hover:bg-slate-50 transition text-start">
            <div className={`size-11 rounded-full ${c.color} flex items-center justify-center`}>
              <span className="text-white font-bold text-sm">{c.name.charAt(0)}</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <p className="text-sm font-bold text-slate-900">{c.name}</p>
                <span className="text-[10px] text-slate-400">{c.time}</span>
              </div>
              <p className="text-xs text-slate-500 truncate">{c.last}</p>
            </div>
            {c.unread > 0 && (
              <span className="size-5 rounded-full bg-green-600 text-white text-[10px] font-bold flex items-center justify-center">{c.unread}</span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

function AndroidProfile({ onBack }: { onBack: () => void }) {
  const items = [
    { label: "My Listings", icon: FileTextIcon, count: 6 },
    { label: "Saved Ads", icon: Heart, count: 12 },
    { label: "My Bids", icon: Gavel, count: 3 },
    { label: "Account Settings", icon: Settings },
    { label: "KYC Verification", icon: Shield },
    { label: "Notifications", icon: Bell },
  ];
  return (
    <div className="h-full flex flex-col bg-white overflow-y-auto" style={{ scrollbarWidth: "none" }}>
      <div className="px-4 pt-3 flex items-center gap-2">
        <button onClick={onBack}><ArrowLeft className="size-5 text-slate-700" /></button>
        <p className="text-base font-bold text-slate-900">Profile</p>
      </div>
      <div className="px-4 pt-4 pb-4 text-center">
        <div className="size-16 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center mx-auto mb-2">
          <span className="text-white font-bold text-2xl">A</span>
        </div>
        <p className="font-bold text-slate-900">Ahmed Al Mansoori</p>
        <p className="text-xs text-slate-500">ahmed@example.ae</p>
        <div className="flex items-center justify-center gap-1 mt-1">
          <Shield className="size-3 text-green-600" />
          <span className="text-xs text-green-600 font-semibold">Verified member</span>
        </div>
        <div className="flex gap-6 justify-center mt-3">
          {[["6", "Listings"], ["12", "Saved"], ["3", "Bids"]].map(([n, l]) => (
            <div key={l} className="text-center">
              <p className="text-base font-bold text-slate-900">{n}</p>
              <p className="text-[10px] text-slate-500">{l}</p>
            </div>
          ))}
        </div>
      </div>
      <div className="px-4 space-y-1">
        {items.map((item) => (
          <button key={item.label} onClick={() => toast(item.label)}
            className="w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-slate-50 transition text-start">
            <span className="size-9 rounded-xl bg-slate-100 flex items-center justify-center">
              <item.icon className="size-4 text-slate-600" />
            </span>
            <span className="flex-1 text-sm font-medium text-slate-800">{item.label}</span>
            {item.count && <span className="text-xs text-slate-500">{item.count}</span>}
            <ChevronRight className="size-4 text-slate-400" />
          </button>
        ))}
      </div>
    </div>
  );
}

function FileTextIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <polyline points="10 9 9 9 8 9" />
    </svg>
  );
}
