import { ShieldCheck, HeartHandshake, Eye, Target } from "lucide-react";
import { SitePage } from "./SitePage";

type Props = { onBack: () => void };

export function AboutUs({ onBack }: Props) {
  return (
    <SitePage
      title="About Us"
      subtitle="Marketly — trusted marketplace for the UAE & beyond"
      onBack={onBack}
    >
      <div className="space-y-8 text-slate-700 dark:text-slate-300">
        <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-3">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            Who we are
          </h1>
          <p className="leading-relaxed">
            Marketly is a digital marketplace built for buying and selling motors and classifieds across
            the UAE and the wider region. We connect customers with verified dealers, support secure
            in-app chat, transparent listings, and tools that help people trade with confidence —
            whether they are posting a personal ad, running a dealership, or browsing for their next car.
          </p>
          <p className="leading-relaxed">
            From listing moderation and KYC-style dealer verification to subscription plans, auctions,
            and location-based discovery, every product decision is guided by one principle: make
            commerce safer, clearer, and fairer for everyone on the platform.
          </p>
        </section>

        <section className="grid sm:grid-cols-2 gap-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-3">
            <div className="size-10 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 flex items-center justify-center">
              <Target className="size-5" />
            </div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Our Mission</h2>
            <p className="text-sm leading-relaxed">
              To empower buyers and sellers with a marketplace where safety comes first — verified
              identities, honest listings, protected conversations, and clear rules that reduce fraud
              and build lasting trust in every transaction.
            </p>
          </div>
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-3">
            <div className="size-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center">
              <Eye className="size-5" />
            </div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Our Vision</h2>
            <p className="text-sm leading-relaxed">
              To be the most trusted regional marketplace — a place where ethical trade is the norm,
              communities feel protected, and technology serves people with transparency, respect, and
              accountability at every step.
            </p>
          </div>
        </section>

        <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <ShieldCheck className="size-5 text-blue-600" />
            Safety &amp; ethics at the core
          </h2>
          <ul className="space-y-3 text-sm">
            <li className="flex gap-3">
              <HeartHandshake className="size-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>
                <strong className="text-slate-900 dark:text-slate-100">Fair dealing:</strong> We
                expect accurate descriptions, lawful goods, and respectful communication between buyers
                and sellers.
              </span>
            </li>
            <li className="flex gap-3">
              <ShieldCheck className="size-4 text-blue-600 shrink-0 mt-0.5" />
              <span>
                <strong className="text-slate-900 dark:text-slate-100">Safer meetings:</strong> We
                encourage public meeting places, document checks, and never sharing OTPs or banking
                details in chat.
              </span>
            </li>
            <li className="flex gap-3">
              <ShieldCheck className="size-4 text-violet-600 shrink-0 mt-0.5" />
              <span>
                <strong className="text-slate-900 dark:text-slate-100">Accountable sellers:</strong>{" "}
                Dealer verification, listing review, and reporting tools help keep the community
                protected from scams and misuse.
              </span>
            </li>
            <li className="flex gap-3">
              <ShieldCheck className="size-4 text-amber-600 shrink-0 mt-0.5" />
              <span>
                <strong className="text-slate-900 dark:text-slate-100">Ethical platform rules:</strong>{" "}
                Discrimination, deceptive ads, and illegal items have no place on Marketly. We act on
                reports and reserve the right to suspend accounts that put others at risk.
              </span>
            </li>
          </ul>
        </section>
      </div>
    </SitePage>
  );
}
