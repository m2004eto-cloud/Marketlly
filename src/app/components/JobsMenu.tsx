import { useState } from "react";
import { ChevronRight } from "lucide-react";

const seekers = [
  { id: "seek-cat", label: "Jobs by Categories" },
  { id: "seek-type", label: "Jobs by Types" },
  { id: "seek-qual", label: "Jobs by Qualifications" },
];

const recruiters = [
  { id: "rec-cat", label: "Jobs Seeker by Categories" },
  { id: "rec-type", label: "Jobs Seeker by Types" },
  { id: "rec-qual", label: "Jobs Seeker by Qualifications" },
  { id: "hire", label: "Hire with Us" },
];

const categories = {
  col1: [
    "Accounting / Finance", "Administration", "Automobile", "Beauty / Salon",
    "Cleaner / Housekeeper", "Construction", "Cook / Chef",
    "Customer Service / Call Centre", "Data Management & Analysis",
    "Design", "Driver / Delivery",
  ],
  col2: [
    "Education", "Engineering", "Event Management & Operations", "HR / Admin",
    "Handyman / Technician", "Information Technology", "Legal Services",
    "Logistics & Distribution", "Maintenance / Warehouse", "Marine Captain / Crew",
  ],
};

type Props = {
  onPick: (params: Record<string, string>) => void;
  onClose: () => void;
};

export function JobsMenu({ onPick, onClose }: Props) {
  const [active, setActive] = useState("seek-cat");
  const choose = (q?: string) => { onPick({ category: "jobs", q: q || "" }); onClose(); };

  return (
    <div
      className="absolute top-full start-0 z-50 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-b-xl shadow-2xl flex"
      style={{ minWidth: 760 }}
      onMouseLeave={onClose}
    >
      <div className="w-64 p-3 border-e border-slate-200 dark:border-slate-800">
        <p className="px-3 mb-1 text-slate-900 dark:text-slate-100">Jobs Seekers</p>
        <ul className="space-y-1">
          {seekers.map((it) => (
            <li key={it.id}>
              <button
                onMouseEnter={() => setActive(it.id)}
                onClick={() => choose()}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-start transition ${active === it.id ? "bg-[#dbeafe] dark:bg-slate-800 text-[#2563eb]" : "hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200"}`}
              >
                {it.label}
                <ChevronRight className="size-4 text-slate-400" />
              </button>
            </li>
          ))}
        </ul>

        <p className="mt-4 px-3 mb-1 text-slate-900 dark:text-slate-100">Recruiters</p>
        <ul className="space-y-1">
          {recruiters.map((it) => (
            <li key={it.id}>
              <button
                onMouseEnter={() => setActive(it.id)}
                onClick={() => choose()}
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
          <p className="tracking-tight">Jobs by Categories</p>
          <button onClick={() => choose()} className="text-[#2563eb] hover:underline">View All →</button>
        </div>
        <div className="grid grid-cols-2 gap-x-6 gap-y-2">
          <ul className="space-y-2">
            {categories.col1.map((c) => (
              <li key={c}>
                <button onClick={() => choose(c)} className="text-slate-700 dark:text-slate-200 hover:text-[#2563eb] text-start">{c}</button>
              </li>
            ))}
          </ul>
          <ul className="space-y-2">
            {categories.col2.map((c) => (
              <li key={c}>
                <button onClick={() => choose(c)} className="text-slate-700 dark:text-slate-200 hover:text-[#2563eb] text-start">{c}</button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
