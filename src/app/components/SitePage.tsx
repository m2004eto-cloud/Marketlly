import { ArrowLeft } from "lucide-react";
import { HeaderControls } from "./HeaderControls";
import type { ReactNode } from "react";

type Props = {
  title: string;
  subtitle?: string;
  onBack: () => void;
  children: ReactNode;
};

/** Shared chrome for About / Contact / Help / Sitemap pages */
export function SitePage({ title, subtitle, onBack, children }: Props) {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <header className="sticky top-0 z-20 bg-white/90 dark:bg-slate-950/90 backdrop-blur border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="size-9 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center justify-center hover:bg-slate-50 dark:hover:bg-slate-800"
            aria-label="Back"
          >
            <ArrowLeft className="size-4" />
          </button>
          <div className="flex-1 min-w-0">
            <p className="font-semibold tracking-tight truncate">{title}</p>
            {subtitle && <p className="text-xs text-slate-500 truncate">{subtitle}</p>}
          </div>
          <HeaderControls />
        </div>
      </header>
      <main className="max-w-3xl mx-auto px-4 py-8">{children}</main>
    </div>
  );
}
