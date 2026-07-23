/**
 * Full make → model catalog for Place Ad / Auction posting (UAE & GCC focused).
 * Includes major global brands plus Chinese makes common in the region.
 */
export const DEFAULT_MAKE_MODELS: Record<string, string[]> = {
  // ── Japanese ──────────────────────────────────────────────────────────────
  Toyota: [
    "Corolla", "Camry", "Avalon", "Yaris", "Yaris Cross", "Raize", "Rush", "Urban Cruiser",
    "RAV4", "Corolla Cross", "C-HR", "Harrier", "Highlander", "Fortuner", "Prado",
    "Land Cruiser", "Land Cruiser 70", "Land Cruiser 300", "Sequoia", "4Runner",
    "Hilux", "Tacoma", "Tundra", "Hiace", "Coaster", "Alphard", "Vellfire", "Sienna",
    "Crown", "Crown Signia", "GR Yaris", "GR Corolla", "GR86", "Supra", "bZ4X", "Other",
  ],
  Nissan: [
    "Sunny", "Sentra", "Altima", "Maxima", "Versa", "Tiida", "Kicks", "Juke", "X-Trail",
    "Rogue", "Pathfinder", "Murano", "Armada", "Patrol", "Patrol Safari", "Patrol Nismo",
    "Navara", "Frontier", "GT-R", "Z", "370Z", "Leaf", "Ariya", "Terra", "Magnite", "Other",
  ],
  Honda: [
    "Civic", "Accord", "City", "Fit", "Jazz", "CR-V", "HR-V", "ZR-V", "Pilot", "Passport",
    "Odyssey", "Ridgeline", "BR-V", "WR-V", "e:NS1", "e:NP1", "Other",
  ],
  Lexus: [
    "IS", "ES", "LS", "UX", "NX", "RX", "TX", "GX", "LX", "LC", "RC", "RZ", "LM", "LFA", "Other",
  ],
  Mitsubishi: [
    "Lancer", "Mirage", "Attrage", "ASX", "Eclipse Cross", "Outlander", "Outlander PHEV",
    "Pajero", "Pajero Sport", "Montero", "L200", "Triton", "Xpander", "Xpander Cross", "Other",
  ],
  Mazda: [
    "Mazda2", "Mazda3", "Mazda6", "CX-3", "CX-30", "CX-5", "CX-50", "CX-60", "CX-70",
    "CX-8", "CX-9", "CX-90", "MX-5", "MX-30", "BT-50", "Other",
  ],
  Suzuki: [
    "Swift", "Baleno", "Ciaz", "Dzire", "Celerio", "Alto", "Vitara", "Grand Vitara",
    "Jimny", "S-Cross", "Ertiga", "XL7", "Fronx", "Other",
  ],
  Subaru: [
    "Impreza", "Legacy", "WRX", "BRZ", "Forester", "Outback", "Crosstrek", "Ascent", "Solterra", "Other",
  ],
  Infiniti: [
    "Q50", "Q60", "Q70", "QX50", "QX55", "QX60", "QX80", "Other",
  ],
  Isuzu: ["D-Max", "MU-X", "Trooper", "NPR", "Other"],
  Acura: ["ILX", "TLX", "RDX", "MDX", "Integra", "ZDX", "Other"],

  // ── Korean ────────────────────────────────────────────────────────────────
  Hyundai: [
    "i10", "i20", "i30", "Accent", "Elantra", "Sonata", "Azera", "Veloster",
    "Venue", "Creta", "Kona", "Tucson", "Santa Fe", "Palisade", "Staria",
    "Ioniq", "Ioniq 5", "Ioniq 6", "Ioniq 9", "Nexo", "Genesis Coupe", "Other",
  ],
  Kia: [
    "Picanto", "Rio", "Pegas", "Cerato", "Forte", "K5", "K8", "Stinger",
    "Sonet", "Seltos", "Soul", "Sportage", "Sorento", "Telluride", "Carnival",
    "EV3", "EV5", "EV6", "EV9", "Niro", "Other",
  ],
  Genesis: ["G70", "G80", "G90", "GV60", "GV70", "GV80", "Electrified G80", "Electrified GV70", "Other"],
  SsangYong: ["Tivoli", "Korando", "Rexton", "Musso", "Torres", "Other"],

  // ── German / European ─────────────────────────────────────────────────────
  "Mercedes-Benz": [
    "A-Class", "B-Class", "C-Class", "E-Class", "S-Class", "CLA", "CLS", "CLE",
    "GLA", "GLB", "GLC", "GLE", "GLS", "G-Class", "SL", "SLC", "AMG GT",
    "EQA", "EQB", "EQC", "EQE", "EQS", "EQS SUV", "EQV", "V-Class", "Vito", "Sprinter", "Other",
  ],
  "Mercedes-Maybach": ["S-Class", "S 580", "S 680", "GLS", "EQS SUV", "Other"],
  BMW: [
    "1 Series", "2 Series", "3 Series", "4 Series", "5 Series", "6 Series", "7 Series", "8 Series",
    "X1", "X2", "X3", "X4", "X5", "X6", "X7", "XM", "Z4",
    "M2", "M3", "M4", "M5", "M8", "iX1", "iX2", "iX3", "iX", "i4", "i5", "i7", "Other",
  ],
  Audi: [
    "A1", "A3", "A4", "A5", "A6", "A7", "A8", "Q2", "Q3", "Q5", "Q7", "Q8",
    "TT", "R8", "RS3", "RS4", "RS5", "RS6", "RS7", "RS Q8",
    "e-tron", "e-tron GT", "Q4 e-tron", "Q6 e-tron", "Q8 e-tron", "Other",
  ],
  Volkswagen: [
    "Polo", "Golf", "Jetta", "Passat", "Arteon", "T-Roc", "Tiguan", "Touareg",
    "Atlas", "ID.3", "ID.4", "ID.6", "ID.7", "ID.Buzz", "Amarok", "Caddy", "Transporter", "Other",
  ],
  Porsche: [
    "911", "718 Cayman", "718 Boxster", "Cayenne", "Cayenne Coupe", "Macan", "Panamera", "Taycan", "Other",
  ],
  "Land Rover": [
    "Defender", "Defender 90", "Defender 110", "Defender 130",
    "Discovery", "Discovery Sport", "Range Rover", "Range Rover Sport",
    "Range Rover Velar", "Range Rover Evoque", "Freelander", "Other",
  ],
  Jaguar: ["XE", "XF", "XJ", "F-Type", "F-Pace", "E-Pace", "I-Pace", "Other"],
  Volvo: ["S60", "S90", "V60", "V90", "XC40", "XC60", "XC90", "C40", "EX30", "EX90", "Other"],
  MINI: ["Cooper", "Cooper S", "Countryman", "Clubman", "John Cooper Works", "Aceman", "Electric", "Other"],
  Skoda: ["Fabia", "Octavia", "Superb", "Kamiq", "Karoq", "Kodiaq", "Scala", "Enyaq", "Other"],
  Opel: ["Corsa", "Astra", "Insignia", "Mokka", "Crossland", "Grandland", "Other"],
  Peugeot: ["208", "301", "308", "508", "2008", "3008", "5008", "Partner", "Rifter", "Traveller", "Other"],
  Citroën: ["C3", "C4", "C5 Aircross", "C5 X", "Berlingo", "Other"],
  "DS Automobiles": ["DS 3", "DS 4", "DS 7", "DS 9", "Other"],
  Renault: ["Clio", "Megane", "Captur", "Kadjar", "Arkana", "Austral", "Koleos", "Duster", "Talisman", "Other"],
  Fiat: ["500", "500X", "Tipo", "Panda", "Doblo", "Other"],
  "Alfa Romeo": ["Giulia", "Stelvio", "Tonale", "Junior", "4C", "Other"],
  Seat: ["Ibiza", "Leon", "Arona", "Ateca", "Tarraco", "Other"],
  Cupra: ["Formentor", "Leon", "Ateca", "Born", "Tavascan", "Other"],
  Smart: ["Fortwo", "Forfour", "#1", "#3", "Other"],

  // ── American ──────────────────────────────────────────────────────────────
  Ford: [
    "Fiesta", "Focus", "Fusion", "Taurus", "Mustang", "Mustang Mach-E",
    "EcoSport", "Escape", "Bronco", "Bronco Sport", "Edge", "Explorer", "Expedition",
    "Ranger", "Ranger Raptor", "F-150", "F-150 Raptor", "F-250", "F-350", "Transit", "Other",
  ],
  Chevrolet: [
    "Spark", "Aveo", "Cruze", "Malibu", "Impala", "Camaro", "Corvette",
    "Trax", "Trailblazer", "Equinox", "Blazer", "Traverse", "Tahoe", "Suburban",
    "Silverado", "Colorado", "Captiva", "Groove", "Other",
  ],
  GMC: ["Terrain", "Acadia", "Yukon", "Yukon XL", "Sierra", "Canyon", "Hummer EV", "Savana", "Other"],
  Cadillac: ["CT4", "CT5", "XT4", "XT5", "XT6", "Escalade", "Escalade ESV", "Lyriq", "Optiq", "Vistiq", "Other"],
  Jeep: [
    "Wrangler", "Wrangler 4xe", "Cherokee", "Grand Cherokee", "Grand Cherokee L",
    "Compass", "Renegade", "Gladiator", "Wagoneer", "Grand Wagoneer", "Other",
  ],
  Dodge: ["Charger", "Challenger", "Durango", "Hornet", "Journey", "Viper", "Other"],
  RAM: ["1500", "2500", "3500", "ProMaster", "Rampage", "Other"],
  Chrysler: ["300", "300C", "Pacifica", "Voyager", "Other"],
  Lincoln: ["Corsair", "Nautilus", "Aviator", "Navigator", "Other"],
  Tesla: ["Model 3", "Model Y", "Model S", "Model X", "Cybertruck", "Roadster", "Other"],
  Rivian: ["R1T", "R1S", "Other"],
  Lucid: ["Air", "Gravity", "Other"],
  Hummer: ["H1", "H2", "H3", "EV SUV", "EV Pickup", "Other"],
  Buick: ["Encore", "Envision", "Enclave", "Other"],

  // ── British / Ultra luxury ────────────────────────────────────────────────
  "Rolls-Royce": ["Phantom", "Ghost", "Cullinan", "Spectre", "Wraith", "Dawn", "Other"],
  Bentley: ["Continental GT", "Continental GTC", "Flying Spur", "Bentayga", "Other"],
  "Aston Martin": ["DB11", "DB12", "Vantage", "DBS", "DBX", "Valhalla", "Valkyrie", "Other"],
  McLaren: ["Artura", "750S", "720S", "765LT", "GT", "GTS", "Senna", "Elva", "Other"],
  Ferrari: ["Roma", "Roma Spider", "SF90", "296 GTB", "296 GTS", "F8 Tributo", "Purosangue", "812", "12Cilindri", "Other"],
  Lamborghini: ["Huracán", "Revuelto", "Urus", "Temerario", "Aventador", "Other"],
  Maserati: ["Ghibli", "Quattroporte", "Levante", "Grecale", "GranTurismo", "GranCabrio", "MC20", "Other"],
  Lotus: ["Emira", "Eletre", "Emeya", "Evija", "Other"],
  Polestar: ["2", "3", "4", "5", "Other"],
  INEOS: ["Grenadier", "Quartermaster", "Other"],
  Morgan: ["Plus Four", "Plus Six", "Super 3", "Other"],
  Pagani: ["Huayra", "Utopia", "Other"],
  Koenigsegg: ["Jesko", "Gemera", "CC850", "Regera", "Other"],

  // ── Chinese (UAE / GCC popular + major lines) ──────────────────────────────
  BYD: [
    "Seal", "Seal U", "Sealion 6", "Sealion 7", "Han", "Tang", "Tang L",
    "Song Plus", "Song Pro", "Song L", "Yuan Up", "Yuan Plus", "Atto 3",
    "Dolphin", "Dolphin Surf", "Qin Plus", "Qin L", "Destroyer 05", "Yangwang U8", "Yangwang U9", "Other",
  ],
  Yangwang: ["U8", "U9", "U7", "Other"],
  MG: [
    "MG3", "MG4", "MG5", "MG6", "MG7", "ZS", "ZS EV", "HS", "HS PHEV",
    "RX5", "RX8", "One", "Cyberster", "Marvel R", "Mulan", "Other",
  ],
  Chery: [
    "Arrizo 5", "Arrizo 6", "Arrizo 8", "Tiggo 2", "Tiggo 3", "Tiggo 4", "Tiggo 4 Pro",
    "Tiggo 5", "Tiggo 7", "Tiggo 7 Pro", "Tiggo 8", "Tiggo 8 Pro", "Tiggo 8 Pro Max",
    "Tiggo 9", "iCar 03", "Other",
  ],
  Omoda: ["Omoda 5", "Omoda 5 EV", "Omoda 7", "Omoda C5", "Omoda E5", "Other"],
  JAECOO: ["J5", "J6", "J7", "J8", "Other"],
  Exeed: ["TXL", "VX", "LX", "RX", "RX Touring", "AtlantiX", "Other"],
  Geely: [
    "Coolray", "Azkarra", "Tugella", "Monjaro", "Okavango", "Emgrand", "Preface",
    "Geometry C", "Galaxy E5", "Galaxy L7", "Galaxy Starship 7", "Other",
  ],
  Zeekr: ["001", "007", "009", "X", "7X", "Other"],
  "Lynk & Co": ["01", "02", "03", "05", "06", "08", "09", "Z10", "Other"],
  GWM: [
    "Haval Jolion", "Haval H6", "Haval H6 GT", "Haval H9", "Haval Dargo",
    "Tank 300", "Tank 500", "Tank 700", "Poer", "Cannon", "Ora 03", "Ora 07", "Wingle", "Other",
  ],
  Haval: ["Jolion", "Jolion Pro", "H6", "H6 GT", "H9", "Dargo", "Dargo X", "Other"],
  Tank: ["300", "500", "700", "Other"],
  Ora: ["Good Cat", "03", "07", "Lightning Cat", "Other"],
  WEY: ["VV5", "VV6", "VV7", "Coffee 01", "Coffee 02", "Lanshan", "Other"],
  Changan: [
    "Alsvin", "Eado", "CS35", "CS35 Plus", "CS55", "CS55 Plus", "CS75", "CS75 Plus",
    "CS85", "CS95", "UNI-T", "UNI-K", "UNI-V", "UNI-Z", "Hunter", "Deepal S07", "Deepal SL03", "Other",
  ],
  Deepal: ["SL03", "S07", "G318", "Other"],
  Jetour: ["X70", "X70 Plus", "X70 Coupe", "X90", "X90 Plus", "Dashing", "T1", "T2", "T2 i-DM", "Other"],
  GAC: [
    "GS3", "GS3 Emzoom", "GS4", "GS5", "GS8", "GA4", "GA6", "GA8", "Empow", "M8",
    "Aion S", "Aion Y", "Aion V", "Aion Hyper GT", "Trumpchi E8", "Other",
  ],
  Aion: ["S", "Y", "V", "LX", "Hyper GT", "Hyper SSR", "Other"],
  Hongqi: ["H5", "H6", "H7", "H9", "HS5", "HS7", "E-HS9", "E-QM5", "EH7", "Other"],
  BAIC: ["BJ20", "BJ40", "BJ40 Plus", "BJ60", "BJ80", "X35", "X55", "X7", "EU5", "Other"],
  JAC: ["JS3", "JS4", "JS6", "JS8", "T6", "T8", "T9", "Refine", "E10X", "Other"],
  Forthing: ["T5", "T5 EVO", "T5 HE", "Yacht", "Friday", "U-Tour", "Other"],
  Dongfeng: ["AX7", "Shine", "Mage", "Huge", "Boxer", "Rich 6", "Other"],
  Voyah: ["Free", "Dream", "Passion", "Courage", "Other"],
  "Li Auto": ["L6", "L7", "L8", "L9", "MEGA", "i8", "Other"],
  NIO: ["ET5", "ET5 Touring", "ET7", "ES6", "ES7", "ES8", "EC6", "EC7", "ET9", "Other"],
  XPeng: ["P5", "P7", "P7i", "G3", "G6", "G9", "X9", "Mona M03", "Other"],
  Leapmotor: ["T03", "C10", "C11", "C16", "B10", "Other"],
  Seres: ["5", "7", "SF5", "AITO M5", "AITO M7", "AITO M9", "Other"],
  AITO: ["M5", "M7", "M9", "Other"],
  Avatr: ["11", "12", "07", "Other"],
  Maxus: ["D60", "D90", "G10", "G20", "G50", "T60", "T90", "MIFA 9", "eDeliver", "Other"],
  Foton: ["Tunland", "View", "Toano", "Aumark", "Other"],
  FAW: ["Bestune T55", "Bestune T77", "Bestune B70", "Hongqi H5", "Other"],
  Bestune: ["T55", "T77", "T99", "B70", "B70S", "Other"],
  Brilliance: ["V3", "V6", "V7", "Other"],
  Kaiyi: ["X3", "X7", "E5", "Other"],
  Soueast: ["DX3", "DX5", "DX7", "DX8", "Other"],
  SWM: ["G01", "G05", "X7", "Other"],
  Skywell: ["ET5", "BE11", "HT-i", "Other"],
  "King Long": ["Kingo", "Mini Bus", "City Bus", "Other"],
  CNHTC: ["Howo", "Sitrak", "Other"],
  VGV: ["U70", "U70 Pro", "U75 Plus", "Other"],
  Hanteng: ["X5", "X7", "Other"],
  Zotye: ["T600", "T700", "SR9", "Other"],
  Roewe: ["RX5", "RX8", "i5", "i6", "D7", "Other"],
  IM: ["LS6", "LS7", "L6", "L7", "Other"],
  Xiaomi: ["SU7", "SU7 Ultra", "YU7", "Other"],
  Huawei: ["AITO M5", "AITO M7", "AITO M9", "Other"],

  // ── Other / regional ──────────────────────────────────────────────────────
  Mahindra: ["Scorpio", "Scorpio-N", "XUV300", "XUV400", "XUV700", "Thar", "Bolero", "Other"],
  Tata: ["Nexon", "Harrier", "Safari", "Punch", "Tiago", "Other"],
  Proton: ["Saga", "Persona", "X50", "X70", "X90", "Other"],
  Perodua: ["Myvi", "Axia", "Bezza", "Ativa", "Other"],
  Other: ["Other"],
};

/** Sorted make names for dropdowns */
export function listCarMakes(): string[] {
  return Object.keys(DEFAULT_MAKE_MODELS).sort((a, b) => a.localeCompare(b));
}

export function modelsForMake(make: string): string[] {
  return DEFAULT_MAKE_MODELS[make] || [];
}
