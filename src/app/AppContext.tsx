import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useTranslation } from "react-i18next";

type Theme = "light" | "dark";
type Lang = "en" | "ar";
type Ctx = {
  theme: Theme;
  toggleTheme: () => void;
  lang: Lang;
  setLang: (l: Lang) => void;
  favorites: number[];
  toggleFavorite: (id: number) => void;
};

const LANG_KEY = "marketly_lang";

function readStoredLang(): Lang {
  try {
    const saved = localStorage.getItem(LANG_KEY) || localStorage.getItem("i18nextLng");
    return saved?.toLowerCase().startsWith("ar") ? "ar" : "en";
  } catch {
    return "en";
  }
}

const AppCtx = createContext<Ctx | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const { i18n } = useTranslation();
  const [theme, setTheme] = useState<Theme>("light");
  const [lang, setLangState] = useState<Lang>(() => readStoredLang());
  const [favorites, setFavorites] = useState<number[]>([]);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") root.classList.add("dark");
    else root.classList.remove("dark");
  }, [theme]);

  useEffect(() => {
    const root = document.documentElement;
    root.dir = lang === "ar" ? "rtl" : "ltr";
    root.lang = lang;
    try {
      localStorage.setItem(LANG_KEY, lang);
      localStorage.setItem("i18nextLng", lang);
    } catch { /* ignore */ }
    void i18n.changeLanguage(lang);
    // Prefer Cairo for Arabic even if CMS typography set a Latin family on :root
    if (lang === "ar") {
      root.style.fontFamily = '"Cairo", "Segoe UI", system-ui, sans-serif';
    } else {
      root.style.removeProperty("font-family");
    }
  }, [lang, i18n]);

  const setLang = (l: Lang) => {
    setLangState(l);
    void i18n.changeLanguage(l);
  };
  const toggleTheme = () => setTheme((t) => (t === "light" ? "dark" : "light"));
  const toggleFavorite = (id: number) =>
    setFavorites((f) => (f.includes(id) ? f.filter((x) => x !== id) : [...f, id]));

  return (
    <AppCtx.Provider value={{ theme, toggleTheme, lang, setLang, favorites, toggleFavorite }}>
      {children}
    </AppCtx.Provider>
  );
}

const fallback: Ctx = {
  theme: "light",
  toggleTheme: () => {},
  lang: "en",
  setLang: () => {},
  favorites: [],
  toggleFavorite: () => {},
};

export const useApp = () => useContext(AppCtx) ?? fallback;
