import { useState } from "react";
import { ChevronRight } from "lucide-react";

const cats: { id: string; label: string; sub: { col1: string[]; col2: string[] } }[] = [
  { id: "electronics", label: "Electronics", sub: { col1: ["Home Audio & Turntables", "Televisions", "DVD & Home Theater", "Electronic Accessories", "Gadgets", "Car Electronics", "Projectors", "Mp3 Players and Portable Audio", "Satellite & Cable TV", "Health Electronics", "Smart Home"], col2: ["Wearable Technology", "Other"] } },
  { id: "computers", label: "Computers & Networking", sub: { col1: ["Laptops", "Desktops", "Networking", "Components", "Software"], col2: ["Printers", "Storage", "Other"] } },
  { id: "business", label: "Business & Industrial", sub: { col1: ["Office Supplies", "Restaurant Equipment", "Construction"], col2: ["Medical", "Other"] } },
  { id: "home", label: "Home Appliances", sub: { col1: ["Refrigerators", "Washing Machines", "Air Conditioners"], col2: ["Microwaves", "Other"] } },
  { id: "sports", label: "Sports Equipment", sub: { col1: ["Fitness", "Cycling", "Football"], col2: ["Tennis", "Other"] } },
  { id: "clothing", label: "Clothing & Accessories", sub: { col1: ["Men", "Women", "Kids"], col2: ["Bags", "Shoes"] } },
  { id: "cameras", label: "Cameras & Imaging", sub: { col1: ["DSLR", "Mirrorless", "Lenses"], col2: ["Drones", "Accessories"] } },
  { id: "jewelry", label: "Jewelry & Watches", sub: { col1: ["Watches", "Rings", "Necklaces"], col2: ["Bracelets", "Other"] } },
  { id: "pets", label: "Pets", sub: { col1: ["Dogs", "Cats", "Birds"], col2: ["Fish", "Accessories"] } },
  { id: "music", label: "Musical Instruments", sub: { col1: ["Guitars", "Pianos", "Drums"], col2: ["DJ Equipment", "Other"] } },
  { id: "gaming", label: "Gaming", sub: { col1: ["Consoles", "Games", "Accessories"], col2: ["VR", "PC Gaming"] } },
  { id: "baby", label: "Baby Items", sub: { col1: ["Strollers", "Car Seats", "Toys"], col2: ["Clothing", "Other"] } },
  { id: "toys", label: "Toys", sub: { col1: ["Action Figures", "Dolls", "Educational"], col2: ["Outdoor", "Other"] } },
  { id: "tickets", label: "Tickets & Vouchers", sub: { col1: ["Concerts", "Sporting Events", "Travel", "Events", "Movies", "Theater", "Activities & Attractions", "Vouchers & Gift Cards", "Other"], col2: [] } },
  { id: "collect", label: "Collectibles", sub: { col1: ["Coins", "Stamps", "Antiques"], col2: ["Art", "Other"] } },
  { id: "books", label: "Books", sub: { col1: ["Fiction", "Non-Fiction", "Textbooks"], col2: ["Comics", "Other"] } },
  { id: "musicg", label: "Music", sub: { col1: ["Vinyl", "CDs", "Cassettes"], col2: ["Other"] } },
  { id: "free", label: "Free Stuff", sub: { col1: ["All Items"], col2: [] } },
  { id: "lost", label: "Lost/Found", sub: { col1: ["Lost", "Found"], col2: [] } },
  { id: "dvd", label: "DVDs & Movies", sub: { col1: ["DVDs", "Blu-Ray"], col2: ["Other"] } },
  { id: "furniture", label: "Furniture, Home & Garden", sub: { col1: ["Sofas", "Beds", "Tables"], col2: ["Garden", "Other"] } },
  { id: "mobiles", label: "Mobile Phones & Tablets", sub: { col1: ["Phones", "Tablets", "Accessories"], col2: ["Smartwatches", "Other"] } },
];

type Props = {
  onPick: (params: Record<string, string>) => void;
  onClose: () => void;
};

export function ClassifiedsMenu({ onPick, onClose }: Props) {
  const [active, setActive] = useState("electronics");
  const current = cats.find((c) => c.id === active) || cats[0];
  const choose = (q?: string) => { onPick({ category: "classifieds", q: q || "" }); onClose(); };

  return (
    <div
      className="absolute top-full start-0 z-50 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-b-xl shadow-2xl flex"
      style={{ minWidth: 760 }}
      onMouseLeave={onClose}
    >
      <div className="w-72 p-3 border-e border-slate-200 dark:border-slate-800 max-h-[480px] overflow-y-auto">
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

      <div className="flex-1 p-5 max-h-[480px] overflow-y-auto">
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
