import { useEffect, useState } from "react";
import { Link } from "react-router";
import { listingsApi, cmsApi, type Listing } from "@marketly/core";
import { ArrowLeft, Smartphone } from "lucide-react";

type Platform = "ios" | "android";

/**
 * Thin web device preview that reads shared @marketly/core listings + CMS.
 * Real app UI lives in apps/mobile/src/platforms/{ios,android}.
 */
export function MobilePreviewPage({ platform }: { platform: Platform }) {
  const [listings, setListings] = useState<Listing[]>([]);
  const [hero, setHero] = useState("Find anything in the UAE");

  useEffect(() => {
    listingsApi.listListings({ status: "approved" }).then((res) => {
      if (res.ok) setListings(res.data.slice(0, 8));
    });
    setHero(cmsApi.getCmsValue("landing.heroTitle", "Find anything in the UAE"));
    return cmsApi.subscribeCms(() => {
      setHero(cmsApi.getCmsValue("landing.heroTitle", "Find anything in the UAE"));
    });
  }, []);

  const isIos = platform === "ios";
  const chrome = isIos
    ? "rounded-[40px] border-[10px] border-slate-900 bg-black"
    : "rounded-[28px] border-[8px] border-slate-800 bg-slate-950";

  return (
    <div className={`min-h-screen flex flex-col items-center py-8 px-4 ${isIos ? "bg-slate-100" : "bg-slate-900"}`}>
      <div className="w-full max-w-md flex items-center justify-between mb-4">
        <Link to="/" className={`inline-flex items-center gap-2 text-sm ${isIos ? "text-blue-600" : "text-emerald-400"}`}>
          <ArrowLeft className="size-4" /> Back to Marketly Web
        </Link>
        <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${isIos ? "bg-blue-100 text-blue-700" : "bg-emerald-500/20 text-emerald-400"}`}>
          <Smartphone className="size-3.5" />
          {isIos ? "iOS preview" : "Android preview"}
        </span>
      </div>
      <p className={`text-xs mb-3 ${isIos ? "text-slate-500" : "text-slate-400"}`}>
        Shared API data · Run <code className="px-1 rounded bg-black/10">npm run mobile</code> for native apps
      </p>
      <div className={`${chrome} w-[320px] overflow-hidden shadow-2xl`}>
        <div className={`${isIos ? "bg-[#F2F2F7]" : "bg-[#FAFAFA]"} h-[640px] flex flex-col`}>
          <div className={`px-4 pt-10 pb-3 ${isIos ? "bg-white/80 backdrop-blur" : "bg-[#6750A4] text-white"}`}>
            <p className={`text-xs ${isIos ? "text-slate-500" : "text-white/80"}`}>Marketly · {isIos ? "iOS" : "Android"}</p>
            <h1 className={`text-lg font-semibold line-clamp-2 mt-1 ${isIos ? "text-slate-900" : ""}`}>{hero}</h1>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            {listings.map((l) => (
              <Link
                key={l.id}
                to={`/listing/${l.id}`}
                className={`block overflow-hidden ${isIos ? "rounded-2xl bg-white shadow-sm" : "rounded-xl bg-white shadow border border-slate-100"}`}
              >
                <img src={l.img} alt="" className="w-full h-28 object-cover" />
                <div className="p-3">
                  <p className="text-sm font-semibold line-clamp-1">{l.title}</p>
                  <p className={`text-sm mt-0.5 ${isIos ? "text-blue-600" : "text-[#6750A4]"}`}>
                    AED {l.price.toLocaleString()}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">{l.location} · {l.category}</p>
                </div>
              </Link>
            ))}
          </div>
          <div className={`h-14 border-t flex items-center justify-around text-[10px] ${isIos ? "bg-white/90 border-slate-200 text-slate-600" : "bg-white border-slate-200 text-slate-600"}`}>
            <span className={isIos ? "text-blue-600 font-semibold" : "text-[#6750A4] font-semibold"}>Home</span>
            <span>Browse</span>
            <span>Post</span>
            <span>Profile</span>
          </div>
        </div>
      </div>
    </div>
  );
}
