import { useMemo, useRef, useState } from "react";
import {
  Sparkles, Eye, EyeOff, RotateCcw, Search, Save, Plus, Trash2, Image as ImageIcon,
  Palette, Type, LayoutGrid, History as HistoryIcon, Download, Upload, Replace,
  Wand2, Undo2, Copy, Check, AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";
import { useElements, Banner, HistoryEntry } from "../ElementsContext";

type Tab = "texts" | "banners" | "theme" | "media" | "history" | "io";

export function ElementsEditor() {
  const [tab, setTab] = useState<Tab>("texts");
  const { registry, values, banners, history, media } = useElements();

  const stats = [
    { label: "Texts", value: Object.keys(registry).length },
    { label: "Customised", value: Object.keys(values).length },
    { label: "Banners", value: banners.length },
    { label: "Media", value: media.length },
    { label: "History", value: history.length },
  ];

  return (
    <section className="space-y-5">
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5">
        <div className="flex items-center gap-3 flex-wrap">
          <span className="size-10 rounded-lg bg-gradient-to-br from-blue-600 to-violet-600 text-white flex items-center justify-center">
            <Sparkles className="size-5" />
          </span>
          <div className="flex-1 min-w-[220px]">
            <p className="tracking-tight">Elements</p>
            <p className="text-sm text-slate-500">A complete CMS for your live site — text, banners, theme, media, history and config.</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            {stats.map((s) => (
              <span key={s.label} className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-xs">
                <b className="tabular-nums">{s.value}</b> <span className="text-slate-500">{s.label}</span>
              </span>
            ))}
          </div>
        </div>
        <div className="flex gap-1 p-1 rounded-lg bg-slate-100 dark:bg-slate-800 mt-4 w-fit flex-wrap">
          {([
            { id: "texts", label: "Texts", icon: Type },
            { id: "banners", label: "Banners", icon: ImageIcon },
            { id: "theme", label: "Theme", icon: Palette },
            { id: "media", label: "Media", icon: LayoutGrid },
            { id: "history", label: "History", icon: HistoryIcon },
            { id: "io", label: "Import / Export", icon: Download },
          ] as const).map((t) => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`px-4 py-2 rounded-md inline-flex items-center gap-2 transition ${
                tab === t.id ? "bg-white dark:bg-slate-950 shadow-sm" : "text-slate-500"
              }`}>
              <t.icon className="size-4" /> {t.label}
            </button>
          ))}
        </div>
      </div>

      {tab === "texts" && <TextsTab />}
      {tab === "banners" && <BannersTab />}
      {tab === "theme" && <ThemeTab />}
      {tab === "media" && <MediaTab />}
      {tab === "history" && <HistoryTab />}
      {tab === "io" && <IOTab />}
    </section>
  );
}

function TextsTab() {
  const { registry, values, set, reset, editMode, setEditMode, findReplace } = useElements();
  const [q, setQ] = useState("");
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [findText, setFindText] = useState("");
  const [replaceText, setReplaceText] = useState("");
  const [caseSensitive, setCaseSensitive] = useState(false);

  const grouped = useMemo(() => {
    const items = Object.values(registry);
    const filtered = q
      ? items.filter((m) =>
          m.label.toLowerCase().includes(q.toLowerCase()) ||
          m.id.toLowerCase().includes(q.toLowerCase()) ||
          m.page.toLowerCase().includes(q.toLowerCase())
        )
      : items;
    const map: Record<string, typeof items> = {};
    filtered.forEach((m) => { (map[m.page] ||= []).push(m); });
    return map;
  }, [registry, q]);

  const totalRegistered = Object.keys(registry).length;
  const totalOverridden = Object.keys(values).length;
  const dirtyCount = Object.keys(drafts).length;

  const saveOne = (id: string, def: string) => {
    const v = drafts[id] ?? values[id] ?? def;
    set(id, v);
    setDrafts((d) => { const n = { ...d }; delete n[id]; return n; });
    toast.success("Saved");
  };
  const saveAll = () => {
    Object.entries(drafts).forEach(([id, v]) => set(id, v));
    setDrafts({});
    toast.success("All changes saved");
  };
  const runReplace = () => {
    if (!findText) return toast.error("Enter text to find");
    const n = findReplace(findText, replaceText, caseSensitive);
    if (n === 0) toast("No matches found");
    else toast.success(`Replaced ${n} match${n === 1 ? "" : "es"}`);
  };

  return (
    <div className="space-y-5">
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5">
        <div className="flex items-center gap-2 flex-wrap mb-3">
          <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 text-xs">
            {totalRegistered} registered
          </span>
          <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 text-xs">
            {totalOverridden} customised
          </span>
          <div className="ms-auto flex gap-2 flex-wrap">
            <button onClick={() => setEditMode(!editMode)}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg border ${editMode ? "border-blue-600 bg-blue-600 text-white" : "border-slate-200 dark:border-slate-700 hover:border-blue-600"}`}>
              {editMode ? <Eye className="size-4" /> : <EyeOff className="size-4" />}
              {editMode ? "Live Edit ON" : "Live Edit OFF"}
            </button>
            <button onClick={() => { reset(); toast("All texts reverted"); }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-rose-600 hover:text-rose-600">
              <RotateCcw className="size-4" /> Reset all
            </button>
            {dirtyCount > 0 && (
              <button onClick={saveAll}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700">
                <Save className="size-4" /> Save {dirtyCount}
              </button>
            )}
          </div>
        </div>

        <div className="grid md:grid-cols-[1fr_1fr_auto_auto] gap-2 mb-3">
          <div className="relative">
            <Replace className="absolute start-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
            <input value={findText} onChange={(e) => setFindText(e.target.value)} placeholder="Find…"
              className="w-full ps-10 pe-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 outline-none focus:border-blue-600" />
          </div>
          <input value={replaceText} onChange={(e) => setReplaceText(e.target.value)} placeholder="Replace with…"
            className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 outline-none focus:border-blue-600" />
          <label className="inline-flex items-center gap-2 px-3 text-sm text-slate-500">
            <input type="checkbox" checked={caseSensitive} onChange={(e) => setCaseSensitive(e.target.checked)} />
            Case
          </label>
          <button onClick={runReplace}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-violet-600 text-white hover:bg-violet-700">
            <Wand2 className="size-4" /> Replace all
          </button>
        </div>

        <div className="relative">
          <Search className="absolute start-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
          <input value={q} onChange={(e) => setQ(e.target.value)}
            placeholder="Search elements by label, page or id…"
            className="w-full ps-10 pe-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 outline-none focus:border-blue-600" />
        </div>
      </div>

      {totalRegistered === 0 && (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-8 text-center text-slate-500">
          No elements registered yet — visit the public pages to populate this list.
        </div>
      )}

      {Object.entries(grouped).map(([page, items]) => (
        <div key={page} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
          <div className="px-5 py-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <p className="tracking-tight">{page}</p>
            <span className="text-xs text-slate-500">{items.length} element{items.length === 1 ? "" : "s"}</span>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {items.map((m) => {
              const current = values[m.id] ?? m.defaultValue;
              const draft = drafts[m.id];
              const editing = draft !== undefined;
              const dirty = editing && draft !== current;
              const overridden = values[m.id] !== undefined;
              return (
                <div key={m.id} className="p-5 grid md:grid-cols-[200px_1fr_auto] gap-3 items-start">
                  <div>
                    <p className="text-sm">{m.label}</p>
                    <p className="text-xs text-slate-500 break-all">{m.id}</p>
                    {overridden && (
                      <span className="inline-block mt-1 text-[10px] px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400">
                        customised
                      </span>
                    )}
                  </div>
                  <div>
                    {m.multiline ? (
                      <textarea rows={3} value={editing ? draft : current}
                        onChange={(e) => setDrafts((d) => ({ ...d, [m.id]: e.target.value }))}
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 outline-none focus:border-blue-600" />
                    ) : (
                      <input value={editing ? draft : current}
                        onChange={(e) => setDrafts((d) => ({ ...d, [m.id]: e.target.value }))}
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 outline-none focus:border-blue-600" />
                    )}
                    <p className="text-xs text-slate-500 mt-1 truncate">Default: {m.defaultValue}</p>
                  </div>
                  <div className="flex gap-2">
                    <button disabled={!dirty} onClick={() => saveOne(m.id, m.defaultValue)}
                      className="px-3 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-500 disabled:cursor-not-allowed dark:disabled:bg-slate-800">
                      Save
                    </button>
                    {overridden && (
                      <button onClick={() => { reset(m.id); toast("Reverted"); }}
                        className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-rose-600 hover:text-rose-600">
                        <RotateCcw className="size-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

function BannersTab() {
  const { banners, addBanner, updateBanner, removeBanner, resetBanners, media } = useElements();

  return (
    <div className="space-y-5">
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 flex items-center gap-3 flex-wrap">
        <p className="tracking-tight flex items-center gap-2"><ImageIcon className="size-4 text-blue-600" /> Banners</p>
        <span className="text-xs text-slate-500">{banners.length} total · {banners.filter((b) => b.enabled).length} enabled</span>
        <div className="ms-auto flex gap-2">
          <button onClick={() => { resetBanners(); toast("Banners reset"); }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-rose-600 hover:text-rose-600">
            <RotateCcw className="size-4" /> Reset
          </button>
          <button onClick={() => { addBanner(); toast.success("Banner added"); }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700">
            <Plus className="size-4" /> New banner
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        {banners.map((b) => (
          <BannerCard key={b.id} banner={b} media={media} update={(p) => updateBanner(b.id, p)} remove={() => { removeBanner(b.id); toast("Removed"); }} />
        ))}
        {banners.length === 0 && (
          <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-8 text-center text-slate-500">
            No banners yet. Click "New banner" to create one.
          </div>
        )}
      </div>
    </div>
  );
}

function BannerCard({ banner, media, update, remove }: { banner: Banner; media: string[]; update: (p: Partial<Banner>) => void; remove: () => void }) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
      <div className="relative aspect-[16/7] overflow-hidden">
        <img src={banner.image} alt="" className="absolute inset-0 size-full object-cover" />
        <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${banner.bgFrom}cc, ${banner.bgTo}cc)` }} />
        <div className="absolute inset-0 p-5 flex flex-col justify-end" style={{ color: banner.textColor }}>
          <p className="tracking-tight" style={{ fontSize: "1.25rem" }}>{banner.title}</p>
          <p className="text-sm opacity-90 mt-0.5">{banner.subtitle}</p>
          <button className="mt-3 self-start px-3 py-1.5 rounded-lg bg-white/20 backdrop-blur border border-white/30">
            {banner.cta}
          </button>
        </div>
        <span className={`absolute top-3 end-3 text-xs px-2 py-0.5 rounded-full ${banner.enabled ? "bg-emerald-500 text-white" : "bg-slate-500 text-white"}`}>
          {banner.enabled ? "Enabled" : "Disabled"}
        </span>
      </div>
      <div className="p-4 space-y-3">
        <Field label="Title">
          <input value={banner.title} onChange={(e) => update({ title: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 outline-none focus:border-blue-600" />
        </Field>
        <Field label="Subtitle">
          <textarea rows={2} value={banner.subtitle} onChange={(e) => update({ subtitle: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 outline-none focus:border-blue-600" />
        </Field>
        <div className="grid grid-cols-2 gap-2">
          <Field label="CTA">
            <input value={banner.cta} onChange={(e) => update({ cta: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 outline-none focus:border-blue-600" />
          </Field>
          <Field label="Placement">
            <select value={banner.placement} onChange={(e) => update({ placement: e.target.value as Banner["placement"] })}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 outline-none focus:border-blue-600">
              <option value="landing-top">Landing — top</option>
              <option value="landing-mid">Landing — middle</option>
              <option value="landing-bottom">Landing — bottom</option>
              <option value="browse-top">Browse — top</option>
              <option value="detail-top">Detail — top</option>
            </select>
          </Field>
        </div>
        <Field label="Image URL">
          <input value={banner.image} onChange={(e) => update({ image: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 outline-none focus:border-blue-600" />
        </Field>
        {media.length > 0 && (
          <div>
            <p className="text-xs text-slate-500 mb-1">Pick from media library</p>
            <div className="flex gap-1.5 overflow-x-auto pb-1">
              {media.map((url) => (
                <button key={url} onClick={() => update({ image: url })}
                  className={`shrink-0 size-12 rounded-md border-2 overflow-hidden ${banner.image === url ? "border-blue-600" : "border-transparent"}`}>
                  <img src={url} alt="" className="size-full object-cover" />
                </button>
              ))}
            </div>
          </div>
        )}
        <div className="grid grid-cols-3 gap-2">
          <Field label="From">
            <input type="color" value={banner.bgFrom} onChange={(e) => update({ bgFrom: e.target.value })} className="w-full h-10 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950" />
          </Field>
          <Field label="To">
            <input type="color" value={banner.bgTo} onChange={(e) => update({ bgTo: e.target.value })} className="w-full h-10 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950" />
          </Field>
          <Field label="Text">
            <input type="color" value={banner.textColor} onChange={(e) => update({ textColor: e.target.value })} className="w-full h-10 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950" />
          </Field>
        </div>
        <div className="flex items-center justify-between pt-2">
          <label className="inline-flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={banner.enabled} onChange={(e) => update({ enabled: e.target.checked })} />
            <span className="text-sm">Enabled</span>
          </label>
          <button onClick={remove} className="inline-flex items-center gap-1 text-rose-600 hover:underline text-sm">
            <Trash2 className="size-4" /> Delete
          </button>
        </div>
      </div>
    </div>
  );
}

function ThemeTab() {
  const { design, setDesign, resetDesign, typography, setTypography, resetTypography, presets, applyPreset, fontFamilies } = useElements();

  return (
    <div className="space-y-5">
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5">
        <div className="flex items-center gap-3 flex-wrap mb-4">
          <p className="tracking-tight flex items-center gap-2"><Palette className="size-4 text-blue-600" /> Theme presets</p>
          <span className="text-xs text-slate-500">One-click apply colors + typography + density</span>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {presets.map((p) => {
            const active = design.primary === p.design.primary && design.accent === p.design.accent && typography.family === p.typography.family;
            return (
              <button key={p.name} onClick={() => { applyPreset(p.name); toast.success(`Applied "${p.name}"`); }}
                className={`text-start rounded-xl border-2 p-4 transition ${active ? "border-blue-600" : "border-slate-200 dark:border-slate-800 hover:border-blue-400"}`}>
                <div className="flex items-center justify-between mb-3">
                  <p className="tracking-tight" style={{ fontFamily: p.typography.family }}>{p.name}</p>
                  {active && <Check className="size-4 text-blue-600" />}
                </div>
                <div className="flex gap-1.5 mb-2">
                  <span className="size-6 rounded-md" style={{ background: p.design.primary }} />
                  <span className="size-6 rounded-md" style={{ background: p.design.accent }} />
                  <span className="size-6 rounded-md border border-slate-200 dark:border-slate-700" style={{ borderRadius: p.design.radius }} />
                </div>
                <p className="text-xs text-slate-500">{p.typography.family} · {p.design.density} · r{p.design.radius}</p>
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <p className="tracking-tight">Colors & layout</p>
            <button onClick={() => { resetDesign(); toast("Design reset"); }}
              className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-rose-600">
              <RotateCcw className="size-3.5" /> Reset
            </button>
          </div>
          <Field label="Primary">
            <div className="flex items-center gap-2">
              <input type="color" value={design.primary} onChange={(e) => setDesign({ primary: e.target.value })} className="size-10 rounded-lg border border-slate-200 dark:border-slate-700" />
              <input value={design.primary} onChange={(e) => setDesign({ primary: e.target.value })} className="flex-1 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 outline-none focus:border-blue-600" />
            </div>
          </Field>
          <Field label="Accent">
            <div className="flex items-center gap-2">
              <input type="color" value={design.accent} onChange={(e) => setDesign({ accent: e.target.value })} className="size-10 rounded-lg border border-slate-200 dark:border-slate-700" />
              <input value={design.accent} onChange={(e) => setDesign({ accent: e.target.value })} className="flex-1 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 outline-none focus:border-blue-600" />
            </div>
          </Field>
          <Field label={`Hero overlay — ${design.heroOverlay}%`}>
            <input type="range" min={0} max={100} value={design.heroOverlay} onChange={(e) => setDesign({ heroOverlay: Number(e.target.value) })} className="w-full" />
          </Field>
          <Field label={`Corner radius — ${design.radius}px`}>
            <input type="range" min={0} max={28} value={design.radius} onChange={(e) => setDesign({ radius: Number(e.target.value) })} className="w-full" />
          </Field>
          <Field label="Density">
            <div className="flex gap-1 p-1 rounded-lg bg-slate-100 dark:bg-slate-800 w-fit">
              {(["compact", "comfortable", "spacious"] as const).map((d) => (
                <button key={d} onClick={() => setDesign({ density: d })}
                  className={`px-3 py-1.5 rounded-md capitalize ${design.density === d ? "bg-white dark:bg-slate-950 shadow-sm" : "text-slate-500"}`}>
                  {d}
                </button>
              ))}
            </div>
          </Field>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <p className="tracking-tight">Typography</p>
            <button onClick={() => { resetTypography(); toast("Typography reset"); }}
              className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-rose-600">
              <RotateCcw className="size-3.5" /> Reset
            </button>
          </div>
          <Field label="Font family">
            <select value={typography.family} onChange={(e) => setTypography({ family: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 outline-none focus:border-blue-600">
              {fontFamilies.map((f) => <option key={f} value={f}>{f}</option>)}
            </select>
          </Field>
          <Field label={`Base size — ${typography.scale}px`}>
            <input type="range" min={12} max={20} value={typography.scale} onChange={(e) => setTypography({ scale: Number(e.target.value) })} className="w-full" />
          </Field>
          <Field label={`Weight — ${typography.weight}`}>
            <input type="range" min={300} max={700} step={100} value={typography.weight} onChange={(e) => setTypography({ weight: Number(e.target.value) })} className="w-full" />
          </Field>
          <div className="pt-2">
            <p className="text-xs text-slate-500 mb-2">Live preview</p>
            <div className="rounded-lg border border-slate-200 dark:border-slate-700 p-4" style={{ fontFamily: typography.family, fontWeight: typography.weight }}>
              <p style={{ fontSize: typography.scale * 1.5 }} className="tracking-tight">The quick brown fox</p>
              <p style={{ fontSize: typography.scale }} className="text-slate-500 mt-1">Jumps over the lazy dog · 0123456789</p>
              <div className="grid grid-cols-3 gap-2 mt-3">
                <button style={{ background: design.primary, borderRadius: design.radius }} className="px-3 py-2 text-white text-sm">Primary</button>
                <button style={{ background: design.accent, borderRadius: design.radius }} className="px-3 py-2 text-white text-sm">Accent</button>
                <button style={{ borderRadius: design.radius }} className="px-3 py-2 border border-slate-200 dark:border-slate-700 text-sm">Default</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MediaTab() {
  const { media, addMedia, removeMedia } = useElements();
  const [url, setUrl] = useState("");
  const [copied, setCopied] = useState<string | null>(null);

  const add = () => {
    if (!url.trim()) return toast.error("Enter a URL");
    addMedia(url.trim());
    setUrl("");
    toast.success("Added to media library");
  };
  const copy = async (u: string) => {
    try { await navigator.clipboard.writeText(u); setCopied(u); setTimeout(() => setCopied(null), 1200); }
    catch { toast.error("Copy failed"); }
  };

  return (
    <div className="space-y-5">
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5">
        <div className="flex items-center gap-2 flex-wrap mb-3">
          <p className="tracking-tight flex items-center gap-2"><LayoutGrid className="size-4 text-blue-600" /> Media library</p>
          <span className="text-xs text-slate-500">{media.length} item{media.length === 1 ? "" : "s"}</span>
        </div>
        <div className="flex gap-2">
          <input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://images.example.com/photo.jpg"
            onKeyDown={(e) => e.key === "Enter" && add()}
            className="flex-1 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 outline-none focus:border-blue-600" />
          <button onClick={add}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700">
            <Plus className="size-4" /> Add
          </button>
        </div>
      </div>

      {media.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-8 text-center text-slate-500">
          No media yet. Add an image URL above.
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {media.map((u) => (
            <div key={u} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden group">
              <div className="relative aspect-square">
                <img src={u} alt="" className="absolute inset-0 size-full object-cover" />
              </div>
              <div className="p-2 flex gap-1.5">
                <button onClick={() => copy(u)} className="flex-1 inline-flex items-center justify-center gap-1 px-2 py-1.5 rounded-md border border-slate-200 dark:border-slate-700 text-xs hover:border-blue-600">
                  {copied === u ? <Check className="size-3.5 text-emerald-600" /> : <Copy className="size-3.5" />} {copied === u ? "Copied" : "Copy URL"}
                </button>
                <button onClick={() => { removeMedia(u); toast("Removed"); }}
                  className="px-2 py-1.5 rounded-md border border-slate-200 dark:border-slate-700 text-rose-600 hover:border-rose-600">
                  <Trash2 className="size-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function HistoryTab() {
  const { history, revertHistory, clearHistory } = useElements();

  const kindColor: Record<HistoryEntry["kind"], string> = {
    text: "bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300",
    banner: "bg-violet-100 text-violet-700 dark:bg-violet-950/40 dark:text-violet-300",
    design: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300",
    typography: "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300",
    media: "bg-pink-100 text-pink-700 dark:bg-pink-950/40 dark:text-pink-300",
    import: "bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
    preset: "bg-sky-100 text-sky-700 dark:bg-sky-950/40 dark:text-sky-300",
  };

  return (
    <div className="space-y-5">
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 flex items-center gap-3 flex-wrap">
        <p className="tracking-tight flex items-center gap-2"><HistoryIcon className="size-4 text-blue-600" /> Audit log</p>
        <span className="text-xs text-slate-500">Last {history.length} change{history.length === 1 ? "" : "s"} · capped at 50</span>
        <button onClick={() => { clearHistory(); toast("History cleared"); }}
          disabled={history.length === 0}
          className="ms-auto inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-rose-600 hover:text-rose-600 disabled:opacity-50">
          <Trash2 className="size-4" /> Clear
        </button>
      </div>

      {history.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-8 text-center text-slate-500">
          No changes yet. Edits across the app will appear here with a one-click revert.
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800">
          {history.map((h, i) => (
            <div key={`${h.ts}-${i}`} className="p-4 flex items-center gap-3 flex-wrap">
              <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${kindColor[h.kind]}`}>{h.kind}</span>
              <p className="text-sm flex-1 min-w-[200px]">{h.summary}</p>
              <span className="text-xs text-slate-500 tabular-nums">{new Date(h.ts).toLocaleString()}</span>
              <button onClick={() => { revertHistory(i); toast.success("Reverted"); }}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md border border-slate-200 dark:border-slate-700 hover:border-blue-600 text-sm">
                <Undo2 className="size-3.5" /> Revert
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function IOTab() {
  const { exportAll, importAll, resetEverything } = useElements();
  const [text, setText] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const doExport = () => {
    const json = exportAll();
    setText(json);
    toast.success("Exported to textarea");
  };
  const download = () => {
    const json = exportAll();
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `marketly-elements-${Date.now()}.json`; a.click();
    URL.revokeObjectURL(url);
    toast.success("Downloaded JSON");
  };
  const doImport = () => {
    if (!text.trim()) return toast.error("Paste JSON first");
    if (importAll(text)) toast.success("Configuration imported");
    else toast.error("Invalid JSON");
  };
  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; if (!f) return;
    const r = new FileReader();
    r.onload = () => {
      const json = String(r.result || "");
      setText(json);
      if (importAll(json)) toast.success("Imported from file");
      else toast.error("Invalid JSON file");
    };
    r.readAsText(f);
  };
  const nuke = () => {
    if (!confirm("Reset EVERYTHING to defaults? This clears all texts, banners, theme, typography and media.")) return;
    resetEverything();
    toast.success("All settings reset to defaults");
  };

  return (
    <div className="space-y-5">
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5">
        <p className="tracking-tight flex items-center gap-2 mb-4"><Download className="size-4 text-blue-600" /> Import / Export</p>
        <div className="flex gap-2 flex-wrap mb-4">
          <button onClick={doExport}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-blue-600">
            <Download className="size-4" /> Export to text
          </button>
          <button onClick={download}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700">
            <Download className="size-4" /> Download .json
          </button>
          <button onClick={() => fileRef.current?.click()}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-blue-600">
            <Upload className="size-4" /> Upload .json
          </button>
          <input ref={fileRef} type="file" accept="application/json" className="hidden" onChange={onFile} />
          <button onClick={doImport}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-violet-600 text-white hover:bg-violet-700">
            <Upload className="size-4" /> Import from text
          </button>
        </div>
        <textarea value={text} onChange={(e) => setText(e.target.value)} rows={14}
          placeholder='Paste exported JSON here, or click "Export to text" to fill it.'
          className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 outline-none focus:border-blue-600 font-mono text-xs" />
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl border border-rose-200 dark:border-rose-900/40 p-5">
        <div className="flex items-center gap-2 mb-2">
          <AlertTriangle className="size-4 text-rose-600" />
          <p className="tracking-tight">Danger zone</p>
        </div>
        <p className="text-sm text-slate-500 mb-3">Resets every element back to its built-in default. This cannot be undone (but is logged in history).</p>
        <button onClick={nuke}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-rose-600 text-white hover:bg-rose-700">
          <Trash2 className="size-4" /> Reset everything
        </button>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-xs text-slate-500">{label}</span>
      <div className="mt-1">{children}</div>
    </label>
  );
}
