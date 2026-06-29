import { useState } from "react";
import { ChevronRight } from "lucide-react";

const cats: { id: string; label: string; sub: { col1: string[]; col2: string[] } }[] = [
  {
    id: "phones", label: "Mobile Phones", sub: {
      col1: ["Apple", "Samsung", "Google", "Huawei", "Xiaomi", "Oppo", "OnePlus", "Honor", "Nokia", "Vivo", "Motorola", "Realme"],
      col2: ["Sony Ericsson", "ZTE Phones", "Vertu", "Asus", "Infinix", "Blackberry", "Nothing Phone", "Aquos"],
    },
  },
  { id: "accessories", label: "Mobile Phone & Tablet Accessories", sub: { col1: ["Cases", "Chargers", "Screen Protectors", "Headphones"], col2: ["Power Banks", "Cables", "Holders", "Other"] } },
  { id: "tablets", label: "Tablets", sub: { col1: ["Apple", "Samsung", "Huawei", "Lenovo"], col2: ["Microsoft", "Amazon", "Other"] } },
  { id: "other", label: "Other Mobile Phones & Tablets", sub: { col1: ["Pre-owned", "Refurbished"], col2: ["Other"] } },
];

type Props = {
  onPick: (params: Record<string, string>) => void;
  onClose: () => void;
};

export function MobilesMenu({ onPick, onClose }: Props) {
  const [active, setActive] = useState("phones");
  const current = cats.find((c) => c.id === active) || cats[0];
  const choose = (q?: string) => { onPick({ category: "classifieds", q: q || "" }); onClose(); };

  return (
    <div
      className="absolute top-full start-auto end-0 z-50 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-b-xl shadow-2xl flex max-w-[calc(100vw-2rem)]"
      style={{ minWidth: 760 }}
      onMouseLeave={onClose}
    >
      <div className="w-72 p-3 border-e border-slate-200 dark:border-slate-800">
        <ul className="space-y-1">
          {cats.map((it) => (
            <li key={it.id}>
              <button
                onMouseEnter={() => setActive(it.id)}
                onClick={() => choose(it.label)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-start transition ${active === it.id ? "bg-[#dbeafe] dark:bg-slate-800 text-[#2563eb]" : "hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200"}`}
              >
                <span className="text-start">{it.label}</span>
                <ChevronRight className="size-4 text-slate-400 shrink-0" />
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className="flex-1 p-5">
        <div className="flex items-center justify-between mb-3">
          <p className="tracking-tight">{current.label}</p>
          <button onClick={() => choose(current.label)} className="text-[#2563eb] hover:underline">View All →</button>
        </div>
        <div className="grid grid-cols-2 gap-x-6 gap-y-2">
          <ul className="space-y-2">
            {current.sub.col1.map((s) => (
              <li key={s}>
                <button onClick={() => choose(s)} className="text-slate-700 dark:text-slate-200 hover:text-[#2563eb] text-start">{s}</button>
              </li>
            ))}
          </ul>
          <ul className="space-y-2">
            {current.sub.col2.map((s) => (
              <li key={s}>
                <button onClick={() => choose(s)} className="text-slate-700 dark:text-slate-200 hover:text-[#2563eb] text-start">{s}</button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
