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

const AppCtx = createContext<Ctx | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const { i18n } = useTranslation();
  const [theme, setTheme] = useState<Theme>("light");
  const [lang, setLangState] = useState<Lang>((i18n.language?.startsWith("ar") ? "ar" : "en"));
  const [favorites, setFavorites] = useState<number[]>([]);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") root.classList.add("dark");
    else root.classList.remove("dark");
  }, [theme]);

  useEffect(() => {
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = lang;
    i18n.changeLanguage(lang);
  }, [lang, i18n]);

  const setLang = (l: Lang) => setLangState(l);
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
