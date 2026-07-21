import { Sun, Moon } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useApp } from "../AppContext";

export function HeaderControls() {
  const { theme, toggleTheme, lang, setLang } = useApp();
  const { i18n } = useTranslation();

  const switchLang = (next: "en" | "ar") => {
    setLang(next);
    void i18n.changeLanguage(next);
    document.documentElement.lang = next;
    document.documentElement.dir = next === "ar" ? "rtl" : "ltr";
  };

  return (
    <div className="flex items-center gap-1">
      <div className="flex items-center rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
        <button
          type="button"
          onClick={() => switchLang("en")}
          aria-label="English"
          title="English"
          className={`flex items-center gap-1 px-2 py-1.5 ${lang === "en" ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900" : "text-slate-600 dark:text-slate-300"}`}
        >
          <span className="text-xs">EN</span>
        </button>
        <button
          type="button"
          onClick={() => switchLang("ar")}
          aria-label="العربية"
          title="العربية"
          className={`flex items-center gap-1 px-2 py-1.5 ${lang === "ar" ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900" : "text-slate-600 dark:text-slate-300"}`}
        >
          <span className="text-xs">AR</span>
        </button>
      </div>
      <button
        onClick={toggleTheme}
        aria-label="Toggle theme"
        className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
      >
        {theme === "light" ? <Moon className="size-4" /> : <Sun className="size-4" />}
      </button>
    </div>
  );
}
