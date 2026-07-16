import React, { useState } from "react";
import {
  Car, Tag, Plus, Trash2, Search, ChevronRight, ChevronDown, Edit3,
  Package, Palette, MapPin, Check, X, Settings, Sliders, AlertTriangle,
  Shield, RefreshCw, Download, Upload, Copy, Info,
} from "lucide-react";
import { toast } from "sonner";
import { useCatalog, MotorFieldCatalog, ColorOpt } from "../PostAdCatalogContext";

// ─── Types ─────────────────────────────────────────────────────────────────────

type Section =
  | "motors-makes"
  | "motors-fields"
  | "colors"
  | "classifieds-cats"
  | "classifieds-brands"
  | "locations";

// ─── Main ────────────────────────────────────────────────────────────────────

export function CatalogEditor() {
  const [section, setSection] = useState<Section>("motors-makes");

  const navItems: { id: Section; label: string; icon: typeof Car; desc: string }[] = [
    { id: "motors-makes", label: "Car Makes & Models", icon: Car, desc: "Manage vehicle brands and their model lists" },
    { id: "motors-fields", label: "Motor Spec Fields", icon: Sliders, desc: "Body type, fuel type, features, specs options" },
    { id: "colors", label: "Color Palette", icon: Palette, desc: "Exterior & interior color swatches" },
    { id: "classifieds-cats", label: "Classifieds Categories", icon: Tag, desc: "Top-level & sub-category tree" },
    { id: "classifieds-brands", label: "Electronics Brands", icon: Package, desc: "Brands & models for classifieds sub-categories" },
    { id: "locations", label: "Locations / Cities", icon: MapPin, desc: "Emirates and city options in dropdowns" },
  ];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className="size-10 rounded-xl bg-gradient-to-br from-blue-600 to-violet-700 flex items-center justify-center shrink-0">
          <Settings className="size-5 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-bold">Post-Ad Catalog Editor</h2>
          <p className="text-sm text-slate-500">Manage all dropdown menus and option lists across the Post Your Ad form. Changes apply instantly site-wide.</p>
        </div>
        <div className="ms-auto">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 text-xs font-semibold">
            <span className="size-2 rounded-full bg-emerald-500" />
            Live — changes apply immediately
          </div>
        </div>
      </div>

      <div className="flex gap-5">
        {/* Sidebar nav */}
        <aside className="w-56 shrink-0 space-y-1">
          {navItems.map((n) => (
            <button key={n.id} onClick={() => setSection(n.id)}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-start transition text-sm ${
                section === n.id
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-600/25"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}>
              <n.icon className="size-4 shrink-0" />
              <span className="flex-1 font-medium leading-tight">{n.label}</span>
              {section === n.id && <ChevronRight className="size-3.5" />}
            </button>
          ))}
        </aside>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {section === "motors-makes" && <MakeModelEditor />}
          {section === "motors-fields" && <MotorFieldsEditor />}
          {section === "colors" && <ColorEditor />}
          {section === "classifieds-cats" && <ClassifiedsCatEditor />}
          {section === "classifieds-brands" && <ClassifiedsBrandsEditor />}
          {section === "locations" && <LocationsEditor />}
        </div>
      </div>
    </div>
  );
}

// ─── Make / Model editor ──────────────────────────────────────────────────────

function MakeModelEditor() {
  const { catalog, addMake, removeMake, addModel, removeModel } = useCatalog();
  const [selectedMake, setSelectedMake] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [newMake, setNewMake] = useState("");
  const [newModel, setNewModel] = useState("");

  const makes = Object.keys(catalog.makeModels).sort();
  const filtered = makes.filter((m) => !search || m.toLowerCase().includes(search.toLowerCase()));
  const models = selectedMake ? catalog.makeModels[selectedMake] || [] : [];

  return (
    <EditorCard title="Car Makes & Models" subtitle={`${makes.length} makes · ${Object.values(catalog.makeModels).flat().length} models total`} icon={Car}>
      <div className="grid lg:grid-cols-2 gap-4">
        {/* Makes column */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute start-2.5 top-1/2 -translate-y-1/2 size-3.5 text-slate-400" />
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search makes…"
                className="w-full ps-8 pe-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 outline-none focus:border-blue-500" />
            </div>
          </div>
          <AddRow
            placeholder="New make name (e.g. Rivian)"
            value={newMake}
            onChange={setNewMake}
            onAdd={() => {
              if (!newMake.trim()) return;
              if (catalog.makeModels[newMake.trim()]) { toast.error("Make already exists"); return; }
              addMake(newMake.trim());
              setSelectedMake(newMake.trim());
              setNewMake("");
              toast.success(`Make "${newMake.trim()}" added`);
            }}
          />
          <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden max-h-80 overflow-y-auto" style={{ scrollbarWidth: "thin" }}>
            {filtered.map((make) => (
              <button key={make} onClick={() => setSelectedMake(make)}
                className={`w-full flex items-center justify-between px-3 py-2.5 text-sm border-b border-slate-100 dark:border-slate-800 last:border-0 transition ${
                  selectedMake === make ? "bg-blue-50 dark:bg-blue-950/20 text-blue-700 dark:text-blue-300" : "hover:bg-slate-50 dark:hover:bg-slate-800/30"
                }`}>
                <span className="font-medium">{make}</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400">{(catalog.makeModels[make] || []).length} models</span>
                  {make !== "Other" && (
                    <button onClick={(e) => { e.stopPropagation(); if (selectedMake === make) setSelectedMake(null); removeMake(make); toast.success(`"${make}" removed`); }}
                      className="size-6 rounded-md flex items-center justify-center text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition">
                      <Trash2 className="size-3.5" />
                    </button>
                  )}
                </div>
              </button>
            ))}
            {filtered.length === 0 && <div className="py-8 text-center text-sm text-slate-400">No makes found</div>}
          </div>
        </div>

        {/* Models column */}
        <div className="space-y-3">
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            {selectedMake ? `Models for ${selectedMake}` : "← Select a make"}
          </p>
          {selectedMake && (
            <>
              <AddRow
                placeholder={`New model for ${selectedMake}…`}
                value={newModel}
                onChange={setNewModel}
                onAdd={() => {
                  if (!newModel.trim()) return;
                  if (models.includes(newModel.trim())) { toast.error("Model already exists"); return; }
                  addModel(selectedMake, newModel.trim());
                  setNewModel("");
                  toast.success(`Model "${newModel.trim()}" added to ${selectedMake}`);
                }}
              />
              <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden max-h-80 overflow-y-auto" style={{ scrollbarWidth: "thin" }}>
                {models.map((model) => (
                  <div key={model} className="flex items-center justify-between px-3 py-2 text-sm border-b border-slate-100 dark:border-slate-800 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/30">
                    <span>{model}</span>
                    {model !== "Other" && (
                      <button onClick={() => { removeModel(selectedMake, model); toast.success(`"${model}" removed`); }}
                        className="size-6 rounded-md flex items-center justify-center text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition">
                        <Trash2 className="size-3.5" />
                      </button>
                    )}
                  </div>
                ))}
                {models.length === 0 && <div className="py-8 text-center text-sm text-slate-400">No models yet — add one above</div>}
              </div>
            </>
          )}
          {!selectedMake && (
            <div className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl p-8 text-center text-slate-400">
              <Car className="size-8 mx-auto mb-2 text-slate-300 dark:text-slate-600" />
              <p className="text-sm">Select a make on the left to manage its models</p>
            </div>
          )}
        </div>
      </div>
    </EditorCard>
  );
}

// ─── Motor Spec Fields editor ─────────────────────────────────────────────────

const FIELD_LABELS: Record<keyof MotorFieldCatalog, string> = {
  regionalSpecs: "Regional Specs",
  sellerType: "Seller Type",
  bodyType: "Body Type",
  seats: "Seats",
  transmission: "Transmission Type",
  fuel: "Fuel Type",
  badges: "Badges",
  exportStatus: "Export Status",
  horsepower: "Horsepower",
  engineCapacity: "Engine Capacity (CC)",
  doors: "Doors",
  warranty: "Warranty",
  cylinders: "Number of Cylinders",
  driverAssistance: "Driver Assistance & Safety",
  comfort: "Comfort & Convenience",
  entertainment: "Entertainment & Technology",
  exteriorFeatures: "Exterior Features",
  condition: "Condition (Classifieds)",
};

function MotorFieldsEditor() {
  const { catalog, addMotorOption, removeMotorOption } = useCatalog();
  const [expandedField, setExpandedField] = useState<keyof MotorFieldCatalog | null>("bodyType");
  const [newValues, setNewValues] = useState<Partial<Record<keyof MotorFieldCatalog, string>>>({});

  const fields = Object.keys(FIELD_LABELS) as (keyof MotorFieldCatalog)[];

  return (
    <EditorCard title="Motor Spec Fields" subtitle="Options shown as pill selectors in the Post Ad form" icon={Sliders}>
      <div className="space-y-2">
        {fields.map((field) => {
          const isOpen = expandedField === field;
          const opts = catalog.motorsFields[field];
          return (
            <div key={field} className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
              <button
                onClick={() => setExpandedField(isOpen ? null : field)}
                className="w-full flex items-center justify-between px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold">{FIELD_LABELS[field]}</span>
                  <span className="text-xs text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-full">{opts.length} options</span>
                </div>
                {isOpen ? <ChevronDown className="size-4 text-slate-400" /> : <ChevronRight className="size-4 text-slate-400" />}
              </button>
              {isOpen && (
                <div className="border-t border-slate-100 dark:border-slate-800 px-4 py-3 space-y-3">
                  <div className="flex flex-wrap gap-2">
                    {opts.map((o) => (
                      <span key={o} className="flex items-center gap-1 px-2.5 py-1 rounded-full border border-slate-200 dark:border-slate-700 text-sm bg-slate-50 dark:bg-slate-800/50 group">
                        {o}
                        <button onClick={() => { removeMotorOption(field, o); toast.success(`"${o}" removed`); }}
                          className="size-3.5 rounded-full flex items-center justify-center text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition opacity-0 group-hover:opacity-100">
                          <X className="size-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                  <AddRow
                    placeholder={`Add option to ${FIELD_LABELS[field]}…`}
                    value={newValues[field] || ""}
                    onChange={(v) => setNewValues((s) => ({ ...s, [field]: v }))}
                    onAdd={() => {
                      const v = (newValues[field] || "").trim();
                      if (!v) return;
                      if (opts.includes(v)) { toast.error("Option already exists"); return; }
                      addMotorOption(field, v);
                      setNewValues((s) => ({ ...s, [field]: "" }));
                      toast.success(`"${v}" added`);
                    }}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </EditorCard>
  );
}

// ─── Color editor ─────────────────────────────────────────────────────────────

function ColorEditor() {
  const { catalog, addColor, removeColor } = useCatalog();
  const [newName, setNewName] = useState("");
  const [newHex, setNewHex] = useState("#3b82f6");
  const [search, setSearch] = useState("");

  const filtered = catalog.colorOpts.filter((c) => !search || c.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <EditorCard title="Color Palette" subtitle={`${catalog.colorOpts.length} colors available in Exterior / Interior color pickers`} icon={Palette}>
      <div className="space-y-4">
        {/* Add color row */}
        <div className="flex gap-2 items-end p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/30">
          <div className="flex-1">
            <label className="text-xs font-semibold text-slate-500 block mb-1">Color name</label>
            <input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="e.g. Midnight Blue"
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 outline-none focus:border-blue-500" />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500 block mb-1">Hex code</label>
            <div className="flex items-center gap-2">
              <div className="size-9 rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden cursor-pointer relative">
                <input type="color" value={newHex} onChange={(e) => setNewHex(e.target.value)}
                  className="absolute inset-0 w-full h-full cursor-pointer opacity-0" />
                <div className="w-full h-full" style={{ background: newHex }} />
              </div>
              <input value={newHex} onChange={(e) => setNewHex(e.target.value)} placeholder="#3b82f6"
                className="w-28 px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 outline-none focus:border-blue-500 font-mono" />
            </div>
          </div>
          <button
            onClick={() => {
              if (!newName.trim()) { toast.error("Enter a color name"); return; }
              if (catalog.colorOpts.some((c) => c.name.toLowerCase() === newName.trim().toLowerCase())) { toast.error("Color already exists"); return; }
              addColor({ name: newName.trim(), hex: newHex });
              setNewName("");
              setNewHex("#3b82f6");
              toast.success(`Color "${newName.trim()}" added`);
            }}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition shrink-0 self-end">
            <Plus className="size-3.5" /> Add
          </button>
        </div>

        <div className="relative">
          <Search className="absolute start-2.5 top-1/2 -translate-y-1/2 size-3.5 text-slate-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search colors…"
            className="w-full ps-8 pe-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 outline-none focus:border-blue-500" />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
          {filtered.map((c) => (
            <div key={c.name} className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 group">
              <div className="size-7 rounded-full border-2 border-slate-200 dark:border-slate-600 shrink-0 shadow-sm" style={{ background: c.hex }} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{c.name}</p>
                <p className="text-[10px] font-mono text-slate-400">{c.hex}</p>
              </div>
              <button onClick={() => { removeColor(c.name); toast.success(`"${c.name}" removed`); }}
                className="size-6 rounded-md text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center justify-center transition opacity-0 group-hover:opacity-100 shrink-0">
                <Trash2 className="size-3.5" />
              </button>
            </div>
          ))}
        </div>
        {filtered.length === 0 && <EmptyState icon={Palette} msg="No colors match" />}
      </div>
    </EditorCard>
  );
}

// ─── Classifieds categories editor ───────────────────────────────────────────

function ClassifiedsCatEditor() {
  const { catalog, addClassifiedsCat, removeClassifiedsCat, addClassifiedsSubCat, removeClassifiedsSubCat } = useCatalog();
  const [selectedCat, setSelectedCat] = useState<string | null>(null);
  const [newCat, setNewCat] = useState("");
  const [newSub, setNewSub] = useState("");

  const cats = Object.keys(catalog.classifiedsTree);
  const subs = selectedCat ? catalog.classifiedsTree[selectedCat] || [] : [];

  return (
    <EditorCard title="Classifieds Categories" subtitle="Top-level categories and their sub-category lists" icon={Tag}>
      <div className="grid lg:grid-cols-2 gap-4">
        {/* Categories */}
        <div className="space-y-3">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Categories ({cats.length})</p>
          <AddRow placeholder="New category (e.g. Sporting Goods)" value={newCat} onChange={setNewCat}
            onAdd={() => {
              if (!newCat.trim()) return;
              if (catalog.classifiedsTree[newCat.trim()]) { toast.error("Category already exists"); return; }
              addClassifiedsCat(newCat.trim());
              setSelectedCat(newCat.trim());
              setNewCat("");
              toast.success(`Category "${newCat.trim()}" added`);
            }}
          />
          <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden max-h-80 overflow-y-auto" style={{ scrollbarWidth: "thin" }}>
            {cats.map((cat) => (
              <button key={cat} onClick={() => setSelectedCat(cat)}
                className={`w-full flex items-center justify-between px-3 py-2.5 text-sm border-b border-slate-100 dark:border-slate-800 last:border-0 transition ${
                  selectedCat === cat ? "bg-blue-50 dark:bg-blue-950/20 text-blue-700 dark:text-blue-300" : "hover:bg-slate-50 dark:hover:bg-slate-800/30"
                }`}>
                <span className="font-medium">{cat}</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400">{(catalog.classifiedsTree[cat] || []).length} sub</span>
                  <button onClick={(e) => { e.stopPropagation(); if (selectedCat === cat) setSelectedCat(null); removeClassifiedsCat(cat); toast.success(`"${cat}" removed`); }}
                    className="size-6 rounded-md flex items-center justify-center text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition">
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
              </button>
            ))}
            {cats.length === 0 && <EmptyState icon={Tag} msg="No categories" />}
          </div>
        </div>

        {/* Sub-categories */}
        <div className="space-y-3">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">
            {selectedCat ? `Sub-categories of "${selectedCat}"` : "← Select a category"}
          </p>
          {selectedCat ? (
            <>
              <AddRow placeholder={`New sub-category under ${selectedCat}…`} value={newSub} onChange={setNewSub}
                onAdd={() => {
                  if (!newSub.trim()) return;
                  if (subs.includes(newSub.trim())) { toast.error("Already exists"); return; }
                  addClassifiedsSubCat(selectedCat, newSub.trim());
                  setNewSub("");
                  toast.success(`"${newSub.trim()}" added`);
                }}
              />
              <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden max-h-80 overflow-y-auto" style={{ scrollbarWidth: "thin" }}>
                {subs.map((sub) => (
                  <div key={sub} className="flex items-center justify-between px-3 py-2.5 text-sm border-b border-slate-100 dark:border-slate-800 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/30">
                    <span>{sub}</span>
                    <button onClick={() => { removeClassifiedsSubCat(selectedCat, sub); toast.success(`"${sub}" removed`); }}
                      className="size-6 rounded-md flex items-center justify-center text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition">
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                ))}
                {subs.length === 0 && <EmptyState icon={Tag} msg="No sub-categories yet" />}
              </div>
            </>
          ) : (
            <div className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl p-8 text-center text-slate-400">
              <Tag className="size-8 mx-auto mb-2 text-slate-300 dark:text-slate-600" />
              <p className="text-sm">Select a category to manage its sub-categories</p>
            </div>
          )}
        </div>
      </div>
    </EditorCard>
  );
}

// ─── Classifieds brands editor ────────────────────────────────────────────────

function ClassifiedsBrandsEditor() {
  const { catalog, addClassifiedsBrand, removeClassifiedsBrand, addClassifiedsModel, removeClassifiedsModel } = useCatalog();
  const [selectedSubCat, setSelectedSubCat] = useState<string | null>(Object.keys(catalog.classifiedsMakeModels)[0] || null);
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null);
  const [newBrand, setNewBrand] = useState("");
  const [newModel, setNewModel] = useState("");

  const subCats = Object.keys(catalog.classifiedsMakeModels);
  const brands = selectedSubCat ? Object.keys(catalog.classifiedsMakeModels[selectedSubCat] || {}) : [];
  const models = selectedSubCat && selectedBrand ? (catalog.classifiedsMakeModels[selectedSubCat] || {})[selectedBrand] || [] : [];

  return (
    <EditorCard title="Electronics / Classifieds Brands" subtitle="Brands and model lists for each classifieds sub-category" icon={Package}>
      {/* Sub-cat selector */}
      <div className="flex flex-wrap gap-2 mb-4 pb-4 border-b border-slate-100 dark:border-slate-800">
        <span className="text-xs font-bold text-slate-500 self-center uppercase tracking-wide me-2">Sub-category:</span>
        {subCats.map((sc) => (
          <button key={sc} onClick={() => { setSelectedSubCat(sc); setSelectedBrand(null); }}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition ${selectedSubCat === sc ? "bg-blue-600 text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"}`}>
            {sc}
          </button>
        ))}
      </div>

      {selectedSubCat && (
        <div className="grid lg:grid-cols-2 gap-4">
          {/* Brands */}
          <div className="space-y-3">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Brands ({brands.length})</p>
            <AddRow placeholder={`New brand for ${selectedSubCat}…`} value={newBrand} onChange={setNewBrand}
              onAdd={() => {
                if (!newBrand.trim()) return;
                if (brands.includes(newBrand.trim())) { toast.error("Brand already exists"); return; }
                addClassifiedsBrand(selectedSubCat, newBrand.trim());
                setSelectedBrand(newBrand.trim());
                setNewBrand("");
                toast.success(`Brand "${newBrand.trim()}" added`);
              }}
            />
            <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden max-h-64 overflow-y-auto" style={{ scrollbarWidth: "thin" }}>
              {brands.map((b) => (
                <button key={b} onClick={() => setSelectedBrand(b)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 text-sm border-b border-slate-100 dark:border-slate-800 last:border-0 transition ${
                    selectedBrand === b ? "bg-blue-50 dark:bg-blue-950/20 text-blue-700 dark:text-blue-300" : "hover:bg-slate-50 dark:hover:bg-slate-800/30"
                  }`}>
                  <span className="font-medium">{b}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400">{models.length > 0 && selectedBrand === b ? models.length : (catalog.classifiedsMakeModels[selectedSubCat]?.[b] || []).length} models</span>
                    {b !== "Other" && (
                      <button onClick={(e) => { e.stopPropagation(); if (selectedBrand === b) setSelectedBrand(null); removeClassifiedsBrand(selectedSubCat, b); toast.success(`"${b}" removed`); }}
                        className="size-6 rounded-md flex items-center justify-center text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition">
                        <Trash2 className="size-3.5" />
                      </button>
                    )}
                  </div>
                </button>
              ))}
              {brands.length === 0 && <EmptyState icon={Package} msg="No brands yet" />}
            </div>
          </div>

          {/* Models */}
          <div className="space-y-3">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">
              {selectedBrand ? `Models for ${selectedBrand}` : "← Select a brand"}
            </p>
            {selectedBrand ? (
              <>
                <AddRow placeholder={`New model for ${selectedBrand}…`} value={newModel} onChange={setNewModel}
                  onAdd={() => {
                    if (!newModel.trim()) return;
                    if (models.includes(newModel.trim())) { toast.error("Model already exists"); return; }
                    addClassifiedsModel(selectedSubCat, selectedBrand, newModel.trim());
                    setNewModel("");
                    toast.success(`Model "${newModel.trim()}" added`);
                  }}
                />
                <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden max-h-64 overflow-y-auto" style={{ scrollbarWidth: "thin" }}>
                  {models.map((m) => (
                    <div key={m} className="flex items-center justify-between px-3 py-2.5 text-sm border-b border-slate-100 dark:border-slate-800 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/30">
                      <span>{m}</span>
                      {m !== "Other" && (
                        <button onClick={() => { removeClassifiedsModel(selectedSubCat, selectedBrand, m); toast.success(`"${m}" removed`); }}
                          className="size-6 rounded-md flex items-center justify-center text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition">
                          <Trash2 className="size-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                  {models.length === 0 && <EmptyState icon={Package} msg="No models yet — add one above" />}
                </div>
              </>
            ) : (
              <div className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl p-8 text-center text-slate-400">
                <Package className="size-8 mx-auto mb-2 text-slate-300 dark:text-slate-600" />
                <p className="text-sm">Select a brand to manage its models</p>
              </div>
            )}
          </div>
        </div>
      )}
    </EditorCard>
  );
}

// ─── Locations editor ─────────────────────────────────────────────────────────

function LocationsEditor() {
  const { catalog, addLocation, removeLocation } = useCatalog();
  const [newLoc, setNewLoc] = useState("");
  const [search, setSearch] = useState("");

  const filtered = catalog.locations.filter((l) => !search || l.toLowerCase().includes(search.toLowerCase()));

  return (
    <EditorCard title="Locations & Cities" subtitle={`${catalog.locations.length} locations available in the location dropdown`} icon={MapPin}>
      <div className="space-y-3">
        <AddRow placeholder="New city/emirate (e.g. Hatta)" value={newLoc} onChange={setNewLoc}
          onAdd={() => {
            if (!newLoc.trim()) return;
            if (catalog.locations.includes(newLoc.trim())) { toast.error("Location already exists"); return; }
            addLocation(newLoc.trim());
            setNewLoc("");
            toast.success(`"${newLoc.trim()}" added`);
          }}
        />
        <div className="relative">
          <Search className="absolute start-2.5 top-1/2 -translate-y-1/2 size-3.5 text-slate-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search locations…"
            className="w-full ps-8 pe-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 outline-none focus:border-blue-500" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {filtered.map((loc) => (
            <div key={loc} className="flex items-center gap-2 px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 group">
              <MapPin className="size-3.5 text-slate-400 shrink-0" />
              <span className="flex-1 text-sm font-medium truncate">{loc}</span>
              <button onClick={() => { removeLocation(loc); toast.success(`"${loc}" removed`); }}
                className="size-5 rounded flex items-center justify-center text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition opacity-0 group-hover:opacity-100">
                <X className="size-3.5" />
              </button>
            </div>
          ))}
        </div>
        {filtered.length === 0 && <EmptyState icon={MapPin} msg="No locations found" />}
      </div>
    </EditorCard>
  );
}

// ─── Shared sub-components ────────────────────────────────────────────────────

function EditorCard({ title, subtitle, icon: Icon, children }: {
  title: string; subtitle: string; icon: typeof Car; children: React.ReactNode;
}) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3">
        <span className="size-9 rounded-xl bg-blue-50 dark:bg-blue-950/30 flex items-center justify-center">
          <Icon className="size-4 text-blue-600" />
        </span>
        <div>
          <p className="font-bold text-slate-900 dark:text-slate-100">{title}</p>
          <p className="text-xs text-slate-500">{subtitle}</p>
        </div>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

function AddRow({ placeholder, value, onChange, onAdd }: {
  placeholder: string; value: string;
  onChange: (v: string) => void; onAdd: () => void;
}) {
  return (
    <div className="flex gap-2">
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); onAdd(); } }}
        placeholder={placeholder}
        className="flex-1 px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 outline-none focus:border-blue-500"
      />
      <button onClick={onAdd}
        className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition shrink-0">
        <Plus className="size-3.5" /> Add
      </button>
    </div>
  );
}

function EmptyState({ icon: Icon, msg }: { icon: typeof Car; msg: string }) {
  return (
    <div className="py-8 text-center text-slate-400">
      <Icon className="size-6 mx-auto mb-1.5 text-slate-300 dark:text-slate-600" />
      <p className="text-sm">{msg}</p>
    </div>
  );
}
