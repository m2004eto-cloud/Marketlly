import { useState } from "react";
import { ChevronRight } from "lucide-react";

const cats: { id: string; label: string; sub: { col1: string[]; col2: string[] } }[] = [
  {
    id: "furniture", label: "Furniture", sub: {
      col1: ["Armoires & Wardrobes", "Bar Tables", "Beds & Bed Sets", "Bookcases", "Cabinets & Cupboards", "Chairs, Benches & Stools", "Children's Furniture", "Dining Sets", "Dressers & Vanities", "Entertainment Centers", "Kitchen Islands & Carts", "Nightstands"],
      col2: ["Office Furniture", "Sofas, Futons & Lounges", "Study Tables & Computer Tables", "Tables", "Other"],
    },
  },
  { id: "home", label: "Home Accessories", sub: { col1: ["Mirrors", "Vases", "Clocks", "Picture Frames"], col2: ["Decorative Pillows", "Other"] } },
  { id: "garden", label: "Garden & Outdoor", sub: { col1: ["Garden Furniture", "BBQ & Grills", "Plants"], col2: ["Pools", "Other"] } },
  { id: "lighting", label: "Lighting & Fans", sub: { col1: ["Ceiling Lights", "Lamps", "Ceiling Fans"], col2: ["Outdoor Lighting", "Other"] } },
  { id: "rugs", label: "Rugs & Carpets", sub: { col1: ["Area Rugs", "Runners", "Carpets"], col2: ["Mats", "Other"] } },
  { id: "curtains", label: "Curtains & Blinds", sub: { col1: ["Curtains", "Blinds", "Drapes"], col2: ["Shades", "Other"] } },
  { id: "tools", label: "Tools & Home Improvement", sub: { col1: ["Power Tools", "Hand Tools", "Hardware"], col2: ["Paint", "Other"] } },
];

type Props = {
  onPick: (params: Record<string, string>) => void;
  onClose: () => void;
};

export function FurnitureMenu({ onPick, onClose }: Props) {
  const [active, setActive] = useState("furniture");
  const current = cats.find((c) => c.id === active) || cats[0];
  const choose = (q?: string) => { onPick({ category: "furniture", q: q || "" }); onClose(); };

  return (
    <div
      className="absolute top-full start-0 z-50 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-b-xl shadow-2xl flex"
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
                {it.label}
                <ChevronRight className="size-4 text-slate-400" />
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
