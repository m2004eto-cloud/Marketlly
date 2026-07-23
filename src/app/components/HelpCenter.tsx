import { MessageCircle, ShieldAlert, BadgeCheck, Gavel, CreditCard } from "lucide-react";
import { SitePage } from "./SitePage";

type Props = { onBack: () => void; onContact: () => void };

const FAQS = [
  {
    icon: BadgeCheck,
    q: "How do I buy safely on Marketly?",
    a: "Use in-app chat, meet in public places, inspect the item and documents, and never send money or OTPs to strangers. Prefer verified dealers when possible.",
  },
  {
    icon: MessageCircle,
    q: "How does Chat with seller work?",
    a: "Sign in, open a listing, and tap Chat with seller. Conversations appear under Chats in the header. Keep payments and sensitive details off the chat.",
  },
  {
    icon: CreditCard,
    q: "How do subscription plans work?",
    a: "Customers and dealers start on Free. Upgrade from your profile to get more ads per period, featured placement, and other plan benefits. Free plans cannot be renewed — upgrade instead.",
  },
  {
    icon: Gavel,
    q: "How do auctions work?",
    a: "Browse live auctions, place bids if your account has bidding enabled, and message the seller for questions. Always review the auction terms and vehicle condition before bidding.",
  },
  {
    icon: ShieldAlert,
    q: "How do I report a suspicious ad or user?",
    a: "Open the listing and use Report, or contact us with the ad link and details. Our team reviews safety reports as a priority.",
  },
];

export function HelpCenter({ onBack, onContact }: Props) {
  return (
    <SitePage title="Help" subtitle="Answers and safety guidance" onBack={onBack}>
      <div className="space-y-4">
        {FAQS.map((f) => (
          <div
            key={f.q}
            className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5"
          >
            <p className="font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <f.icon className="size-4 text-blue-600 shrink-0" />
              {f.q}
            </p>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{f.a}</p>
          </div>
        ))}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 p-5 flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
          <p className="text-sm text-slate-600 dark:text-slate-300">Still need help?</p>
          <button
            type="button"
            onClick={onContact}
            className="px-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700"
          >
            Contact Us
          </button>
        </div>
      </div>
    </SitePage>
  );
}
