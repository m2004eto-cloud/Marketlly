import { useState } from "react";
import { ChevronRight } from "lucide-react";

const leftItems = [
  { id: "used", label: "Used Cars" },
  { id: "new", label: "New Cars" },
  { id: "export", label: "Export Cars" },
  { id: "rental", label: "Rental Cars", badge: "NEW" },
  { id: "moto", label: "Motorcycles" },
  { id: "parts", label: "Auto Accessories & Parts" },
  { id: "heavy", label: "Heavy Vehicles" },
  { id: "boats", label: "Boats" },
  { id: "plates", label: "Number Plates" },
];

const brandsByCat: Record<string, { col1: string[]; col2: string[] }> = {
  used: {
    col1: ["Toyota", "Mercedes-Benz", "BMW", "Nissan", "Hyundai", "Porsche", "Ford", "Audi", "Kia", "Land Rover", "Jeep", "Chevrolet", "Mitsubishi", "Honda", "Volkswagen"],
    col2: ["Jetour", "Dodge", "Rolls-Royce", "Bentley"],
  },
  new: { col1: ["Toyota", "BMW", "Mercedes-Benz", "Audi", "Lexus"], col2: ["Tesla", "Genesis", "Porsche"] },
  export: { col1: ["Toyota", "Nissan", "Lexus"], col2: ["Hyundai"] },
  rental: { col1: ["Daily", "Weekly", "Monthly"], col2: ["Long Term"] },
  moto: { col1: ["Harley-Davidson", "Ducati", "Yamaha"], col2: ["Honda", "BMW"] },
  parts: { col1: ["Tires", "Rims", "Audio"], col2: ["Lights", "Filters"] },
  heavy: { col1: ["Trucks", "Buses"], col2: ["Trailers", "Equipment"] },
  boats: { col1: ["Yachts", "Jet Skis"], col2: ["Speedboats"] },
  plates: { col1: ["Dubai", "Abu Dhabi"], col2: ["Sharjah"] },
};

const services = [
  { id: "inspect", label: "Car Inspection" },
  { id: "finance", label: "Car Finance" },
  { id: "eval", label: "Car Evaluation" },
];

type Props = {
  onPick: (params: Record<string, string>) => void;
  onClose: () => void;
};

export function MotorsMenu({ onPick, onClose }: Props) {
  const [active, setActive] = useState("used");
  const data = brandsByCat[active];
  const activeLabel = leftItems.find((i) => i.id === active)?.label || "";

  const choose = (brand?: string) => {
    onPick({ category: "motors", q: brand || "" });
    onClose();
  };

  return (
    <div
      className="absolute top-full start-0 mt-0 z-50 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-b-xl shadow-2xl flex"
      style={{ minWidth: 720 }}
      onMouseLeave={onClose}
    >
      <div className="w-64 p-3 border-e border-slate-200 dark:border-slate-800">
        <ul className="space-y-1">
          {leftItems.map((it) => (
            <li key={it.id}>
              <button
                onMouseEnter={() => setActive(it.id)}
                onClick={() => choose()}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-start transition ${active === it.id ? "bg-[#dbeafe] dark:bg-slate-800 text-[#2563eb]" : "hover:bg-slate-50 dark:hover:bg-slate-800"}`}
              >
                <span className="flex items-center gap-2">
                  {it.label}
                  {it.badge && <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#2563eb] text-white">{it.badge}</span>}
                </span>
                <ChevronRight className="size-4 text-slate-400" />
              </button>
            </li>
          ))}
        </ul>

        <button
          onClick={() => choose()}
          className="mt-3 w-full px-3 py-2 rounded-md bg-[#dbeafe] dark:bg-slate-800 text-[#2563eb] hover:bg-[#bfdbfe]"
        >
          Sell My Car
        </button>

        <p className="mt-4 px-3 text-slate-500">Services</p>
        <ul className="mt-2 space-y-1">
          {services.map((s) => (
            <li key={s.id}>
              <button
                onClick={() => { onPick({ service: s.id }); onClose(); }}
                className="w-full text-start px-3 py-2 rounded-md hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200"
              >
                {s.label}
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className="flex-1 p-5">
        <div className="flex items-center justify-between mb-3">
          <p className="tracking-tight">{activeLabel}</p>
          <button onClick={() => choose()} className="text-[#2563eb] hover:underline">View All →</button>
        </div>
        <div className="grid grid-cols-2 gap-x-6 gap-y-2">
          <ul className="space-y-2">
            {data.col1.map((b) => (
              <li key={b}>
                <button onClick={() => choose(b)} className="text-slate-700 dark:text-slate-200 hover:text-[#2563eb]">{b}</button>
              </li>
            ))}
          </ul>
          <ul className="space-y-2">
            {data.col2.map((b) => (
              <li key={b}>
                <button onClick={() => choose(b)} className="text-slate-700 dark:text-slate-200 hover:text-[#2563eb]">{b}</button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
