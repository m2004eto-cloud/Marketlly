type Props = {
  onPick: (params: Record<string, string>) => void;
  onClose: () => void;
};

const sections: { title?: string; items: { label: string; badge?: string; key: string }[] }[] = [
  {
    title: "For Rent",
    items: [
      { label: "Residential", key: "rent-res" },
      { label: "Commercial", key: "rent-com" },
      { label: "Rooms For Rent", key: "rent-room" },
      { label: "Monthly Short Term", key: "rent-month" },
      { label: "Daily Short Term", key: "rent-day" },
    ],
  },
  {
    title: "For Sale",
    items: [
      { label: "New Properties", key: "sale-new" },
      { label: "Residential", key: "sale-res" },
      { label: "Commercial", key: "sale-com" },
      { label: "Off-Plan", key: "sale-off" },
      { label: "Land", key: "sale-land" },
      { label: "Multiple Units", key: "sale-multi" },
    ],
  },
  {
    items: [
      { label: "Agent & Agency Search", key: "agent" },
      { label: "TruEstimate", badge: "NEW", key: "truest" },
      { label: "Property Blog", key: "blog" },
    ],
  },
];

export function PropertyMenu({ onPick, onClose }: Props) {
  const choose = (q: string) => { onPick({ category: "property", q }); onClose(); };

  return (
    <div
      className="absolute top-full start-0 z-50 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-b-xl shadow-2xl p-3"
      style={{ minWidth: 240 }}
      onMouseLeave={onClose}
    >
      {sections.map((sec, idx) => (
        <div key={idx} className={idx > 0 ? "mt-3 pt-3 border-t border-slate-100 dark:border-slate-800" : ""}>
          {sec.title && <p className="px-3 mb-1 text-slate-900 dark:text-slate-100">{sec.title}</p>}
          <ul className="space-y-1">
            {sec.items.map((it) => (
              <li key={it.key}>
                <button
                  onClick={() => choose(it.label)}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-md text-start hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200"
                >
                  <span>{it.label}</span>
                  {it.badge && <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#2563eb] text-white">{it.badge}</span>}
                </button>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
