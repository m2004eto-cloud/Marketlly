import React, { createContext, useContext, useState, ReactNode } from "react";
import { DEFAULT_MAKE_MODELS } from "./data/carMakeModels";

// ─── Types ────────────────────────────────────────────────────────────────────

export type ColorOpt = { name: string; hex: string };

export type CatalogState = {
  // Motors
  makeModels: Record<string, string[]>;
  motorsFields: MotorFieldCatalog;
  // Classifieds
  classifiedsTree: Record<string, string[]>;
  classifiedsMakeModels: Record<string, Record<string, string[]>>;
  // Colors
  colorOpts: ColorOpt[];
  // Locations
  locations: string[];
};

export type MotorFieldCatalog = {
  regionalSpecs: string[];
  sellerType: string[];
  bodyType: string[];
  seats: string[];
  transmission: string[];
  fuel: string[];
  badges: string[];
  exportStatus: string[];
  horsepower: string[];
  engineCapacity: string[];
  doors: string[];
  warranty: string[];
  cylinders: string[];
  driverAssistance: string[];
  comfort: string[];
  entertainment: string[];
  exteriorFeatures: string[];
  condition: string[];
};

type CatalogContextType = {
  catalog: CatalogState;
  // Makes & Models
  addMake: (make: string) => void;
  removeMake: (make: string) => void;
  addModel: (make: string, model: string) => void;
  removeModel: (make: string, model: string) => void;
  // Motor pill fields
  addMotorOption: (field: keyof MotorFieldCatalog, value: string) => void;
  removeMotorOption: (field: keyof MotorFieldCatalog, value: string) => void;
  // Colors
  addColor: (c: ColorOpt) => void;
  removeColor: (name: string) => void;
  // Classifieds categories
  addClassifiedsCat: (cat: string) => void;
  removeClassifiedsCat: (cat: string) => void;
  addClassifiedsSubCat: (cat: string, sub: string) => void;
  removeClassifiedsSubCat: (cat: string, sub: string) => void;
  // Classifieds make/model
  addClassifiedsBrand: (subCat: string, brand: string) => void;
  removeClassifiedsBrand: (subCat: string, brand: string) => void;
  addClassifiedsModel: (subCat: string, brand: string, model: string) => void;
  removeClassifiedsModel: (subCat: string, brand: string, model: string) => void;
  // Locations
  addLocation: (loc: string) => void;
  removeLocation: (loc: string) => void;
};

// ─── Defaults ─────────────────────────────────────────────────────────────────

const DEFAULT_MOTOR_FIELDS: MotorFieldCatalog = {
  regionalSpecs: ["GCC", "American", "Canadian", "European", "Japanese", "Korean", "Chinese", "Other"],
  sellerType: ["Owner", "Dealer", "Dealership/Certified Pre-Owned"],
  bodyType: ["SUV", "Coupe", "Sedan", "Crossover", "Hard Top Convertible", "Pick Up Truck", "Hatchback", "Van", "Wagon", "Convertible"],
  seats: ["2", "4", "5", "6", "7", "8", "9+"],
  transmission: ["Manual", "Automatic"],
  fuel: ["Petrol", "Diesel", "Hybrid", "Electric"],
  badges: ["First Owner", "In Warranty", "Dealer Warranty", "Service History", "No Accidents", "Original Paint", "Service Contract", "Car Finance"],
  exportStatus: ["UAE (can be exported)", "Export Only"],
  horsepower: ["0 - 99 HP", "100 - 199 HP", "200 - 299 HP", "300 - 399 HP", "400 - 499 HP", "500 - 599 HP", "600 - 699 HP", "700 - 799 HP", "800 - 899 HP", "900+ HP", "Unknown"],
  engineCapacity: ["0 - 499 cc", "500 - 999 cc", "1000 - 1499 cc", "1500 - 1999 cc", "2000 - 2499 cc", "2500 - 2999 cc", "3000 - 3499 cc", "3500 - 3999 cc", "4000+ cc", "Unknown"],
  doors: ["2", "3", "4", "5+"],
  warranty: ["Yes", "No", "Does not apply"],
  cylinders: ["3", "4", "5", "6", "8", "10", "12", "Unknown"],
  driverAssistance: ["360 Camera", "4 Wheel Drive", "Anti-Lock Brakes (ABS)", "Blind Spot Monitor", "Cruise Control", "Lane Departure Warning", "Parking Sensors - Front", "Parking Sensors - Rear", "Rear View Camera", "Traction Control", "Front Airbags", "Side Airbags", "Hill Start Assist", "Child Seat Anchors (ISOFIX)"],
  comfort: ["Air Conditioning", "Automatic Climate Control", "Central Locking", "Heated Seats", "Keyless Entry", "Keyless Start", "Leather Seats", "Power Mirrors", "Power Seats", "Power Steering", "Power Windows", "Rear AC Vents", "Ventilated Seats"],
  entertainment: ["AM/FM Radio", "Bluetooth", "Touchscreen Display", "Navigation System", "Premium Sound System", "USB Port(s)", "Apple CarPlay", "Android Auto", "Wireless Charging"],
  exteriorFeatures: ["Alloy Wheels", "Body Kit", "Daytime Running Lights (DRL)", "Panoramic Roof", "Rear Spoiler", "Sunroof", "LED Headlights", "Front Fog Lights"],
  condition: ["New", "Used - Like New", "Used - Good", "Used - Fair"],
};

const DEFAULT_CLASSIFIEDS_TREE: Record<string, string[]> = {
  "Electronics": ["Home Audio", "Televisions", "DVD & Home Theater", "Gadgets", "Car Electronics", "Projectors", "Smart Home", "Wearable Technology", "Other"],
  "Computers & Networking": ["Laptops", "Desktops", "Networking", "Components", "Software", "Printers", "Storage", "Other"],
  "Mobile Phones & Tablets": ["Phones", "Tablets", "Accessories", "Smartwatches", "Other"],
  "Cameras & Imaging": ["DSLR", "Mirrorless", "Action Cameras", "Lenses", "Accessories", "Other"],
  "Gaming": ["Consoles", "Games", "Accessories", "PC Gaming", "Other"],
  "Home Appliances": ["Washing Machines", "Refrigerators", "Air Conditioners", "Ovens", "Dishwashers", "Other"],
  "Furniture": ["Living Room", "Bedroom", "Dining Room", "Office", "Outdoor", "Other"],
  "Sports & Leisure": ["Bikes & Scooters", "Fitness Equipment", "Sports Gear", "Camping", "Water Sports", "Other"],
};

const DEFAULT_CLASSIFIEDS_MAKE_MODELS: Record<string, Record<string, string[]>> = {
  Laptops: { Apple: ["MacBook Air M2", "MacBook Air M3", "MacBook Pro 14 M3", "MacBook Pro 16 M3"], Dell: ["XPS 13", "XPS 15", "Inspiron 15", "Alienware m16"], HP: ["Spectre x360", "Envy 14", "Omen 16", "EliteBook 840"], Lenovo: ["ThinkPad X1 Carbon", "IdeaPad 5", "Legion 5", "Yoga 9i"], ASUS: ["ZenBook 14", "ROG Zephyrus G14", "TUF Gaming A15", "VivoBook 15"], Other: ["Other"] },
  Phones: { Apple: ["iPhone 15", "iPhone 15 Pro", "iPhone 15 Pro Max", "iPhone 16", "iPhone 16 Pro"], Samsung: ["Galaxy S24", "Galaxy S24 Ultra", "Galaxy Z Flip 6", "Galaxy A55"], Google: ["Pixel 8", "Pixel 8 Pro", "Pixel 9", "Pixel 9 Pro"], Other: ["Other"] },
  Tablets: { Apple: ["iPad 10", "iPad Air M2", "iPad Pro M4 11", "iPad Pro M4 13"], Samsung: ["Galaxy Tab S9", "Galaxy Tab S10+", "Galaxy Tab S10 Ultra"], Microsoft: ["Surface Pro 10", "Surface Pro 9"], Other: ["Other"] },
  Consoles: { Sony: ["PlayStation 5", "PlayStation 5 Slim", "PS4 Pro", "PS VR2"], Microsoft: ["Xbox Series X", "Xbox Series S", "Xbox One X"], Nintendo: ["Nintendo Switch", "Nintendo Switch OLED", "Nintendo Switch Lite"], Other: ["Other"] },
};

const DEFAULT_COLORS: ColorOpt[] = [
  { name: "Black", hex: "#000000" }, { name: "White", hex: "#ffffff" }, { name: "Silver", hex: "#c0c0c0" },
  { name: "Grey", hex: "#808080" }, { name: "Red", hex: "#ef4444" }, { name: "Blue", hex: "#2563eb" },
  { name: "Green", hex: "#22c55e" }, { name: "Orange", hex: "#f97316" }, { name: "Yellow", hex: "#facc15" },
  { name: "Brown", hex: "#8b4513" }, { name: "Beige", hex: "#f5f5dc" }, { name: "Gold", hex: "#d4af37" },
  { name: "Bronze", hex: "#cd7f32" }, { name: "Maroon", hex: "#800000" }, { name: "Burgundy", hex: "#800020" },
  { name: "Purple", hex: "#a855f7" }, { name: "Pink", hex: "#ffc0cb" }, { name: "Tan", hex: "#d2b48c" },
  { name: "Teal", hex: "#0d9488" }, { name: "Pearl White", hex: "#f8f4f0" },
];

const DEFAULT_LOCATIONS = [
  "Dubai", "Abu Dhabi", "Sharjah", "Ajman", "Ras Al Khaimah", "Fujairah", "Umm Al Quwain",
  "Al Ain", "Khor Fakkan", "Dibba", "Kalba", "Dhaid",
];

// ─── Context ──────────────────────────────────────────────────────────────────

const CatalogContext = createContext<CatalogContextType | null>(null);

export function CatalogProvider({ children }: { children: ReactNode }) {
  const [catalog, setCatalog] = useState<CatalogState>({
    makeModels: DEFAULT_MAKE_MODELS,
    motorsFields: DEFAULT_MOTOR_FIELDS,
    classifiedsTree: DEFAULT_CLASSIFIEDS_TREE,
    classifiedsMakeModels: DEFAULT_CLASSIFIEDS_MAKE_MODELS,
    colorOpts: DEFAULT_COLORS,
    locations: DEFAULT_LOCATIONS,
  });

  const upd = (fn: (prev: CatalogState) => CatalogState) => setCatalog(fn);

  const addMake = (make: string) => upd((s) => ({ ...s, makeModels: { ...s.makeModels, [make]: [] } }));
  const removeMake = (make: string) => upd((s) => { const m = { ...s.makeModels }; delete m[make]; return { ...s, makeModels: m }; });
  const addModel = (make: string, model: string) => upd((s) => ({ ...s, makeModels: { ...s.makeModels, [make]: [...(s.makeModels[make] || []), model] } }));
  const removeModel = (make: string, model: string) => upd((s) => ({ ...s, makeModels: { ...s.makeModels, [make]: (s.makeModels[make] || []).filter((m) => m !== model) } }));

  const addMotorOption = (field: keyof MotorFieldCatalog, value: string) =>
    upd((s) => ({ ...s, motorsFields: { ...s.motorsFields, [field]: [...s.motorsFields[field], value] } }));
  const removeMotorOption = (field: keyof MotorFieldCatalog, value: string) =>
    upd((s) => ({ ...s, motorsFields: { ...s.motorsFields, [field]: s.motorsFields[field].filter((v) => v !== value) } }));

  const addColor = (c: ColorOpt) => upd((s) => ({ ...s, colorOpts: [...s.colorOpts, c] }));
  const removeColor = (name: string) => upd((s) => ({ ...s, colorOpts: s.colorOpts.filter((c) => c.name !== name) }));

  const addClassifiedsCat = (cat: string) => upd((s) => ({ ...s, classifiedsTree: { ...s.classifiedsTree, [cat]: [] } }));
  const removeClassifiedsCat = (cat: string) => upd((s) => { const t = { ...s.classifiedsTree }; delete t[cat]; return { ...s, classifiedsTree: t }; });
  const addClassifiedsSubCat = (cat: string, sub: string) => upd((s) => ({ ...s, classifiedsTree: { ...s.classifiedsTree, [cat]: [...(s.classifiedsTree[cat] || []), sub] } }));
  const removeClassifiedsSubCat = (cat: string, sub: string) => upd((s) => ({ ...s, classifiedsTree: { ...s.classifiedsTree, [cat]: (s.classifiedsTree[cat] || []).filter((x) => x !== sub) } }));

  const addClassifiedsBrand = (subCat: string, brand: string) =>
    upd((s) => ({ ...s, classifiedsMakeModels: { ...s.classifiedsMakeModels, [subCat]: { ...(s.classifiedsMakeModels[subCat] || {}), [brand]: [] } } }));
  const removeClassifiedsBrand = (subCat: string, brand: string) =>
    upd((s) => { const m = { ...(s.classifiedsMakeModels[subCat] || {}) }; delete m[brand]; return { ...s, classifiedsMakeModels: { ...s.classifiedsMakeModels, [subCat]: m } }; });
  const addClassifiedsModel = (subCat: string, brand: string, model: string) =>
    upd((s) => ({ ...s, classifiedsMakeModels: { ...s.classifiedsMakeModels, [subCat]: { ...(s.classifiedsMakeModels[subCat] || {}), [brand]: [...((s.classifiedsMakeModels[subCat] || {})[brand] || []), model] } } }));
  const removeClassifiedsModel = (subCat: string, brand: string, model: string) =>
    upd((s) => ({ ...s, classifiedsMakeModels: { ...s.classifiedsMakeModels, [subCat]: { ...(s.classifiedsMakeModels[subCat] || {}), [brand]: ((s.classifiedsMakeModels[subCat] || {})[brand] || []).filter((m) => m !== model) } } }));

  const addLocation = (loc: string) => upd((s) => ({ ...s, locations: [...s.locations, loc] }));
  const removeLocation = (loc: string) => upd((s) => ({ ...s, locations: s.locations.filter((l) => l !== loc) }));

  return (
    <CatalogContext.Provider value={{
      catalog, addMake, removeMake, addModel, removeModel,
      addMotorOption, removeMotorOption, addColor, removeColor,
      addClassifiedsCat, removeClassifiedsCat, addClassifiedsSubCat, removeClassifiedsSubCat,
      addClassifiedsBrand, removeClassifiedsBrand, addClassifiedsModel, removeClassifiedsModel,
      addLocation, removeLocation,
    }}>
      {children}
    </CatalogContext.Provider>
  );
}

export function useCatalog() {
  const ctx = useContext(CatalogContext);
  if (!ctx) throw new Error("useCatalog must be used inside CatalogProvider");
  return ctx;
}
