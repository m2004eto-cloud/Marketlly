import { useState } from "react";
import { ArrowLeft, Home, Car, Tag, Upload, MapPin, Check, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { HeaderControls } from "./HeaderControls";
import { Editable } from "./Editable";

const detailsSchema = z.object({
  title: z.string().min(8, "Title must be at least 8 characters").max(80, "Title is too long"),
  price: z.coerce.number({ message: "Enter a valid price" }).positive("Price must be greater than 0"),
  description: z.string().min(20, "Description must be at least 20 characters").max(2000, "Description is too long"),
  location: z.string().min(1, "Choose a location"),
});

const contactSchema = z.object({
  phone: z
    .string()
    .min(1, "Phone number is required")
    .regex(/^\+?[\d\s-]{7,20}$/, "Enter a valid phone number"),
});

type DetailsValues = z.infer<typeof detailsSchema>;
type ContactValues = z.infer<typeof contactSchema>;

type Props = { onBack: () => void };
type Cat = "property" | "motors" | "classifieds";

type Field =
  | { key: string; label: string; type: "text" | "number"; placeholder?: string }
  | { key: string; label: string; type: "pill-single" | "pill-multi"; opts: string[] }
  | { key: string; label: string; type: "colors"; opts: { name: string; hex: string }[] }
  | { key: string; label: string; type: "checkbox-list"; opts: string[] }
  | { key: string; label: string; type: "make" | "model" };

const colorOpts = [
  { name: "Bronze", hex: "#cd7f32" }, { name: "Maroon", hex: "#800000" }, { name: "Pink", hex: "#ffc0cb" },
  { name: "Black", hex: "#000000" }, { name: "Blue", hex: "#2563eb" }, { name: "Brown", hex: "#8b4513" },
  { name: "Burgundy", hex: "#800020" }, { name: "Gold", hex: "#d4af37" }, { name: "Grey", hex: "#808080" },
  { name: "Orange", hex: "#f97316" }, { name: "Green", hex: "#22c55e" }, { name: "Purple", hex: "#a855f7" },
  { name: "Red", hex: "#ef4444" }, { name: "Silver", hex: "#c0c0c0" }, { name: "Beige", hex: "#f5f5dc" },
  { name: "Tan", hex: "#d2b48c" }, { name: "Teal", hex: "#0d9488" }, { name: "White", hex: "#ffffff" },
  { name: "Yellow", hex: "#facc15" },
];

const classifiedsTree: Record<string, string[]> = {
  "Electronics": ["Home Audio & Turntables", "Televisions", "DVD & Home Theater", "Electronic Accessories", "Gadgets", "Car Electronics", "Projectors", "Mp3 Players and Portable Audio", "Satellite & Cable TV", "Health Electronics", "Smart Home", "Wearable Technology", "Other"],
  "Computers & Networking": ["Laptops", "Desktops", "Networking", "Components", "Software", "Printers", "Storage", "Other"],
  "Business & Industrial": ["Office Supplies", "Restaurant Equipment", "Construction", "Medical", "Other"],
  "Home Appliances": ["Refrigerators", "Washing Machines", "Air Conditioners", "Microwaves", "Other"],
  "Sports Equipment": ["Fitness", "Cycling", "Football", "Tennis", "Other"],
  "Clothing & Accessories": ["Men", "Women", "Kids", "Bags", "Shoes"],
  "Cameras & Imaging": ["DSLR", "Mirrorless", "Lenses", "Drones", "Accessories"],
  "Jewelry & Watches": ["Watches", "Rings", "Necklaces", "Bracelets", "Other"],
  "Pets": ["Dogs", "Cats", "Birds", "Fish", "Accessories"],
  "Musical Instruments": ["Guitars", "Pianos", "Drums", "DJ Equipment", "Other"],
  "Gaming": ["Consoles", "Games", "Accessories", "VR", "PC Gaming"],
  "Baby Items": ["Strollers", "Car Seats", "Toys", "Clothing", "Other"],
  "Toys": ["Action Figures", "Dolls", "Educational", "Outdoor", "Other"],
  "Tickets & Vouchers": ["Concerts", "Sporting Events", "Travel", "Events", "Movies", "Theater", "Activities & Attractions", "Vouchers & Gift Cards", "Other"],
  "Collectibles": ["Coins", "Stamps", "Antiques", "Art", "Other"],
  "Books": ["Fiction", "Non-Fiction", "Textbooks", "Comics", "Other"],
  "Music": ["Vinyl", "CDs", "Cassettes", "Other"],
  "Free Stuff": ["All Items"],
  "Lost/Found": ["Lost", "Found"],
  "DVDs & Movies": ["DVDs", "Blu-Ray", "Other"],
  "Furniture, Home & Garden": ["Sofas", "Beds", "Tables", "Garden", "Other"],
  "Mobile Phones & Tablets": ["Phones", "Tablets", "Accessories", "Smartwatches", "Other"],
};

const cats: { id: Cat; icon: typeof Home; sub: string[] }[] = [
  { id: "property", icon: Home, sub: ["Apartment", "Villa", "Townhouse", "Office", "Land"] },
  { id: "motors", icon: Car, sub: ["Cars", "Motorcycles", "Boats", "Heavy Vehicles", "Auto Parts"] },
  { id: "classifieds", icon: Tag, sub: Object.keys(classifiedsTree) },
];

const classifiedsMakeModels: Record<string, Record<string, string[]>> = {
  Laptops: {
    Apple: ["MacBook Air M1", "MacBook Air M2", "MacBook Air M3", "MacBook Pro 13", "MacBook Pro 14 M3", "MacBook Pro 14 M3 Pro", "MacBook Pro 14 M3 Max", "MacBook Pro 16 M3 Pro", "MacBook Pro 16 M3 Max"],
    Dell: ["XPS 13", "XPS 15", "XPS 17", "Inspiron 14", "Inspiron 15", "Latitude 7440", "Latitude 9440", "Precision 5680", "Alienware m16", "Alienware m18", "G15", "G16"],
    HP: ["Pavilion 14", "Pavilion 15", "Envy 13", "Envy 14", "Envy x360", "Spectre x360", "EliteBook 840", "EliteBook 1040", "Omen 16", "Omen 17", "Victus 15", "Victus 16"],
    Lenovo: ["ThinkPad X1 Carbon", "ThinkPad X1 Yoga", "ThinkPad T14", "ThinkPad P16", "IdeaPad 3", "IdeaPad 5", "Yoga Slim 7", "Yoga 9i", "Legion 5", "Legion 7", "Legion Pro 7", "LOQ"],
    ASUS: ["ZenBook 14", "ZenBook 15", "ZenBook Pro Duo", "VivoBook 15", "ROG Zephyrus G14", "ROG Zephyrus G16", "ROG Strix G16", "ROG Strix Scar 17", "TUF Gaming A15", "TUF Gaming F17", "ProArt Studiobook"],
    Acer: ["Aspire 5", "Swift 3", "Swift 5", "Swift Edge", "Predator Helios 16", "Predator Helios 18", "Nitro 5", "Nitro 16", "ConceptD 7"],
    MSI: ["Modern 14", "Prestige 14", "Stealth 14", "Stealth 16", "Raider GE78", "Titan GT77", "Katana 15", "Cyborg 15"],
    Samsung: ["Galaxy Book4", "Galaxy Book4 Pro", "Galaxy Book4 Ultra", "Galaxy Book3 360"],
    Microsoft: ["Surface Laptop 5", "Surface Laptop Studio 2", "Surface Pro 9", "Surface Pro 10", "Surface Book 3"],
    Razer: ["Blade 14", "Blade 15", "Blade 16", "Blade 18"],
    LG: ["Gram 14", "Gram 15", "Gram 16", "Gram 17"],
    Huawei: ["MateBook X Pro", "MateBook D14", "MateBook D16", "MateBook 14s"],
    Other: ["Other"],
  },
  Desktops: {
    Apple: ["iMac 24", "Mac mini M2", "Mac mini M2 Pro", "Mac Studio M2 Max", "Mac Studio M2 Ultra", "Mac Pro M2 Ultra"],
    Dell: ["OptiPlex", "XPS Desktop", "Alienware Aurora R15", "Alienware Aurora R16", "Inspiron Desktop"],
    HP: ["Pavilion Desktop", "Envy Desktop", "Omen 25L", "Omen 45L", "EliteDesk", "Z2 Mini", "Z4 Workstation"],
    Lenovo: ["IdeaCentre", "ThinkCentre", "Legion Tower 5i", "Legion Tower 7i", "ThinkStation P360"],
    ASUS: ["ROG Strix GT15", "ROG Strix GA35", "ProArt Station PD5"],
    MSI: ["Aegis", "Trident", "MEG Aegis Ti5"],
    Acer: ["Predator Orion", "Aspire Desktop"],
    Custom: ["Custom Build"],
    Other: ["Other"],
  },
  Phones: {
    Apple: ["iPhone 11", "iPhone 12", "iPhone 12 Pro", "iPhone 13", "iPhone 13 Pro", "iPhone 13 Pro Max", "iPhone 14", "iPhone 14 Plus", "iPhone 14 Pro", "iPhone 14 Pro Max", "iPhone 15", "iPhone 15 Plus", "iPhone 15 Pro", "iPhone 15 Pro Max", "iPhone 16", "iPhone 16 Plus", "iPhone 16 Pro", "iPhone 16 Pro Max"],
    Samsung: ["Galaxy S21", "Galaxy S22", "Galaxy S23", "Galaxy S23 Ultra", "Galaxy S24", "Galaxy S24+", "Galaxy S24 Ultra", "Galaxy S25", "Galaxy S25 Ultra", "Galaxy Z Flip 5", "Galaxy Z Flip 6", "Galaxy Z Fold 5", "Galaxy Z Fold 6", "Galaxy A54", "Galaxy A55", "Galaxy Note 20 Ultra"],
    Google: ["Pixel 7", "Pixel 7 Pro", "Pixel 8", "Pixel 8 Pro", "Pixel 8a", "Pixel 9", "Pixel 9 Pro", "Pixel 9 Pro XL", "Pixel Fold"],
    Huawei: ["P50 Pro", "P60 Pro", "Mate 50 Pro", "Mate 60 Pro", "Mate X3", "Nova 12"],
    Xiaomi: ["13", "13 Pro", "14", "14 Pro", "14 Ultra", "Mix Fold 3", "Redmi Note 13", "Redmi Note 13 Pro", "POCO F6"],
    OnePlus: ["10 Pro", "11", "12", "12R", "Open", "Nord 3", "Nord CE 4"],
    OPPO: ["Find X6 Pro", "Find X7 Ultra", "Find N3", "Reno 11", "Reno 12"],
    Vivo: ["X100 Pro", "X100 Ultra", "V30", "V30 Pro"],
    Honor: ["Magic 6 Pro", "Magic V3", "Magic V Flip", "200 Pro"],
    Nothing: ["Phone (1)", "Phone (2)", "Phone (2a)"],
    Sony: ["Xperia 1 V", "Xperia 5 V", "Xperia 10 V"],
    Other: ["Other"],
  },
  Tablets: {
    Apple: ["iPad 9", "iPad 10", "iPad mini 6", "iPad Air 5", "iPad Air 6 (M2)", "iPad Pro 11 M2", "iPad Pro 12.9 M2", "iPad Pro 11 M4", "iPad Pro 13 M4"],
    Samsung: ["Galaxy Tab A9", "Galaxy Tab A9+", "Galaxy Tab S9", "Galaxy Tab S9 FE", "Galaxy Tab S9 Ultra", "Galaxy Tab S10+", "Galaxy Tab S10 Ultra"],
    Microsoft: ["Surface Pro 9", "Surface Pro 10", "Surface Go 4"],
    Huawei: ["MatePad Pro 13.2", "MatePad 11.5", "MatePad Air"],
    Lenovo: ["Tab P12", "Tab M11", "Yoga Tab 13"],
    Xiaomi: ["Pad 6", "Pad 6 Pro", "Pad 7"],
    Other: ["Other"],
  },
  DSLR: {
    Canon: ["EOS 5D Mark IV", "EOS 6D Mark II", "EOS 90D", "EOS 850D", "EOS 250D", "EOS-1D X Mark III"],
    Nikon: ["D850", "D780", "D7500", "D5600", "D3500", "D6"],
    Pentax: ["K-3 Mark III", "K-70", "KP"],
    Other: ["Other"],
  },
  Mirrorless: {
    Sony: ["A7 IV", "A7R V", "A7S III", "A9 III", "A1", "ZV-E10", "ZV-E1", "A6700", "FX3"],
    Canon: ["EOS R5", "EOS R6 Mark II", "EOS R7", "EOS R8", "EOS R10", "EOS R50", "EOS R3"],
    Nikon: ["Z6 II", "Z7 II", "Z8", "Z9", "Zf", "Zfc", "Z30", "Z50"],
    Fujifilm: ["X-T5", "X-T4", "X-S20", "X-H2", "X-H2S", "X-Pro3", "X100V", "X100VI", "GFX 100 II", "GFX 50S II"],
    Panasonic: ["Lumix S5 II", "Lumix S5 IIX", "Lumix GH6", "Lumix G9 II"],
    OM_System: ["OM-1", "OM-5"],
    Leica: ["SL3", "Q3", "M11"],
    Other: ["Other"],
  },
  Consoles: {
    Sony: ["PlayStation 4", "PlayStation 4 Pro", "PlayStation 5", "PlayStation 5 Slim", "PlayStation 5 Pro", "PlayStation Portal"],
    Microsoft: ["Xbox One", "Xbox One X", "Xbox Series S", "Xbox Series X"],
    Nintendo: ["Switch", "Switch OLED", "Switch Lite", "Switch 2"],
    Steam: ["Steam Deck", "Steam Deck OLED"],
    ASUS: ["ROG Ally", "ROG Ally X"],
    Lenovo: ["Legion Go"],
    Other: ["Other"],
  },
  Watches: {
    Rolex: ["Submariner", "Daytona", "Datejust", "GMT-Master II", "Day-Date", "Explorer", "Yacht-Master"],
    Omega: ["Speedmaster", "Seamaster", "Constellation", "De Ville", "Aqua Terra"],
    "Audemars Piguet": ["Royal Oak", "Royal Oak Offshore", "Royal Oak Concept", "Code 11.59"],
    "Patek Philippe": ["Nautilus", "Aquanaut", "Calatrava", "Grand Complications"],
    Cartier: ["Santos", "Tank", "Ballon Bleu", "Pasha"],
    "Richard Mille": ["RM 011", "RM 035", "RM 67", "RM 72"],
    Hublot: ["Big Bang", "Classic Fusion", "Spirit of Big Bang"],
    TAG_Heuer: ["Carrera", "Aquaracer", "Monaco", "Formula 1"],
    Apple: ["Watch SE", "Watch Series 9", "Watch Series 10", "Watch Ultra 2"],
    Samsung: ["Galaxy Watch 6", "Galaxy Watch 6 Classic", "Galaxy Watch Ultra"],
    Garmin: ["Fenix 7", "Forerunner 965", "Epix Pro"],
    Other: ["Other"],
  },
  Smartwatches: {
    Apple: ["Watch SE", "Watch Series 9", "Watch Series 10", "Watch Ultra 2"],
    Samsung: ["Galaxy Watch 6", "Galaxy Watch 6 Classic", "Galaxy Watch Ultra"],
    Garmin: ["Fenix 7", "Forerunner 965", "Epix Pro", "Venu 3", "Vivoactive 5"],
    Huawei: ["Watch GT 4", "Watch Ultimate", "Watch 4 Pro"],
    Google: ["Pixel Watch 2", "Pixel Watch 3"],
    Fitbit: ["Charge 6", "Versa 4", "Sense 2"],
    Other: ["Other"],
  },
  Televisions: {
    Samsung: ["Neo QLED 8K QN900D", "Neo QLED 4K QN90D", "OLED S95D", "OLED S90D", "QLED Q80D", "Crystal UHD DU8000", "The Frame LS03D"],
    LG: ["OLED G4", "OLED C4", "OLED B4", "QNED99", "QNED90", "UHD UR8000"],
    Sony: ["BRAVIA 9", "BRAVIA 8", "BRAVIA 7", "A95L OLED", "A80L OLED", "X95L Mini-LED"],
    TCL: ["QM8", "Q7", "Q6", "S5"],
    Hisense: ["U8K", "U7K", "U6K", "A6K"],
    Panasonic: ["MZ2000", "MZ1500"],
    Other: ["Other"],
  },
};

const classifiedsSpecs: Record<string, Field[]> = {
  Laptops: [
    { key: "ram", label: "RAM", type: "pill-single", opts: ["4 GB", "8 GB", "16 GB", "24 GB", "32 GB", "36 GB", "48 GB", "64 GB", "96 GB", "128 GB"] },
    { key: "storage", label: "SSD / Storage", type: "pill-single", opts: ["128 GB", "256 GB", "512 GB", "1 TB", "2 TB", "4 TB", "8 TB"] },
    { key: "screen", label: "Screen Size", type: "pill-single", opts: ["11\"", "12\"", "13\"", "14\"", "15\"", "16\"", "17\"", "18\""] },
    { key: "processor", label: "Processor", type: "pill-single", opts: ["Apple M1", "Apple M2", "Apple M3", "Apple M4", "Intel Core i3", "Intel Core i5", "Intel Core i7", "Intel Core i9", "Intel Core Ultra 5", "Intel Core Ultra 7", "Intel Core Ultra 9", "AMD Ryzen 5", "AMD Ryzen 7", "AMD Ryzen 9", "Snapdragon X Elite"] },
    { key: "gpu", label: "Graphics", type: "pill-single", opts: ["Integrated", "NVIDIA RTX 3050", "NVIDIA RTX 4050", "NVIDIA RTX 4060", "NVIDIA RTX 4070", "NVIDIA RTX 4080", "NVIDIA RTX 4090", "AMD Radeon RX", "Apple GPU"] },
    { key: "os", label: "Operating System", type: "pill-single", opts: ["macOS", "Windows 11", "Windows 10", "ChromeOS", "Linux"] },
    { key: "condition", label: "Condition", type: "pill-single", opts: ["New", "Used - Like New", "Used - Good", "Used - Fair"] },
    { key: "warranty", label: "Warranty", type: "pill-single", opts: ["Yes - Manufacturer", "Yes - Seller", "No"] },
  ],
  Desktops: [
    { key: "ram", label: "RAM", type: "pill-single", opts: ["8 GB", "16 GB", "32 GB", "64 GB", "128 GB"] },
    { key: "storage", label: "Storage", type: "pill-single", opts: ["256 GB SSD", "512 GB SSD", "1 TB SSD", "2 TB SSD", "1 TB HDD", "2 TB HDD", "4 TB HDD"] },
    { key: "processor", label: "Processor", type: "pill-single", opts: ["Apple M2", "Apple M2 Pro", "Apple M2 Max", "Apple M2 Ultra", "Intel Core i5", "Intel Core i7", "Intel Core i9", "AMD Ryzen 5", "AMD Ryzen 7", "AMD Ryzen 9"] },
    { key: "gpu", label: "Graphics", type: "pill-single", opts: ["Integrated", "NVIDIA RTX 4060", "NVIDIA RTX 4070", "NVIDIA RTX 4080", "NVIDIA RTX 4090", "AMD Radeon RX 7900"] },
    { key: "condition", label: "Condition", type: "pill-single", opts: ["New", "Used - Like New", "Used - Good", "Used - Fair"] },
    { key: "warranty", label: "Warranty", type: "pill-single", opts: ["Yes - Manufacturer", "Yes - Seller", "No"] },
  ],
  Phones: [
    { key: "storage", label: "Storage", type: "pill-single", opts: ["64 GB", "128 GB", "256 GB", "512 GB", "1 TB"] },
    { key: "ram", label: "RAM", type: "pill-single", opts: ["4 GB", "6 GB", "8 GB", "12 GB", "16 GB"] },
    { key: "color", label: "Color", type: "colors", opts: colorOpts },
    { key: "condition", label: "Condition", type: "pill-single", opts: ["New", "Used - Like New", "Used - Good", "Used - Fair"] },
    { key: "warranty", label: "Warranty", type: "pill-single", opts: ["Yes - Manufacturer", "Yes - Seller", "No"] },
  ],
  Tablets: [
    { key: "storage", label: "Storage", type: "pill-single", opts: ["64 GB", "128 GB", "256 GB", "512 GB", "1 TB", "2 TB"] },
    { key: "ram", label: "RAM", type: "pill-single", opts: ["4 GB", "6 GB", "8 GB", "12 GB", "16 GB"] },
    { key: "screen", label: "Screen Size", type: "pill-single", opts: ["8\"", "10\"", "11\"", "12.9\"", "13\"", "14\""] },
    { key: "connectivity", label: "Connectivity", type: "pill-single", opts: ["Wi-Fi", "Wi-Fi + Cellular"] },
    { key: "condition", label: "Condition", type: "pill-single", opts: ["New", "Used - Like New", "Used - Good", "Used - Fair"] },
    { key: "warranty", label: "Warranty", type: "pill-single", opts: ["Yes - Manufacturer", "Yes - Seller", "No"] },
  ],
  DSLR: [
    { key: "megapixels", label: "Megapixels", type: "pill-single", opts: ["12 MP", "16 MP", "20 MP", "24 MP", "32 MP", "45 MP", "50 MP+"] },
    { key: "sensor", label: "Sensor", type: "pill-single", opts: ["Full Frame", "APS-C", "Micro Four Thirds"] },
    { key: "kit", label: "Kit", type: "pill-single", opts: ["Body Only", "With Lens", "With Multiple Lenses"] },
    { key: "condition", label: "Condition", type: "pill-single", opts: ["New", "Used - Like New", "Used - Good", "Used - Fair"] },
    { key: "warranty", label: "Warranty", type: "pill-single", opts: ["Yes - Manufacturer", "Yes - Seller", "No"] },
  ],
  Mirrorless: [
    { key: "megapixels", label: "Megapixels", type: "pill-single", opts: ["12 MP", "20 MP", "24 MP", "26 MP", "33 MP", "45 MP", "50 MP+"] },
    { key: "sensor", label: "Sensor", type: "pill-single", opts: ["Full Frame", "APS-C", "Micro Four Thirds", "Medium Format"] },
    { key: "kit", label: "Kit", type: "pill-single", opts: ["Body Only", "With Lens", "With Multiple Lenses"] },
    { key: "condition", label: "Condition", type: "pill-single", opts: ["New", "Used - Like New", "Used - Good", "Used - Fair"] },
    { key: "warranty", label: "Warranty", type: "pill-single", opts: ["Yes - Manufacturer", "Yes - Seller", "No"] },
  ],
  Consoles: [
    { key: "storage", label: "Storage", type: "pill-single", opts: ["500 GB", "825 GB", "1 TB", "2 TB"] },
    { key: "edition", label: "Edition", type: "pill-single", opts: ["Standard", "Digital", "Disc", "Special Edition", "Bundle"] },
    { key: "condition", label: "Condition", type: "pill-single", opts: ["New", "Used - Like New", "Used - Good", "Used - Fair"] },
    { key: "warranty", label: "Warranty", type: "pill-single", opts: ["Yes - Manufacturer", "Yes - Seller", "No"] },
  ],
  Watches: [
    { key: "movement", label: "Movement", type: "pill-single", opts: ["Automatic", "Manual", "Quartz", "Smart"] },
    { key: "case", label: "Case Material", type: "pill-single", opts: ["Stainless Steel", "Yellow Gold", "Rose Gold", "White Gold", "Platinum", "Titanium", "Ceramic"] },
    { key: "size", label: "Case Size", type: "pill-single", opts: ["≤36mm", "37–40mm", "41–43mm", "44–46mm", "47mm+"] },
    { key: "condition", label: "Condition", type: "pill-single", opts: ["New", "Used - Like New", "Used - Good", "Used - Fair"] },
    { key: "warranty", label: "Warranty", type: "pill-single", opts: ["Yes - Manufacturer", "Yes - Seller", "No"] },
  ],
  Smartwatches: [
    { key: "size", label: "Case Size", type: "pill-single", opts: ["38mm", "40mm", "41mm", "42mm", "44mm", "45mm", "46mm", "49mm"] },
    { key: "connectivity", label: "Connectivity", type: "pill-single", opts: ["GPS", "GPS + Cellular"] },
    { key: "condition", label: "Condition", type: "pill-single", opts: ["New", "Used - Like New", "Used - Good", "Used - Fair"] },
    { key: "warranty", label: "Warranty", type: "pill-single", opts: ["Yes - Manufacturer", "Yes - Seller", "No"] },
  ],
  Televisions: [
    { key: "size", label: "Screen Size", type: "pill-single", opts: ["32\"", "43\"", "50\"", "55\"", "65\"", "75\"", "85\"", "98\""] },
    { key: "resolution", label: "Resolution", type: "pill-single", opts: ["HD", "Full HD", "4K UHD", "8K UHD"] },
    { key: "panel", label: "Panel", type: "pill-single", opts: ["LED", "QLED", "Neo QLED", "OLED", "Mini-LED", "Micro-LED"] },
    { key: "condition", label: "Condition", type: "pill-single", opts: ["New", "Used - Like New", "Used - Good", "Used - Fair"] },
    { key: "warranty", label: "Warranty", type: "pill-single", opts: ["Yes - Manufacturer", "Yes - Seller", "No"] },
  ],
};

const genericClassifiedsFields: Field[] = [
  { key: "brand", label: "Brand", type: "text" },
  { key: "condition", label: "Condition", type: "pill-single", opts: ["New", "Used - Like New", "Used - Good", "Used - Fair"] },
  { key: "warranty", label: "Warranty", type: "pill-single", opts: ["Yes - Manufacturer", "Yes - Seller", "No"] },
];

const makeModels: Record<string, string[]> = {
  "Mercedes-Benz": ["A-Class", "B-Class", "C-Class", "E-Class", "S-Class", "CLA", "CLS", "GLA", "GLB", "GLC", "GLE", "GLS", "G-Class", "AMG GT", "EQS", "EQE", "Maybach S-Class", "SL"],
  Toyota: ["Corolla", "Camry", "Land Cruiser", "Hilux", "Prado", "RAV4", "Yaris", "Fortuner", "Avalon", "Sequoia", "Highlander", "4Runner", "Tacoma", "Tundra", "Supra", "C-HR", "GR86"],
  BMW: ["1 Series", "2 Series", "3 Series", "4 Series", "5 Series", "6 Series", "7 Series", "8 Series", "X1", "X2", "X3", "X4", "X5", "X6", "X7", "Z4", "M2", "M3", "M4", "M5", "M8", "iX", "i4", "i7"],
  Nissan: ["Altima", "Maxima", "Patrol", "Pathfinder", "X-Trail", "Sunny", "Kicks", "Sentra", "Z", "GT-R", "Murano", "Armada", "Navara", "Juke", "Tiida", "370Z"],
  "Land Rover": ["Defender", "Discovery", "Discovery Sport", "Range Rover", "Range Rover Sport", "Range Rover Velar", "Range Rover Evoque", "Freelander"],
  Porsche: ["911", "718 Cayman", "718 Boxster", "Cayenne", "Macan", "Panamera", "Taycan"],
  Volkswagen: ["Golf", "Passat", "Jetta", "Tiguan", "Touareg", "Polo", "Arteon", "ID.4", "ID.6", "Atlas", "Beetle", "Scirocco"],
  Hyundai: ["Accent", "Elantra", "Sonata", "Tucson", "Santa Fe", "Creta", "Kona", "Palisade", "Veloster", "Genesis Coupe", "i10", "i20", "i30", "Staria", "Venue", "Ioniq", "Ioniq 5", "Ioniq 6"],
  Kia: ["Picanto", "Rio", "Cerato", "Optima", "Sportage", "Sorento", "Telluride", "Carnival", "K5", "Stinger", "Seltos", "Soul", "EV6", "Niro"],
  Audi: ["A1", "A3", "A4", "A5", "A6", "A7", "A8", "Q2", "Q3", "Q5", "Q7", "Q8", "R8", "RS3", "RS5", "RS6", "RS7", "TT", "e-tron", "e-tron GT"],
  Mazda: ["Mazda2", "Mazda3", "Mazda6", "CX-3", "CX-30", "CX-5", "CX-7", "CX-9", "CX-50", "CX-90", "MX-5", "MX-30"],
  Chevrolet: ["Spark", "Aveo", "Cruze", "Malibu", "Impala", "Camaro", "Corvette", "Trax", "Trailblazer", "Equinox", "Blazer", "Traverse", "Tahoe", "Suburban", "Silverado", "Captiva"],
  "Rolls-Royce": ["Phantom", "Ghost", "Wraith", "Dawn", "Cullinan", "Spectre", "Silver Shadow"],
  Honda: ["Civic", "Accord", "City", "CR-V", "HR-V", "Pilot", "Passport", "Odyssey", "Ridgeline", "Fit", "Jazz", "e:NS1"],
  Lamborghini: ["Aventador", "Huracán", "Urus", "Gallardo", "Murciélago", "Revuelto"],
  MG: ["MG3", "MG4", "MG5", "MG6", "ZS", "HS", "RX5", "RX8", "Cyberster", "Marvel R"],
  Ford: ["Fiesta", "Focus", "Fusion", "Mustang", "Mustang Mach-E", "Edge", "Escape", "Bronco", "Explorer", "Expedition", "F-150", "F-150 Raptor", "Ranger", "Ranger Raptor", "Transit", "EcoSport", "Taurus"],
  Dodge: ["Charger", "Challenger", "Durango", "Ram 1500", "Ram 2500", "Journey", "Viper"],
  Infiniti: ["Q30", "Q50", "Q60", "Q70", "QX30", "QX50", "QX55", "QX60", "QX70", "QX80"],
  Cadillac: ["ATS", "CT4", "CT5", "CT6", "CTS", "XT4", "XT5", "XT6", "Escalade", "Lyriq"],
  GMC: ["Acadia", "Terrain", "Yukon", "Yukon Denali", "Sierra", "Hummer EV", "Canyon", "Savana"],
  MINI: ["Cooper", "Cooper S", "Countryman", "Clubman", "Paceman", "John Cooper Works", "Electric"],
  Bentley: ["Continental GT", "Continental GTC", "Flying Spur", "Bentayga", "Mulsanne", "Arnage"],
  Suzuki: ["Swift", "Baleno", "Ciaz", "Dzire", "Vitara", "Grand Vitara", "Jimny", "S-Cross", "Ertiga", "Celerio"],
  Jetour: ["X70", "X70 Plus", "X90", "X90 Plus", "Dashing", "T2", "T2 i-DM"],
  Isuzu: ["D-Max", "MU-X", "Trooper", "Rodeo"],
  Chrysler: ["300", "300C", "Pacifica", "Voyager", "PT Cruiser", "Sebring"],
  Lincoln: ["Aviator", "Nautilus", "Navigator", "Corsair", "MKZ", "MKX", "MKC", "Continental"],
  Jaguar: ["XE", "XF", "XJ", "F-Type", "F-Pace", "E-Pace", "I-Pace"],
  GAC: ["GS3", "GS4", "GS5", "GS8", "GA4", "GA8", "Empow", "Aion S", "Aion Y"],
  Maserati: ["Ghibli", "Quattroporte", "Levante", "GranTurismo", "GranCabrio", "MC20", "Grecale"],
  Volvo: ["S60", "S90", "V60", "V90", "XC40", "XC60", "XC90", "EX30", "EX90", "C40"],
  McLaren: ["540C", "570S", "600LT", "650S", "720S", "750S", "765LT", "Artura", "GT", "P1", "Senna"],
  Chery: ["Tiggo 2", "Tiggo 3", "Tiggo 4", "Tiggo 5", "Tiggo 7", "Tiggo 8", "Arrizo 5", "Arrizo 6", "Omoda 5"],
  RAM: ["1500", "2500", "3500", "ProMaster", "Rampage"],
  "Mercedes-Maybach": ["S-Class", "GLS", "S 580", "S 680"],
  "Alfa Romeo": ["Giulia", "Stelvio", "Tonale", "4C", "Giulietta", "MiTo"],
  JAC: ["JS3", "JS4", "JS6", "JS8", "T6", "T8", "Refine"],
  "Aston Martin": ["DB11", "DB12", "Vantage", "DBS", "DBX", "Rapide", "Valkyrie"],
  Changan: ["CS35", "CS55", "CS75", "CS85", "CS95", "Eado", "Alsvin", "UNI-T", "UNI-K", "UNI-V"],
  Mercury: ["Grand Marquis", "Mountaineer", "Milan", "Sable"],
  Lexus: ["IS", "ES", "LS", "UX", "NX", "RX", "GX", "LX", "LC", "RC", "RZ", "LFA"],
  Skoda: ["Fabia", "Octavia", "Superb", "Kamiq", "Karoq", "Kodiaq", "Scala", "Enyaq"],
  Mitsubishi: ["Lancer", "Mirage", "Attrage", "Pajero", "Pajero Sport", "Outlander", "Eclipse Cross", "ASX", "Montero", "L200", "Triton", "Xpander"],
  Buick: ["Encore", "Enclave", "Envision", "Regal", "LaCrosse", "Verano"],
  "Lynk & Co": ["01", "02", "03", "05", "06", "08", "09"],
  Hummer: ["H1", "H2", "H3", "EV"],
  BAIC: ["BJ20", "BJ40", "BJ80", "X25", "X35", "X55", "X7", "Senova"],
  Peugeot: ["208", "301", "308", "508", "2008", "3008", "5008", "Partner", "Rifter", "Traveller"],
  Citroen: ["C3", "C4", "C5 Aircross", "C5 X", "Berlingo", "DS3", "DS4", "DS7"],
  GWM: ["Wingle", "H6", "Jolion", "Tank 300", "Tank 500", "Poer", "Ora"],
  Hongqi: ["H5", "H7", "H9", "HS5", "HS7", "E-HS9"],
  Forthing: ["T5", "T5 EVO", "M7", "Yaha"],
  INEOS: ["Grenadier"],
  Skywell: ["ET5", "EH3"],
  JAECOO: ["J7", "J8"],
  Opel: ["Astra", "Corsa", "Insignia", "Mokka", "Grandland", "Crossland"],
  Smart: ["Fortwo", "Forfour", "#1", "#3"],
  XPeng: ["P5", "P7", "G3", "G6", "G9", "X9"],
  Yangwang: ["U8", "U9"],
  Koenigsegg: ["Agera", "Regera", "Jesko", "Gemera", "CC850"],
  Lucid: ["Air", "Gravity"],
  "King Long": ["Kingo", "City Bus", "Mini Bus"],
  Citroën: ["C3", "C4", "C5", "Berlingo", "DS3"],
  CNHTC: ["Sitrak", "Howo"],
  Polestar: ["1", "2", "3", "4", "5"],
  Mahindra: ["Scorpio", "XUV300", "XUV500", "XUV700", "Thar", "Bolero"],
  Morgan: ["Plus Four", "Plus Six", "Super 3", "3 Wheeler"],
  WEY: ["VV5", "VV6", "VV7", "Coffee 01", "Coffee 02"],
  Pagani: ["Huayra", "Zonda", "Utopia"],
  Pontiac: ["G6", "G8", "Solstice", "GTO", "Firebird", "Trans Am"],
  Rivian: ["R1T", "R1S", "EDV"],
  Saab: ["9-3", "9-5", "9-7X"],
  SMC: ["Pickup"],
  SATA: ["Cargo"],
  VGV: ["U70", "U75 Plus"],
  XFeng: ["F1"],
  Tesla: ["Model S", "Model 3", "Model X", "Model Y", "Cybertruck", "Roadster"],
  Genesis: ["G70", "G80", "G90", "GV60", "GV70", "GV80"],
  Jeep: ["Wrangler", "Cherokee", "Grand Cherokee", "Compass", "Renegade", "Gladiator", "Wagoneer", "Grand Wagoneer"],
  Other: ["Other"],
};

const motorsFields: Field[] = [
  { key: "make", label: "Make", type: "make" },
  { key: "model", label: "Model", type: "model" },
  { key: "year", label: "Year", type: "number" },
  { key: "kms", label: "Kilometers", type: "number" },
  { key: "regionalSpecs", label: "Regional Specs", type: "pill-single", opts: ["GCC", "American", "Canadian", "European", "Japanese", "Korean", "Chinese", "Other"] },
  { key: "sellerType", label: "Seller Type", type: "pill-single", opts: ["Owner", "Dealer", "Dealership/Certified Pre-Owned"] },
  { key: "bodyType", label: "Body Type", type: "pill-single", opts: ["SUV", "Coupe", "Sedan", "Crossover", "Hard Top Convertible", "Pick Up Truck", "Hatchback", "Van", "Wagon", "Convertible"] },
  { key: "seats", label: "Seats", type: "pill-single", opts: ["2", "4", "5", "6", "7", "8", "9+"] },
  { key: "transmission", label: "Transmission Type", type: "pill-single", opts: ["Manual", "Automatic"] },
  { key: "fuel", label: "Fuel Type", type: "pill-single", opts: ["Petrol", "Diesel", "Hybrid", "Electric"] },
  { key: "badges", label: "Badges", type: "pill-multi", opts: ["First Owner", "In Warranty", "Dealer Warranty", "Service History", "No Accidents", "Original Paint", "Service Contract", "Car Finance"] },
  { key: "exportStatus", label: "Export Status", type: "pill-single", opts: ["UAE (can be exported)", "Export Only"] },
  { key: "exteriorColor", label: "Exterior Color", type: "colors", opts: colorOpts },
  { key: "interiorColor", label: "Interior Color", type: "colors", opts: colorOpts },
  { key: "horsepower", label: "Horsepower", type: "pill-single", opts: ["0 - 99 HP", "100 - 199 HP", "200 - 299 HP", "300 - 399 HP", "400 - 499 HP", "500 - 599 HP", "600 - 699 HP", "700 - 799 HP", "800 - 899 HP", "900+ HP", "Unknown"] },
  { key: "engineCapacity", label: "Engine Capacity (Cc)", type: "pill-single", opts: ["0 - 499 cc", "500 - 999 cc", "1000 - 1499 cc", "1500 - 1999 cc", "2000 - 2499 cc", "2500 - 2999 cc", "3000 - 3499 cc", "3500 - 3999 cc", "4000+ cc", "3000 - 5999 cc", "Unknown"] },
  { key: "doors", label: "Doors", type: "pill-single", opts: ["2", "3", "4", "5+"] },
  { key: "warranty", label: "Warranty", type: "pill-single", opts: ["Yes", "No", "Does not apply"] },
  { key: "cylinders", label: "Number Of Cylinders", type: "pill-single", opts: ["3", "4", "5", "6", "8", "10", "12", "Unknown"] },
  { key: "driverAssistance", label: "Driver Assistance & Safety", type: "pill-multi", opts: ["360 Camera", "4 Wheel Drive", "Anti-Lock Brakes (ABS)", "Blind Spot Monitor", "Cruise Control", "Lane Departure Warning", "Parking Sensors - Front", "Parking Sensors - Rear", "Rear View Camera", "Traction Control", "Front Airbags", "Side Airbags", "Hill Start Assist", "Child Seat Anchors (ISOFIX)"] },
  { key: "comfort", label: "Comfort & Convenience", type: "pill-multi", opts: ["Air Conditioning", "Automatic Climate Control", "Central Locking", "Heated Seats", "Keyless Entry", "Keyless Start", "Leather Seats", "Power Mirrors", "Power Seats", "Power Steering", "Power Windows", "Rear AC Vents", "Ventilated Seats"] },
  { key: "entertainment", label: "Entertainment & Technology", type: "pill-multi", opts: ["AM/FM Radio", "Bluetooth", "Touchscreen Display", "Navigation System", "Premium Sound System", "USB Port(s)", "Apple CarPlay", "Android Auto", "Wireless Charging"] },
  { key: "exteriorFeatures", label: "Exterior", type: "pill-multi", opts: ["Alloy Wheels", "Body Kit", "Daytime Running Lights (DRL)", "Panoramic Roof", "Rear Spoiler", "Sunroof", "LED Headlights", "Front Fog Lights"] },
];

const propertyFields: Field[] = [
  { key: "propertyType", label: "Property Type", type: "pill-single", opts: ["Apartment", "Villa", "Townhouse", "Penthouse", "Studio", "Land"] },
  { key: "bedrooms", label: "Bedrooms", type: "pill-single", opts: ["Studio", "1", "2", "3", "4", "5+"] },
  { key: "bathrooms", label: "Bathrooms", type: "pill-single", opts: ["1", "2", "3", "4+"] },
  { key: "area", label: "Area (sqft)", type: "number" },
  { key: "furnishing", label: "Furnishing", type: "pill-single", opts: ["Furnished", "Semi Furnished", "Unfurnished"] },
  { key: "amenities", label: "Amenities", type: "pill-multi", opts: ["Balcony", "Pool", "Gym", "Parking", "Security", "Maid's Room"] },
];

const classifiedsFields: Field[] = [
  { key: "condition", label: "Condition", type: "pill-single", opts: ["New", "Used - Like New", "Used - Good", "Used - Fair"] },
  { key: "brand", label: "Brand", type: "text" },
  { key: "warranty", label: "Warranty", type: "pill-single", opts: ["Yes - Manufacturer", "Yes - Seller", "No"] },
];

const fieldsByCat: Record<Cat, Field[]> = {
  motors: motorsFields,
  property: propertyFields,
  classifieds: classifiedsFields,
};

export function PostAd({ onBack }: Props) {
  const { t } = useTranslation();
  const [step, setStep] = useState(1);
  const [cat, setCat] = useState<Cat | null>(null);
  const [sub, setSub] = useState("");
  const [subSub, setSubSub] = useState("");
  const [meta, setMeta] = useState<Record<string, string>>({});
  const [multi, setMulti] = useState<Record<string, string[]>>({});
  const [photos, setPhotos] = useState<string[]>([]);

  const detailsForm = useForm<DetailsValues>({
    resolver: zodResolver(detailsSchema),
    mode: "onBlur",
    defaultValues: { title: "", price: undefined as unknown as number, description: "", location: "Dubai" },
  });
  const contactForm = useForm<ContactValues>({
    resolver: zodResolver(contactSchema),
    mode: "onBlur",
    defaultValues: { phone: "" },
  });

  const upd = (k: string, v: string) => setMeta((m) => ({ ...m, [k]: v }));
  const toggleMulti = (k: string, v: string) =>
    setMulti((s) => ({ ...s, [k]: (s[k] || []).includes(v) ? s[k].filter((x) => x !== v) : [...(s[k] || []), v] }));
  const hasMulti = (k: string, v: string) => (multi[k] || []).includes(v);

  const addPhoto = () => {
    const stock = [
      "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=600",
      "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=600",
      "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600",
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=600",
    ];
    setPhotos((p) => [...p, stock[p.length % stock.length]]);
  };

  const removePhoto = (i: number) => setPhotos((p) => p.filter((_, idx) => idx !== i));

  const submit = contactForm.handleSubmit(() => {
    setStep(4);
    toast.success(t("post.success"));
  });

  const goToPhotos = detailsForm.handleSubmit(() => setStep(3));

  const renderField = (f: Field) => {
    if (f.type === "text" || f.type === "number") {
      return (
        <input
          type={f.type}
          value={meta[f.key] || ""}
          onChange={(e) => upd(f.key, e.target.value)}
          placeholder={f.placeholder}
          className="mt-1 w-full px-3 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 outline-none focus:border-blue-600"
        />
      );
    }
    if (f.type === "pill-single") {
      return (
        <div className="mt-2 flex flex-wrap gap-2">
          {f.opts.map((o) => (
            <button
              key={o}
              type="button"
              onClick={() => upd(f.key, meta[f.key] === o ? "" : o)}
              className={`px-3 py-1.5 rounded-full border text-sm transition ${meta[f.key] === o ? "border-blue-600 bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300" : "border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:border-slate-400"}`}
            >
              {o}
            </button>
          ))}
        </div>
      );
    }
    if (f.type === "pill-multi") {
      return (
        <div className="mt-2 flex flex-wrap gap-2">
          {f.opts.map((o) => (
            <button
              key={o}
              type="button"
              onClick={() => toggleMulti(f.key, o)}
              className={`px-3 py-1.5 rounded-full border text-sm transition ${hasMulti(f.key, o) ? "border-blue-600 bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300" : "border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:border-slate-400"}`}
            >
              {o}
            </button>
          ))}
        </div>
      );
    }
    if (f.type === "colors") {
      return (
        <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 gap-2">
          {f.opts.map((c) => (
            <button
              key={c.name}
              type="button"
              onClick={() => upd(f.key, meta[f.key] === c.name ? "" : c.name)}
              className={`flex items-center gap-2 px-2 py-1.5 rounded-full border text-sm transition ${meta[f.key] === c.name ? "border-blue-600 bg-blue-50 dark:bg-blue-950/30" : "border-slate-200 dark:border-slate-700"}`}
            >
              <span className="size-3 rounded-full border border-slate-300" style={{ background: c.hex }} />
              <span className="truncate">{c.name}</span>
            </button>
          ))}
        </div>
      );
    }
    if (f.type === "make") {
      return (
        <select
          value={meta.make || ""}
          onChange={(e) => { upd("make", e.target.value); upd("model", ""); }}
          className="mt-1 w-full px-3 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 outline-none focus:border-blue-600"
        >
          <option value="">Select Make…</option>
          {Object.keys(makeModels).sort().map((m) => <option key={m} value={m}>{m}</option>)}
        </select>
      );
    }
    if (f.type === "model") {
      const models = meta.make ? makeModels[meta.make] || [] : [];
      return (
        <select
          value={meta.model || ""}
          onChange={(e) => upd("model", e.target.value)}
          disabled={!meta.make}
          className="mt-1 w-full px-3 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 outline-none focus:border-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <option value="">{meta.make ? "Select Model…" : "Select Make first"}</option>
          {models.map((m) => <option key={m} value={m}>{m}</option>)}
        </select>
      );
    }
    if (f.type === "checkbox-list") {
      return (
        <div className="mt-2 space-y-2">
          {f.opts.map((o) => (
            <label key={o} className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={hasMulti(f.key, o)} onChange={() => toggleMulti(f.key, o)} className="size-4 accent-blue-600" />
              <span className="text-sm">{o}</span>
            </label>
          ))}
        </div>
      );
    }
    return null;
  };

  if (step === 4) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4">
        <div className="absolute top-4 end-4"><HeaderControls /></div>
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-10 max-w-md text-center shadow-xl border border-slate-100 dark:border-slate-800 text-slate-900 dark:text-slate-100">
          <div className="size-16 rounded-full bg-emerald-100 dark:bg-emerald-900/30 mx-auto flex items-center justify-center mb-4">
            <Check className="size-8 text-emerald-600" />
          </div>
          <h2 className="tracking-tight mb-2">
            <Editable id="post.success" page="Post Ad" label="Success Heading" defaultValue={t("post.success")} />
          </h2>
          <p className="text-slate-500 mb-6">
            <Editable id="post.successSub" page="Post Ad" label="Success Subtitle" multiline defaultValue={t("post.successSub")} />
          </p>
          <button onClick={onBack} className="px-6 py-3 rounded-xl bg-slate-900 dark:bg-white dark:text-slate-900 text-white hover:opacity-90">{t("post.backToMarket")}</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-3xl mx-auto px-4 h-16 flex items-center gap-3">
          <button onClick={onBack} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"><ArrowLeft className="size-5" /></button>
          <h1 className="tracking-tight">
            <Editable id="post.title" page="Post Ad" label="Page Title" defaultValue={t("post.title")} />
          </h1>
          <div className="ms-auto"><HeaderControls /></div>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="flex items-center gap-2 mb-8">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex-1 flex items-center gap-2">
              <div className={`size-8 rounded-full flex items-center justify-center transition ${step >= s ? "bg-blue-600 text-white" : "bg-slate-200 dark:bg-slate-800 text-slate-500"}`}>{s}</div>
              {s < 3 && <div className={`flex-1 h-1 rounded ${step > s ? "bg-blue-600" : "bg-slate-200 dark:bg-slate-800"}`} />}
            </div>
          ))}
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 md:p-8">
          {step === 1 && (
            <>
              <h2 className="tracking-tight mb-1">{t("post.chooseCat")}</h2>
              <p className="text-slate-500 mb-6">{t("post.chooseSub")}</p>
              <div className="grid sm:grid-cols-3 gap-3 mb-6">
                {cats.map((c) => (
                  <button key={c.id} onClick={() => { setCat(c.id); setSub(""); setSubSub(""); setMeta({}); setMulti({}); }} className={`p-5 rounded-xl border text-start transition ${cat === c.id ? "border-blue-600 bg-blue-50 dark:bg-blue-950/30" : "border-slate-200 dark:border-slate-700"}`}>
                    <c.icon className={`size-6 mb-3 ${cat === c.id ? "text-blue-600" : "text-slate-500"}`} />
                    <p>{t(`nav.${c.id}`)}</p>
                  </button>
                ))}
              </div>
              {cat && (
                <div>
                  <p className="mb-2">{t("post.sub")}</p>
                  <div className="flex flex-wrap gap-2 mb-6">
                    {cats.find((c) => c.id === cat)!.sub.map((s) => (
                      <button key={s} onClick={() => { setSub(s); setSubSub(""); setMeta({}); setMulti({}); }} className={`px-3 py-2 rounded-lg border transition ${sub === s ? "border-blue-600 bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300" : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300"}`}>{s}</button>
                    ))}
                  </div>
                </div>
              )}
              {cat === "classifieds" && sub && classifiedsTree[sub] && (
                <div>
                  <p className="mb-2">Type</p>
                  <div className="flex flex-wrap gap-2 mb-6">
                    {classifiedsTree[sub].map((s) => (
                      <button key={s} onClick={() => { setSubSub(s); setMeta({}); setMulti({}); }} className={`px-3 py-2 rounded-lg border transition ${subSub === s ? "border-blue-600 bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300" : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300"}`}>{s}</button>
                    ))}
                  </div>
                </div>
              )}
              <div className="flex justify-end">
                <button disabled={!cat || !sub || (cat === "classifieds" && !subSub)} onClick={() => setStep(2)} className="px-6 py-3 rounded-xl bg-slate-900 dark:bg-white dark:text-slate-900 text-white disabled:bg-slate-300 dark:disabled:bg-slate-700">{t("post.continue")}</button>
              </div>
            </>
          )}

          {step === 2 && cat && (
            <>
              <h2 className="tracking-tight mb-1">{t("post.details")}</h2>
              <p className="text-slate-500 mb-6">{sub} — {t("post.basics")}</p>
              <div className="space-y-5">
                <div>
                  <label>{t("post.titleField")}</label>
                  <input
                    {...detailsForm.register("title")}
                    aria-invalid={!!detailsForm.formState.errors.title}
                    placeholder={t("post.titlePh")}
                    className={`mt-1 w-full px-3 py-3 rounded-xl border bg-white dark:bg-slate-950 outline-none ${detailsForm.formState.errors.title ? "border-red-500" : "border-slate-200 dark:border-slate-700 focus:border-blue-600"}`}
                  />
                  {detailsForm.formState.errors.title && (
                    <p className="text-xs text-red-600 mt-1">{detailsForm.formState.errors.title.message}</p>
                  )}
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label>{t("post.price")}</label>
                    <input
                      {...detailsForm.register("price")}
                      type="number"
                      aria-invalid={!!detailsForm.formState.errors.price}
                      placeholder="0"
                      className={`mt-1 w-full px-3 py-3 rounded-xl border bg-white dark:bg-slate-950 outline-none ${detailsForm.formState.errors.price ? "border-red-500" : "border-slate-200 dark:border-slate-700 focus:border-blue-600"}`}
                    />
                    {detailsForm.formState.errors.price && (
                      <p className="text-xs text-red-600 mt-1">{detailsForm.formState.errors.price.message}</p>
                    )}
                  </div>
                  <div>
                    <label>{t("post.location")}</label>
                    <div className="relative mt-1">
                      <MapPin className="absolute start-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                      <select
                        {...detailsForm.register("location")}
                        className="w-full ps-10 pe-3 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 outline-none focus:border-blue-600"
                      >
                        <option>Dubai</option><option>Abu Dhabi</option><option>Sharjah</option><option>Ajman</option><option>RAK</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="space-y-5 pt-3 border-t border-slate-100 dark:border-slate-800">
                  {cat === "classifieds" && classifiedsMakeModels[subSub] && (
                    <>
                      <div>
                        <label>Make</label>
                        <select
                          value={meta.make || ""}
                          onChange={(e) => { upd("make", e.target.value); upd("model", ""); }}
                          className="mt-1 w-full px-3 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 outline-none focus:border-blue-600"
                        >
                          <option value="">Select Make…</option>
                          {Object.keys(classifiedsMakeModels[subSub]).sort().map((m) => <option key={m} value={m}>{m}</option>)}
                        </select>
                      </div>
                      <div>
                        <label>Model</label>
                        <select
                          value={meta.model || ""}
                          onChange={(e) => upd("model", e.target.value)}
                          disabled={!meta.make}
                          className="mt-1 w-full px-3 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 outline-none focus:border-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <option value="">{meta.make ? "Select Model…" : "Select Make first"}</option>
                          {(meta.make ? classifiedsMakeModels[subSub][meta.make] || [] : []).map((m) => <option key={m} value={m}>{m}</option>)}
                        </select>
                      </div>
                    </>
                  )}
                  {(cat === "classifieds"
                    ? (classifiedsSpecs[subSub] || genericClassifiedsFields)
                    : fieldsByCat[cat]
                  ).map((f) => (
                    <div key={f.key}>
                      <label>{f.label}</label>
                      {renderField(f)}
                    </div>
                  ))}
                </div>

                <div>
                  <label>{t("post.desc")}</label>
                  <textarea
                    {...detailsForm.register("description")}
                    rows={4}
                    aria-invalid={!!detailsForm.formState.errors.description}
                    placeholder={t("post.descPh")}
                    className={`mt-1 w-full px-3 py-3 rounded-xl border bg-white dark:bg-slate-950 outline-none resize-none ${detailsForm.formState.errors.description ? "border-red-500" : "border-slate-200 dark:border-slate-700 focus:border-blue-600"}`}
                  />
                  {detailsForm.formState.errors.description && (
                    <p className="text-xs text-red-600 mt-1">{detailsForm.formState.errors.description.message}</p>
                  )}
                </div>
              </div>
              <div className="flex justify-between mt-6">
                <button onClick={() => setStep(1)} className="px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700">{t("post.back")}</button>
                <button onClick={goToPhotos} className="px-6 py-3 rounded-xl bg-slate-900 dark:bg-white dark:text-slate-900 text-white">{t("post.continue")}</button>
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <h2 className="tracking-tight mb-1">{t("post.photos")}</h2>
              <p className="text-slate-500 mb-6">{t("post.photosSub")}</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                {photos.map((p, i) => (
                  <div key={i} className="relative aspect-square rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 group">
                    <img src={p} alt="" className="size-full object-cover" />
                    <button onClick={() => removePhoto(i)} className="absolute top-1 end-1 size-6 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                      <X className="size-3" />
                    </button>
                  </div>
                ))}
                {photos.length < 25 && (
                  <button onClick={addPhoto} className="aspect-square rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/20 flex flex-col items-center justify-center text-slate-500">
                    <Upload className="size-5 mb-1" />
                    <span className="text-sm">{t("post.addPhoto")}</span>
                  </button>
                )}
              </div>
              <div>
                <label>{t("post.phone")}</label>
                <input
                  {...contactForm.register("phone")}
                  aria-invalid={!!contactForm.formState.errors.phone}
                  placeholder="+971 50 000 0000"
                  className={`mt-1 w-full px-3 py-3 rounded-xl border bg-white dark:bg-slate-950 outline-none ${contactForm.formState.errors.phone ? "border-red-500" : "border-slate-200 dark:border-slate-700 focus:border-blue-600"}`}
                />
                {contactForm.formState.errors.phone && (
                  <p className="text-xs text-red-600 mt-1">{contactForm.formState.errors.phone.message}</p>
                )}
              </div>
              <div className="flex justify-between mt-6">
                <button onClick={() => setStep(2)} className="px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700">{t("post.back")}</button>
                <button onClick={submit} className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 text-white">{t("post.submit")}</button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
