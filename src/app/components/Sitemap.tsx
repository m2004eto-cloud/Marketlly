import { SitePage } from "./SitePage";

type Props = {
  onBack: () => void;
  onNavigate: (path: string) => void;
};

const LINKS: { group: string; items: { label: string; path: string }[] }[] = [
  {
    group: "Marketplace",
    items: [
      { label: "Home", path: "/" },
      { label: "Browse all ads", path: "/browse" },
      { label: "Motors", path: "/browse?category=motors" },
      { label: "Classifieds", path: "/browse?category=classifieds" },
      { label: "Auctions", path: "/auctions" },
      { label: "Place an ad", path: "/post" },
    ],
  },
  {
    group: "UAE locations",
    items: [
      "Dubai",
      "Abu Dhabi",
      "Sharjah",
      "Ajman",
      "Ras Al Khaimah",
      "Fujairah",
      "Umm Al Quwain",
      "Al Ain",
    ].map((loc) => ({ label: loc, path: `/browse?location=${encodeURIComponent(loc)}` })),
  },
  {
    group: "Account & support",
    items: [
      { label: "Sign in", path: "/auth" },
      { label: "Chats", path: "/chats" },
      { label: "About Us", path: "/about" },
      { label: "Contact Us", path: "/contact" },
      { label: "Help", path: "/help" },
      { label: "Terms & Conditions", path: "/legal/terms" },
      { label: "Privacy Policy", path: "/legal/privacy" },
      { label: "Seller Policies & KYC", path: "/legal/seller-policies" },
    ],
  },
];

export function Sitemap({ onBack, onNavigate }: Props) {
  return (
    <SitePage title="Sitemap" subtitle="Find your way around Marketly" onBack={onBack}>
      <div className="grid sm:grid-cols-2 gap-4">
        {LINKS.map((g) => (
          <div
            key={g.group}
            className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5"
          >
            <p className="font-semibold text-slate-900 dark:text-slate-100 mb-3">{g.group}</p>
            <ul className="space-y-2">
              {g.items.map((it) => (
                <li key={it.path}>
                  <button
                    type="button"
                    onClick={() => onNavigate(it.path)}
                    className="text-sm text-blue-600 hover:underline"
                  >
                    {it.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </SitePage>
  );
}
