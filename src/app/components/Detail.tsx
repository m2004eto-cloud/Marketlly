import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft, MapPin, Heart, Shield, Phone, MessageCircle, Share2, Mail, Flag,
  ChevronLeft, ChevronRight, Check, Award, BadgeCheck, Clock, Eye, Calendar,
  Gauge, Settings as SettingsIcon, Fuel, Palette, Info, AlertTriangle,
  Calculator, ChevronRight as ChevronRightIcon, Building2,
} from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { listingsApi, messagesApi, type Listing } from "@marketly/core";
import { useApp } from "../AppContext";
import { useAuth } from "../AuthContext";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { HeaderControls } from "./HeaderControls";
import { Editable } from "./Editable";
import { Banners } from "./Banners";
import { formatCurrency } from "../utils";
import { useRecentlyViewed } from "../hooks";
import { useNavigate } from "react-router";
import { startListingChat } from "../chat";

type Props = { id: number; onBack: () => void; onOpen?: (id: number) => void };

const carImages = [
  "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=1200",
  "https://images.unsplash.com/photo-1555215695-3004980ad54e?w=1200",
  "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=1200",
  "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=1200",
  "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=1200",
];

const safetyTips = [
  "Meet the seller in a public, well-lit area",
  "Inspect the item carefully and verify documents",
  "Never pay in advance or transfer money to strangers",
  "Use Marketly Chat — never share OTPs or bank details",
];

export function Detail({ id, onBack, onOpen }: Props) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { favorites, toggleFavorite } = useApp();
  const { user, can } = useAuth();
  const [listing, setListing] = useState<Listing | null>(() => listingsApi.getAllListingsSync().find((l) => l.id === id) || null);
  const [similar, setSimilar] = useState<Listing[]>([]);
  const fav = listing ? favorites.includes(listing.id) : false;
  const [active, setActive] = useState(0);
  const [showPhone, setShowPhone] = useState(false);
  const [tab, setTab] = useState<"overview" | "features" | "location">("overview");
  const { push: pushRecent } = useRecentlyViewed();
  const seller = listing
    ? messagesApi.resolveSellerAccount(listing.ownerId, listing.ownerName)
    : null;
  const sellerInitials = (seller?.name || "SE")
    .split(/\s+/)
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  useEffect(() => {
    let alive = true;
    listingsApi.getListing(id).then((res) => {
      if (!alive) return;
      if (res.ok) setListing(res.data);
      else setListing(null);
    });
    listingsApi.listListings({ status: "approved" }).then((res) => {
      if (!alive || !res.ok) return;
      setSimilar(res.data.filter((l) => l.id !== id).slice(0, 6));
    });
    return () => { alive = false; };
  }, [id]);

  useEffect(() => {
    if (listing) pushRecent(listing.id);
  }, [listing?.id, pushRecent]);

  const gallery = useMemo(
    () => (listing ? [listing.img, ...carImages.filter((u) => u !== listing.img)].slice(0, 6) : []),
    [listing?.img],
  );

  if (!listing) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-8">
        <p className="text-slate-600">Listing not found.</p>
        <button type="button" onClick={onBack} className="px-4 py-2 rounded-lg bg-blue-600 text-white">Back</button>
      </div>
    );
  }

  const specs = [
    { icon: Calendar, label: "Year", value: "2024" },
    { icon: Gauge, label: "Kilometers", value: "15,200 km" },
    { icon: SettingsIcon, label: "Transmission", value: "Automatic" },
    { icon: Fuel, label: "Fuel Type", value: "Petrol" },
    { icon: Palette, label: "Exterior Color", value: "Pearl White" },
    { icon: Award, label: "Regional Specs", value: "GCC" },
    { icon: BadgeCheck, label: "Warranty", value: "Until 2027" },
    { icon: Building2, label: "Body Type", value: "SUV" },
  ];

  const features = [
    "Panoramic Sunroof", "360° Camera", "Adaptive Cruise Control", "Heated & Cooled Seats",
    "Premium Sound System", "Wireless Charging", "Apple CarPlay", "Android Auto",
    "Lane Keep Assist", "Blind Spot Monitor", "Auto Park", "Head-up Display",
    "Heated Steering", "Memory Seats", "Ambient Lighting", "Power Tailgate",
  ];

  const monthly = Math.round((listing.price * 0.018));

  const share = async () => {
    try {
      if (navigator.share) await navigator.share({ title: listing.title, text: listing.title });
      else { await navigator.clipboard.writeText(listing.title); toast.success("Link copied"); }
    } catch { /* cancelled */ }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-30">
        <div className="w-full px-6 h-16 flex items-center gap-3">
          <button onClick={onBack} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"><ArrowLeft className="size-5" /></button>
          <span className="tracking-tight bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">{t("brand")}</span>
          <nav className="hidden md:flex items-center gap-1 text-sm text-slate-500 ms-4">
            <button onClick={onBack} className="hover:text-blue-600">UAE</button>
            <ChevronRightIcon className="size-3" />
            <button onClick={onBack} className="hover:text-blue-600 capitalize">{listing.category}</button>
            <ChevronRightIcon className="size-3" />
            <button onClick={onBack} className="hover:text-blue-600">{listing.location}</button>
            <ChevronRightIcon className="size-3" />
            <span className="text-slate-700 dark:text-slate-300 truncate max-w-[260px]">{listing.title}</span>
          </nav>
          <div className="ms-auto flex items-center gap-2">
            <button onClick={() => toast("Reported")} className="hidden sm:inline-flex items-center gap-1 text-sm text-slate-500 hover:text-rose-600">
              <Flag className="size-4" /> Report
            </button>
            <HeaderControls />
          </div>
        </div>
      </header>

      <Banners placement="detail-top" className="max-w-7xl mx-auto px-4 pt-4" />

      <div className="w-full max-w-7xl mx-auto px-4 py-6 grid lg:grid-cols-[1fr_360px] gap-6">
        <div className="space-y-5">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="relative aspect-[16/10] bg-slate-100 dark:bg-slate-800">
              <ImageWithFallback src={gallery[active]} alt={listing.title} className="size-full object-cover" />
              <button
                onClick={() => setActive((a) => (a - 1 + gallery.length) % gallery.length)}
                className="absolute start-3 top-1/2 -translate-y-1/2 size-10 rounded-full bg-white/90 hover:bg-white text-slate-900 flex items-center justify-center shadow"
              ><ChevronLeft className="size-5" /></button>
              <button
                onClick={() => setActive((a) => (a + 1) % gallery.length)}
                className="absolute end-3 top-1/2 -translate-y-1/2 size-10 rounded-full bg-white/90 hover:bg-white text-slate-900 flex items-center justify-center shadow"
              ><ChevronRight className="size-5" /></button>
              <span className="absolute end-3 top-3 px-2 py-1 rounded-md bg-black/60 text-white text-xs">{active + 1} / {gallery.length}</span>
              {listing.verified && (
                <span className="absolute start-3 top-3 inline-flex items-center gap-1 px-2 py-1 rounded-md bg-gradient-to-r from-blue-600 to-blue-700 text-white text-xs">
                  <BadgeCheck className="size-3" /> Marketly Inspected
                </span>
              )}
            </div>
            <div className="p-3 flex gap-2 overflow-x-auto">
              {gallery.map((g, i) => (
                <button key={g} onClick={() => setActive(i)}
                  className={`relative size-20 flex-shrink-0 rounded-lg overflow-hidden border-2 transition ${active === i ? "border-blue-600" : "border-transparent opacity-70 hover:opacity-100"}`}>
                  <ImageWithFallback src={g} alt="" className="size-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <p className="text-blue-600" style={{ fontSize: "1.75rem" }}>{formatCurrency(listing.price)}</p>
                <p className="text-slate-500 text-sm mt-1">or {formatCurrency(monthly)}/month with finance</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => { toggleFavorite(listing.id); toast(fav ? "Removed" : "Saved"); }}
                  className={`size-10 rounded-full border border-slate-200 dark:border-slate-700 flex items-center justify-center ${fav ? "text-rose-600 border-rose-200" : ""}`}>
                  <Heart className={`size-4 ${fav ? "fill-current" : ""}`} />
                </button>
                <button onClick={share} className="size-10 rounded-full border border-slate-200 dark:border-slate-700 flex items-center justify-center">
                  <Share2 className="size-4" />
                </button>
              </div>
            </div>
            <h1 className="tracking-tight mt-3" style={{ fontSize: "1.5rem" }}>{listing.title}</h1>
            <div className="flex items-center gap-3 mt-2 text-slate-500 flex-wrap">
              <span className="inline-flex items-center gap-1"><MapPin className="size-4" /> {listing.location}</span>
              <span className="inline-flex items-center gap-1"><Clock className="size-4" /> Posted {listing.date}d ago</span>
              <span className="inline-flex items-center gap-1"><Eye className="size-4" /> 1,284 views</span>
              {listing.verified && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500 text-white text-xs">
                  <Shield className="size-3" /> {t("featured.verified")}
                </span>
              )}
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
            <div className="flex border-b border-slate-100 dark:border-slate-800 overflow-x-auto">
              {(["overview", "features", "location"] as const).map((k) => (
                <button key={k} onClick={() => setTab(k)}
                  className={`px-5 py-3 capitalize whitespace-nowrap border-b-2 transition ${
                    tab === k ? "border-blue-600 text-blue-600" : "border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-200"
                  }`}>
                  {k}
                </button>
              ))}
            </div>

            {tab === "overview" && (
              <div className="p-6 space-y-6">
                <div>
                  <p className="tracking-tight mb-3">
                    <Editable id="detail.specsHeading" page="Detail" label="Specifications Heading" defaultValue="Specifications" />
                  </p>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {specs.map((s) => (
                      <div key={s.label} className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                        <span className="size-9 rounded-lg bg-white dark:bg-slate-900 flex items-center justify-center text-blue-600 border border-slate-200 dark:border-slate-700">
                          <s.icon className="size-4" />
                        </span>
                        <div>
                          <p className="text-xs text-slate-500">{s.label}</p>
                          <p className="text-sm">{s.value}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="tracking-tight mb-2">
                    <Editable id="detail.descriptionHeading" page="Detail" label="Description Heading" defaultValue="Description" />
                  </p>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                    {listing.description}{"\n\n"}
                    Single owner, agency maintained with full service history. Non-smoker, garage parked, and meticulously cared for. All offers welcome — trade-ins considered. Bank financing available with attractive rates and flexible terms.
                  </p>
                </div>
              </div>
            )}

            {tab === "features" && (
              <div className="p-6">
                <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-2">
                  {features.map((f) => (
                    <div key={f} className="flex items-center gap-2 text-sm">
                      <span className="size-5 rounded-full bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center">
                        <Check className="size-3" />
                      </span>
                      {f}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {tab === "location" && (
              <div className="p-6 space-y-3">
                <div className="aspect-[16/9] rounded-xl bg-gradient-to-br from-blue-50 via-emerald-50 to-blue-100 dark:from-slate-800 dark:via-slate-800 dark:to-slate-900 border border-slate-200 dark:border-slate-700 relative overflow-hidden">
                  <svg viewBox="0 0 800 400" className="absolute inset-0 size-full opacity-60">
                    <path d="M0,200 Q200,150 400,220 T800,180" fill="none" stroke="#3b82f6" strokeWidth="3" strokeOpacity=".4" />
                    <path d="M0,250 Q300,300 500,240 T800,260" fill="none" stroke="#10b981" strokeWidth="3" strokeOpacity=".3" />
                    <path d="M100,0 Q200,200 350,400" fill="none" stroke="#94a3b8" strokeWidth="2" strokeOpacity=".3" />
                    <path d="M600,0 Q500,200 700,400" fill="none" stroke="#94a3b8" strokeWidth="2" strokeOpacity=".3" />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="bg-white dark:bg-slate-900 rounded-full p-3 shadow-lg">
                      <MapPin className="size-6 text-rose-600 fill-rose-600/20" />
                    </div>
                  </div>
                  <div className="absolute bottom-3 start-3 bg-white/95 dark:bg-slate-900/95 px-3 py-2 rounded-lg shadow text-sm">
                    {listing.location}, UAE
                  </div>
                </div>
                <p className="text-sm text-slate-500">Exact location shared after contacting the seller.</p>
              </div>
            )}
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
            <p className="tracking-tight flex items-center gap-2 mb-3"><Calculator className="size-4 text-blue-600" /> Finance calculator</p>
            <div className="grid sm:grid-cols-3 gap-3 text-sm">
              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                <p className="text-slate-500 text-xs">Down payment</p>
                <p>{formatCurrency(Math.round(listing.price * 0.2))}</p>
              </div>
              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                <p className="text-slate-500 text-xs">Monthly (60 mo)</p>
                <p className="text-blue-600">{formatCurrency(monthly)}</p>
              </div>
              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                <p className="text-slate-500 text-xs">Interest rate</p>
                <p>3.49%</p>
              </div>
            </div>
            <button onClick={() => toast.success("Finance request sent")}
              className="mt-4 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700">Get pre-approved</button>
          </div>

          <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 rounded-2xl p-5">
            <p className="tracking-tight flex items-center gap-2 mb-3 text-amber-800 dark:text-amber-300">
              <AlertTriangle className="size-4" />
              <Editable id="detail.safetyTitle" page="Detail" label="Safety Tips Title" defaultValue="Safety tips" />
            </p>
            <ul className="space-y-1.5 text-sm text-amber-900/80 dark:text-amber-200/80">
              {safetyTips.map((s) => (
                <li key={s} className="flex items-start gap-2"><Check className="size-3.5 mt-1 flex-shrink-0" /> {s}</li>
              ))}
            </ul>
          </div>
        </div>

        <aside className="space-y-3 lg:sticky lg:top-20 lg:self-start">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 space-y-3">
            <div className="flex items-center gap-3">
              <span className="size-12 rounded-full bg-gradient-to-br from-blue-600 to-violet-600 text-white flex items-center justify-center font-semibold">
                {sellerInitials}
              </span>
              <div className="flex-1 min-w-0">
                <p className="flex items-center gap-1 truncate">
                  {seller?.name || listing?.ownerName || "Seller"}
                  {seller?.verified && <BadgeCheck className="size-4 text-blue-600" />}
                </p>
                <p className="text-xs text-slate-500">
                  {seller?.verified ? "Verified seller" : "Seller"} · Marketly chat enabled
                </p>
              </div>
            </div>
            <div className="grid grid-cols-3 text-center text-xs border-y border-slate-100 dark:border-slate-800 py-3">
              <div><p className="text-slate-900 dark:text-slate-100">—</p><p className="text-slate-500">Listings</p></div>
              <div><p className="text-slate-900 dark:text-slate-100">4.8★</p><p className="text-slate-500">Rating</p></div>
              <div><p className="text-slate-900 dark:text-slate-100">~10m</p><p className="text-slate-500">Response</p></div>
            </div>
            <button
              onClick={() => navigate(`/browse?q=${encodeURIComponent(seller?.name || "")}`)}
              className="w-full text-sm text-blue-600 hover:underline"
            >
              View more from this seller →
            </button>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 space-y-2">
            <button
              onClick={() => {
                if (!can("canContactSellers") && user) {
                  toast.error("Contacting sellers is disabled for your account");
                  return;
                }
                setShowPhone(true);
              }}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700"
            >
              <Phone className="size-4" />{" "}
              {showPhone ? (seller?.phone || "+971 50 123 4567") : "Show phone number"}
            </button>
            <button
              onClick={() => {
                const phone = (seller?.phone || "+971501234567").replace(/\D/g, "");
                window.open(`https://wa.me/${phone}`, "_blank", "noopener,noreferrer");
              }}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[#25D366] text-white hover:opacity-95"
            >
              <MessageCircle className="size-4" /> WhatsApp
            </button>
            <button
              onClick={() =>
                void startListingChat(id, {
                  isSignedIn: !!user,
                  canMessage: can("canMessage"),
                  navigate,
                })
              }
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-slate-900 dark:bg-white dark:text-slate-900 text-white hover:opacity-90"
            >
              <Mail className="size-4" /> {t("browse.chat")}
            </button>
            <button onClick={() => toast.success("Offer sent")} className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-blue-600 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/20">
              Make an offer
            </button>
          </div>

          <div className="bg-gradient-to-br from-blue-600 to-violet-600 text-white rounded-2xl p-5">
            <p className="tracking-tight mb-1">
              <Editable id="detail.valuationTitle" page="Detail" label="Valuation CTA Title"
                defaultValue="Free car valuation" />
            </p>
            <p className="text-white/80 text-sm mb-3">
              <Editable id="detail.valuationSub" page="Detail" label="Valuation CTA Subtitle" multiline
                defaultValue="Get an instant offer from Marketly — sell in 30 minutes." />
            </p>
            <button onClick={() => toast("Opening valuation…")} className="w-full px-4 py-2 rounded-lg bg-white text-blue-700">
              Value my car
            </button>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 text-sm">
            <p className="tracking-tight mb-2 flex items-center gap-2"><Info className="size-4 text-blue-600" /> Listing details</p>
            <dl className="space-y-1.5 text-slate-600 dark:text-slate-300">
              <div className="flex justify-between"><dt className="text-slate-500">Reference</dt><dd>ML-{listing.id.toString().padStart(7, "0")}</dd></div>
              <div className="flex justify-between"><dt className="text-slate-500">Posted</dt><dd>{listing.date} days ago</dd></div>
              <div className="flex justify-between"><dt className="text-slate-500">Category</dt><dd className="capitalize">{listing.category}</dd></div>
              <div className="flex justify-between"><dt className="text-slate-500">Location</dt><dd>{listing.location}</dd></div>
            </dl>
          </div>
        </aside>
      </div>

      <section className="w-full max-w-7xl mx-auto px-4 pb-10">
        <div className="flex items-end justify-between mb-4">
          <div>
            <h2 className="tracking-tight">
              <Editable id="detail.similarTitle" page="Detail" label="Similar Listings Title"
                defaultValue="Similar listings" />
            </h2>
            <p className="text-slate-500 text-sm">
              <Editable id="detail.similarSub" page="Detail" label="Similar Listings Subtitle"
                defaultValue="More like this from verified sellers" />
            </p>
          </div>
          <button onClick={onBack} className="text-blue-600 hover:underline text-sm">View all →</button>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {similar.slice(0, 6).map((l) => (
            <button key={l.id} onClick={() => onOpen?.(l.id)}
              className="text-start bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden hover:shadow-lg transition">
              <div className="aspect-[16/10] bg-slate-100 dark:bg-slate-800 relative">
                <ImageWithFallback src={l.img} alt={l.title} className="size-full object-cover" />
                {l.verified && (
                  <span className="absolute top-2 start-2 inline-flex items-center gap-1 px-2 py-0.5 rounded bg-blue-600 text-white text-xs">
                    <BadgeCheck className="size-3" /> Verified
                  </span>
                )}
              </div>
              <div className="p-4">
                <p className="text-blue-600 mb-1">{formatCurrency(l.price)}</p>
                <p className="truncate">{l.title}</p>
                <p className="text-slate-500 text-sm flex items-center gap-1 mt-1">
                  <MapPin className="size-3" /> {l.location}
                </p>
              </div>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
