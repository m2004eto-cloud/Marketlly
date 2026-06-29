import { createContext, useCallback, useContext, useEffect, useMemo, useState, ReactNode } from "react";

export type ElementMeta = {
  id: string;
  page: string;
  label: string;
  defaultValue: string;
  multiline?: boolean;
};

export type Banner = {
  id: string;
  title: string;
  subtitle: string;
  cta: string;
  image: string;
  placement: "landing-top" | "landing-mid" | "landing-bottom" | "browse-top" | "detail-top";
  enabled: boolean;
  bgFrom: string;
  bgTo: string;
  textColor: string;
};

export type Design = {
  primary: string;
  accent: string;
  radius: number;
  heroOverlay: number;
  density: "compact" | "comfortable" | "spacious";
};

export type Typography = {
  family: string;
  scale: number; // base px (16 default)
  weight: number;
};

export type HistoryEntry = {
  ts: number;
  kind: "text" | "banner" | "design" | "typography" | "media" | "import" | "preset";
  summary: string;
  before: any;
  after: any;
};

export type ThemePreset = {
  name: string;
  design: Design;
  typography: Typography;
};

const DEFAULT_DESIGN: Design = {
  primary: "#2563eb",
  accent: "#7c3aed",
  radius: 12,
  heroOverlay: 50,
  density: "comfortable",
};

const DEFAULT_TYPOGRAPHY: Typography = {
  family: "Inter",
  scale: 16,
  weight: 400,
};

export const PRESETS: ThemePreset[] = [
  {
    name: "Marketly Classic",
    design: { primary: "#2563eb", accent: "#7c3aed", radius: 12, heroOverlay: 50, density: "comfortable" },
    typography: { family: "Inter", scale: 16, weight: 400 },
  },
  {
    name: "Sunset",
    design: { primary: "#ea580c", accent: "#dc2626", radius: 18, heroOverlay: 45, density: "comfortable" },
    typography: { family: "Plus Jakarta Sans", scale: 16, weight: 400 },
  },
  {
    name: "Forest",
    design: { primary: "#16a34a", accent: "#0d9488", radius: 10, heroOverlay: 55, density: "comfortable" },
    typography: { family: "Inter", scale: 15, weight: 400 },
  },
  {
    name: "Royal",
    design: { primary: "#7e22ce", accent: "#1e40af", radius: 16, heroOverlay: 60, density: "spacious" },
    typography: { family: "Manrope", scale: 16, weight: 500 },
  },
  {
    name: "Mono",
    design: { primary: "#0f172a", accent: "#475569", radius: 4, heroOverlay: 35, density: "compact" },
    typography: { family: "JetBrains Mono", scale: 15, weight: 400 },
  },
  {
    name: "Coral",
    design: { primary: "#e11d48", accent: "#f59e0b", radius: 20, heroOverlay: 50, density: "comfortable" },
    typography: { family: "Manrope", scale: 16, weight: 500 },
  },
];

const FONT_FAMILIES = ["Inter", "Manrope", "Plus Jakarta Sans", "Poppins", "Nunito", "JetBrains Mono", "system-ui"];

const DEFAULT_BANNERS: Banner[] = [
  {
    id: "b1",
    title: "Free car valuation in 30 seconds",
    subtitle: "Get an instant offer from Marketly — sell hassle-free.",
    cta: "Value my car",
    image: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=1200",
    placement: "landing-top",
    enabled: true,
    bgFrom: "#1d4ed8", bgTo: "#7c3aed", textColor: "#ffffff",
  },
  {
    id: "b2",
    title: "Verified Dealers Only",
    subtitle: "Shop with confidence — every dealer KYC-checked.",
    cta: "Browse verified",
    image: "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=1200",
    placement: "landing-mid",
    enabled: true,
    bgFrom: "#0f766e", bgTo: "#0891b2", textColor: "#ffffff",
  },
];

const DEFAULT_MEDIA: string[] = [
  "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=1200",
  "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=1200",
  "https://images.unsplash.com/photo-1518684079-3c830dcef090?w=1200",
  "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=1200",
];

type Ctx = {
  values: Record<string, string>;
  registry: Record<string, ElementMeta>;
  editMode: boolean;
  isAdmin: boolean;
  banners: Banner[];
  design: Design;
  typography: Typography;
  media: string[];
  history: HistoryEntry[];
  fontFamilies: string[];
  presets: ThemePreset[];
  setEditMode: (on: boolean) => void;
  setAdmin: (on: boolean) => void;
  register: (meta: ElementMeta) => void;
  get: (id: string, fallback: string) => string;
  set: (id: string, value: string) => void;
  reset: (id?: string) => void;
  findReplace: (find: string, replace: string, caseSensitive?: boolean) => number;
  addBanner: (b?: Partial<Banner>) => void;
  updateBanner: (id: string, patch: Partial<Banner>) => void;
  removeBanner: (id: string) => void;
  resetBanners: () => void;
  setDesign: (patch: Partial<Design>) => void;
  resetDesign: () => void;
  setTypography: (patch: Partial<Typography>) => void;
  resetTypography: () => void;
  applyPreset: (name: string) => void;
  addMedia: (url: string) => void;
  removeMedia: (url: string) => void;
  revertHistory: (index: number) => void;
  clearHistory: () => void;
  exportAll: () => string;
  importAll: (json: string) => boolean;
  resetEverything: () => void;
};

const ElementsCtx = createContext<Ctx | null>(null);
const STORAGE = {
  values: "marketly_elements_v1",
  banners: "marketly_banners_v1",
  design: "marketly_design_v1",
  typography: "marketly_typography_v1",
  media: "marketly_media_v1",
  history: "marketly_history_v1",
};

function loadJSON<T>(key: string, fallback: T): T {
  try { const raw = localStorage.getItem(key); return raw ? JSON.parse(raw) : fallback; }
  catch { return fallback; }
}

export function ElementsProvider({ children }: { children: ReactNode }) {
  const [values, setValues] = useState<Record<string, string>>(() => loadJSON(STORAGE.values, {}));
  const [registry, setRegistry] = useState<Record<string, ElementMeta>>({});
  const [editMode, setEditMode] = useState(false);
  const [isAdmin, setAdmin] = useState(false);
  const [banners, setBanners] = useState<Banner[]>(() => loadJSON(STORAGE.banners, DEFAULT_BANNERS));
  const [design, setDesignState] = useState<Design>(() => loadJSON(STORAGE.design, DEFAULT_DESIGN));
  const [typography, setTypographyState] = useState<Typography>(() => loadJSON(STORAGE.typography, DEFAULT_TYPOGRAPHY));
  const [media, setMedia] = useState<string[]>(() => loadJSON(STORAGE.media, DEFAULT_MEDIA));
  const [history, setHistory] = useState<HistoryEntry[]>(() => loadJSON(STORAGE.history, []));

  useEffect(() => { try { localStorage.setItem(STORAGE.values, JSON.stringify(values)); } catch { /* */ } }, [values]);
  useEffect(() => { try { localStorage.setItem(STORAGE.banners, JSON.stringify(banners)); } catch { /* */ } }, [banners]);
  useEffect(() => { try { localStorage.setItem(STORAGE.design, JSON.stringify(design)); } catch { /* */ } }, [design]);
  useEffect(() => { try { localStorage.setItem(STORAGE.typography, JSON.stringify(typography)); } catch { /* */ } }, [typography]);
  useEffect(() => { try { localStorage.setItem(STORAGE.media, JSON.stringify(media)); } catch { /* */ } }, [media]);
  useEffect(() => { try { localStorage.setItem(STORAGE.history, JSON.stringify(history.slice(0, 50))); } catch { /* */ } }, [history]);

  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty("--ml-primary", design.primary);
    root.style.setProperty("--ml-accent", design.accent);
    root.style.setProperty("--ml-radius", `${design.radius}px`);
    root.style.setProperty("--ml-hero-overlay", `${design.heroOverlay / 100}`);
    root.style.setProperty("--ml-density",
      design.density === "compact" ? "0.75" : design.density === "spacious" ? "1.15" : "1");
  }, [design]);

  useEffect(() => {
    const root = document.documentElement;
    root.style.fontSize = `${typography.scale}px`;
    root.style.fontFamily = `"${typography.family}", system-ui, sans-serif`;
    root.style.setProperty("--ml-font", `"${typography.family}", system-ui, sans-serif`);
    root.style.setProperty("--ml-weight", String(typography.weight));
  }, [typography]);

  const log = useCallback((kind: HistoryEntry["kind"], summary: string, before: any, after: any) => {
    setHistory((h) => [{ ts: Date.now(), kind, summary, before, after }, ...h].slice(0, 50));
  }, []);

  const api = useMemo<Ctx>(() => ({
    values, registry, editMode, isAdmin, banners, design, typography, media, history,
    fontFamilies: FONT_FAMILIES, presets: PRESETS,
    setEditMode, setAdmin,
    register: (meta) => setRegistry((r) => (r[meta.id] ? r : { ...r, [meta.id]: meta })),
    get: (id, fallback) => (values[id] !== undefined ? values[id] : fallback),
    set: (id, value) => {
      const before = values[id];
      setValues((v) => ({ ...v, [id]: value }));
      log("text", `Edited "${registry[id]?.label || id}"`, { id, value: before }, { id, value });
    },
    reset: (id) => {
      if (!id) {
        const before = { ...values };
        setValues({});
        log("text", "Reset all texts to default", before, {});
        return;
      }
      const before = values[id];
      setValues((v) => { const n = { ...v }; delete n[id]; return n; });
      log("text", `Reset "${registry[id]?.label || id}"`, { id, value: before }, { id, value: undefined });
    },
    findReplace: (find, replace, caseSensitive) => {
      if (!find) return 0;
      const before = { ...values };
      let count = 0;
      const next: Record<string, string> = { ...values };
      Object.values(registry).forEach((m) => {
        const current = next[m.id] ?? m.defaultValue;
        const flags = caseSensitive ? "g" : "gi";
        const re = new RegExp(find.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), flags);
        if (re.test(current)) {
          const updated = current.replace(re, replace);
          if (updated !== current) { next[m.id] = updated; count++; }
        }
      });
      if (count > 0) {
        setValues(next);
        log("text", `Find & replace "${find}" → "${replace}" (${count} matches)`, before, next);
      }
      return count;
    },
    addBanner: (b) => {
      const nb: Banner = {
        id: `b${Date.now()}`,
        title: "New banner", subtitle: "Subtitle here", cta: "Learn more",
        image: "https://images.unsplash.com/photo-1518684079-3c830dcef090?w=1200",
        placement: "landing-mid", enabled: true,
        bgFrom: "#2563eb", bgTo: "#7c3aed", textColor: "#ffffff",
        ...b,
      };
      setBanners((bs) => [...bs, nb]);
      log("banner", `Added banner "${nb.title}"`, null, nb);
    },
    updateBanner: (id, patch) => {
      const before = banners.find((b) => b.id === id);
      setBanners((bs) => bs.map((b) => (b.id === id ? { ...b, ...patch } : b)));
      log("banner", `Updated banner "${before?.title || id}"`, before, { ...before, ...patch });
    },
    removeBanner: (id) => {
      const before = banners.find((b) => b.id === id);
      setBanners((bs) => bs.filter((b) => b.id !== id));
      log("banner", `Removed banner "${before?.title || id}"`, before, null);
    },
    resetBanners: () => {
      const before = banners;
      setBanners(DEFAULT_BANNERS);
      log("banner", "Reset banners to default", before, DEFAULT_BANNERS);
    },
    setDesign: (patch) => {
      const before = design;
      setDesignState((d) => ({ ...d, ...patch }));
      log("design", `Updated design (${Object.keys(patch).join(", ")})`, before, { ...design, ...patch });
    },
    resetDesign: () => { const before = design; setDesignState(DEFAULT_DESIGN); log("design", "Reset design", before, DEFAULT_DESIGN); },
    setTypography: (patch) => {
      const before = typography;
      setTypographyState((t) => ({ ...t, ...patch }));
      log("typography", `Updated typography (${Object.keys(patch).join(", ")})`, before, { ...typography, ...patch });
    },
    resetTypography: () => { const before = typography; setTypographyState(DEFAULT_TYPOGRAPHY); log("typography", "Reset typography", before, DEFAULT_TYPOGRAPHY); },
    applyPreset: (name) => {
      const p = PRESETS.find((x) => x.name === name);
      if (!p) return;
      const before = { design, typography };
      setDesignState(p.design);
      setTypographyState(p.typography);
      log("preset", `Applied preset "${name}"`, before, { design: p.design, typography: p.typography });
    },
    addMedia: (url) => {
      if (!url || media.includes(url)) return;
      setMedia((m) => [url, ...m]);
      log("media", `Added media`, null, url);
    },
    removeMedia: (url) => {
      setMedia((m) => m.filter((u) => u !== url));
      log("media", `Removed media`, url, null);
    },
    revertHistory: (index) => {
      const entry = history[index];
      if (!entry) return;
      switch (entry.kind) {
        case "text":
          if (entry.before && typeof entry.before === "object" && "id" in entry.before) {
            const { id, value } = entry.before as { id: string; value: string | undefined };
            if (value === undefined) setValues((v) => { const n = { ...v }; delete n[id]; return n; });
            else setValues((v) => ({ ...v, [id]: value }));
          } else if (entry.before && typeof entry.before === "object") {
            setValues(entry.before as Record<string, string>);
          }
          break;
        case "banner":
          if (entry.before === null && entry.after) setBanners((bs) => bs.filter((b) => b.id !== (entry.after as Banner).id));
          else if (entry.after === null && entry.before) setBanners((bs) => [...bs, entry.before as Banner]);
          else if (entry.before && Array.isArray(entry.before)) setBanners(entry.before);
          else if (entry.before) setBanners((bs) => bs.map((b) => (b.id === (entry.before as Banner).id ? (entry.before as Banner) : b)));
          break;
        case "design": case "preset":
          if (entry.before?.design) setDesignState(entry.before.design);
          else if (entry.before) setDesignState(entry.before);
          if (entry.before?.typography) setTypographyState(entry.before.typography);
          break;
        case "typography":
          if (entry.before) setTypographyState(entry.before);
          break;
        case "media":
          if (entry.before === null && typeof entry.after === "string") setMedia((m) => m.filter((u) => u !== entry.after));
          else if (entry.after === null && typeof entry.before === "string") setMedia((m) => [entry.before, ...m]);
          break;
        case "import":
          if (entry.before) {
            const b = entry.before as any;
            if (b.values) setValues(b.values);
            if (b.banners) setBanners(b.banners);
            if (b.design) setDesignState(b.design);
            if (b.typography) setTypographyState(b.typography);
            if (b.media) setMedia(b.media);
          }
          break;
      }
      setHistory((h) => h.filter((_, i) => i !== index));
    },
    clearHistory: () => setHistory([]),
    exportAll: () => JSON.stringify({ values, banners, design, typography, media, version: 1 }, null, 2),
    importAll: (json) => {
      try {
        const data = JSON.parse(json);
        const before = { values, banners, design, typography, media };
        if (data.values) setValues(data.values);
        if (data.banners) setBanners(data.banners);
        if (data.design) setDesignState(data.design);
        if (data.typography) setTypographyState(data.typography);
        if (data.media) setMedia(data.media);
        log("import", "Imported configuration", before, data);
        return true;
      } catch { return false; }
    },
    resetEverything: () => {
      const before = { values, banners, design, typography, media };
      setValues({}); setBanners(DEFAULT_BANNERS); setDesignState(DEFAULT_DESIGN);
      setTypographyState(DEFAULT_TYPOGRAPHY); setMedia(DEFAULT_MEDIA);
      log("import", "Reset everything to defaults", before, null);
    },
  }), [values, registry, editMode, isAdmin, banners, design, typography, media, history, log]);

  return <ElementsCtx.Provider value={api}>{children}</ElementsCtx.Provider>;
}

export function useElements() {
  const ctx = useContext(ElementsCtx);
  if (!ctx) throw new Error("useElements outside provider");
  return ctx;
}
