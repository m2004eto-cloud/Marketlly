import React, { createContext, useContext, useEffect, useState, useCallback } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

export type AuctionStatus = "upcoming" | "live" | "ended-sold" | "ended-unsold";

export type Bid = {
  id: string;
  bidderName: string;
  bidderId: string;
  amount: number;
  timestamp: number;
  isAdmin: boolean;
};

export type Auction = {
  id: string;
  title: string;
  make: string;
  model: string;
  year: number;
  mileage: number;
  color: string;
  condition: "Excellent" | "Good" | "Fair" | "Poor";
  transmission: "Automatic" | "Manual";
  fuelType: "Petrol" | "Diesel" | "Electric" | "Hybrid";
  bodyType: string;
  vin: string;
  description: string;
  images: string[];
  location: string;
  startingPrice: number;
  reservePrice: number;
  minIncrement: number;
  currentBid: number;
  currentBidder: string | null;
  currentBidderId: string | null;
  bids: Bid[];
  startTime: number;
  endTime: number;
  manualEnded: boolean;
  featured: boolean;
  sellerId: string;
  sellerName: string;
  views: number;
  watchers: number;
};

export type NewAuctionDraft = Omit<Auction, "id" | "bids" | "currentBid" | "currentBidder" | "currentBidderId" | "views" | "watchers" | "manualEnded">;

// ─── Status Computation ───────────────────────────────────────────────────────

export function getStatus(a: Auction): AuctionStatus {
  if (a.manualEnded) return a.currentBid >= a.reservePrice ? "ended-sold" : "ended-unsold";
  const now = Date.now();
  if (now < a.startTime) return "upcoming";
  if (now >= a.endTime) return a.currentBid >= a.reservePrice ? "ended-sold" : "ended-unsold";
  return "live";
}

// ─── Countdown Hook ───────────────────────────────────────────────────────────

export function useCountdown(targetMs: number) {
  const [rem, setRem] = useState(() => Math.max(0, targetMs - Date.now()));
  useEffect(() => {
    const tick = () => setRem(Math.max(0, targetMs - Date.now()));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [targetMs]);
  const d = Math.floor(rem / 86_400_000);
  const h = Math.floor((rem % 86_400_000) / 3_600_000);
  const m = Math.floor((rem % 3_600_000) / 60_000);
  const s = Math.floor((rem % 60_000) / 1_000);
  return { days: d, hours: h, minutes: m, seconds: s, isExpired: rem === 0, remaining: rem };
}

// ─── Seed Data ────────────────────────────────────────────────────────────────

const NOW = Date.now();
const MIN = 60_000;
const HOUR = 3_600_000;
const DAY = 86_400_000;

function mkBid(bidderId: string, bidderName: string, amount: number, minsAgo: number, isAdmin = false): Bid {
  return { id: `bid-${Math.random().toString(36).slice(2)}`, bidderName, bidderId, amount, timestamp: NOW - minsAgo * MIN, isAdmin };
}

const SEED: Auction[] = [
  {
    id: "a1",
    title: "2023 Ferrari 488 GTB – GCC Spec",
    make: "Ferrari", model: "488 GTB", year: 2023,
    mileage: 12400, color: "Rosso Corsa", condition: "Excellent",
    transmission: "Automatic", fuelType: "Petrol", bodyType: "Coupe",
    vin: "ZFF79ALJ000242100",
    description: "One of the finest 488 GTBs available in the GCC market. Full Ferrari service history, single owner, never tracked. Pristine condition with all original parts. Comes with full warranty documentation and Ferrari certification. Delivered new through official UAE distributor.",
    images: [
      "https://images.unsplash.com/photo-1592198084033-aade902d1aae?w=1200",
      "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=1200",
      "https://images.unsplash.com/photo-1526726538690-5cbf956ae2fd?w=1200",
    ],
    location: "Dubai",
    startingPrice: 580000, reservePrice: 620000, minIncrement: 5000,
    currentBid: 647000, currentBidder: "Ahmed Al Rashid", currentBidderId: "b1",
    bids: [
      mkBid("b3", "Khalid Al Mazrouei", 580000, 120),
      mkBid("b2", "Mohammed Al Farsi", 590000, 110),
      mkBid("b1", "Ahmed Al Rashid", 600000, 90),
      mkBid("b3", "Khalid Al Mazrouei", 610000, 70),
      mkBid("b5", "Fatima Al Kaabi", 625000, 55),
      mkBid("b1", "Ahmed Al Rashid", 637000, 40),
      mkBid("b2", "Mohammed Al Farsi", 642000, 25),
      mkBid("b1", "Ahmed Al Rashid", 647000, 8),
    ],
    startTime: NOW - 3 * HOUR, endTime: NOW + 47 * MIN,
    manualEnded: false, featured: true,
    sellerId: "s1", sellerName: "Elite Auto Dubai",
    views: 2847, watchers: 142,
  },
  {
    id: "a2",
    title: "2022 Lamborghini Urus – Pearl White",
    make: "Lamborghini", model: "Urus", year: 2022,
    mileage: 28000, color: "Pearl White", condition: "Excellent",
    transmission: "Automatic", fuelType: "Petrol", bodyType: "SUV",
    vin: "ZPBUA1ZL4NLA12567",
    description: "Stunning Lamborghini Urus in Pearl White with full beige interior. GCC specs, service history at Al Tayer Motors. Original warranty transferable. Carbon ceramic brakes, panoramic roof, rear seat entertainment system, and 23-inch Taigete wheels.",
    images: [
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200",
      "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=1200",
    ],
    location: "Abu Dhabi",
    startingPrice: 480000, reservePrice: 520000, minIncrement: 5000,
    currentBid: 532000, currentBidder: "Sara Al Hashimi", currentBidderId: "b4",
    bids: [
      mkBid("b6", "Omar Al Blooshi", 480000, 180),
      mkBid("b4", "Sara Al Hashimi", 490000, 150),
      mkBid("b7", "Hamdan Al Suwaidi", 505000, 120),
      mkBid("b4", "Sara Al Hashimi", 515000, 80),
      mkBid("b6", "Omar Al Blooshi", 522000, 45),
      mkBid("b4", "Sara Al Hashimi", 532000, 15),
    ],
    startTime: NOW - 5 * HOUR, endTime: NOW + 2 * HOUR + 18 * MIN,
    manualEnded: false, featured: true,
    sellerId: "s2", sellerName: "Prestige Motors UAE",
    views: 1923, watchers: 98,
  },
  {
    id: "a3",
    title: "2023 Porsche 911 GT3 RS – Touring Pkg",
    make: "Porsche", model: "911 GT3 RS", year: 2023,
    mileage: 5200, color: "Guards Red", condition: "Excellent",
    transmission: "Automatic", fuelType: "Petrol", bodyType: "Coupe",
    vin: "WP0ZZZ99ZPS270123",
    description: "Rare GT3 RS with the Touring Package — no wing, subtle and sophisticated. Weissach Package with magnesium roof and carbon bonnet. Full cage prepared for track days. Never modified. Under manufacturer warranty until 2027.",
    images: [
      "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=1200",
      "https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=1200",
    ],
    location: "Dubai",
    startingPrice: 680000, reservePrice: 740000, minIncrement: 5000,
    currentBid: 695000, currentBidder: "Khalid Al Mazrouei", currentBidderId: "b3",
    bids: [
      mkBid("b5", "Fatima Al Kaabi", 680000, 300),
      mkBid("b3", "Khalid Al Mazrouei", 695000, 200),
    ],
    startTime: NOW - 1 * HOUR, endTime: NOW + 8 * HOUR,
    manualEnded: false, featured: true,
    sellerId: "s3", sellerName: "Autostrada Premium",
    views: 1456, watchers: 76,
  },
  {
    id: "a4",
    title: "2021 Mercedes-AMG G63 – Designo Edition",
    make: "Mercedes-Benz", model: "AMG G63", year: 2021,
    mileage: 41000, color: "Obsidian Black", condition: "Good",
    transmission: "Automatic", fuelType: "Petrol", bodyType: "SUV",
    vin: "WDC4632731X352198",
    description: "Iconic G63 in Designo Obsidian Black with exclusive AMG night package. Full AGMC service history, four new tyres fitted. Burmester sound system, sunroof, heated and cooled seats. Export-ready.",
    images: [
      "https://images.unsplash.com/photo-1609521263047-f8f205293f24?w=1200",
      "https://images.unsplash.com/photo-1555215695-3004980ad54e?w=1200",
    ],
    location: "Sharjah",
    startingPrice: 320000, reservePrice: 360000, minIncrement: 2000,
    currentBid: 348000, currentBidder: "Omar Al Blooshi", currentBidderId: "b6",
    bids: [
      mkBid("b2", "Mohammed Al Farsi", 320000, 200),
      mkBid("b7", "Hamdan Al Suwaidi", 326000, 170),
      mkBid("b6", "Omar Al Blooshi", 334000, 120),
      mkBid("b2", "Mohammed Al Farsi", 340000, 80),
      mkBid("b6", "Omar Al Blooshi", 348000, 22),
    ],
    startTime: NOW - 6 * HOUR, endTime: NOW + 33 * MIN,
    manualEnded: false, featured: false,
    sellerId: "s1", sellerName: "Elite Auto Dubai",
    views: 3241, watchers: 187,
  },
  {
    id: "a5",
    title: "2023 Rolls-Royce Ghost – Templeside",
    make: "Rolls-Royce", model: "Ghost", year: 2023,
    mileage: 3100, color: "Midnight Sapphire", condition: "Excellent",
    transmission: "Automatic", fuelType: "Petrol", bodyType: "Saloon",
    vin: "SCA664S54PUX12340",
    description: "Near-new Ghost with bespoke Templeside exterior. Shot-peened aluminium panels, Starlight Headliner with 1,340 fibre-optic stars, Shooting Star headlining. One of fewer than 10 in the Middle East.",
    images: [
      "https://images.unsplash.com/photo-1631295868223-63265b40d9e4?w=1200",
      "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=1200",
    ],
    location: "Dubai",
    startingPrice: 1200000, reservePrice: 1350000, minIncrement: 10000,
    currentBid: 1200000, currentBidder: null, currentBidderId: null,
    bids: [],
    startTime: NOW + 2 * HOUR, endTime: NOW + 2 * HOUR + 24 * HOUR,
    manualEnded: false, featured: true,
    sellerId: "s4", sellerName: "Rolls-Royce Motor Cars Dubai",
    views: 892, watchers: 54,
  },
  {
    id: "a6",
    title: "2023 BMW M4 Competition xDrive",
    make: "BMW", model: "M4 Competition", year: 2023,
    mileage: 8900, color: "Frozen Brooklyn Grey", condition: "Excellent",
    transmission: "Automatic", fuelType: "Petrol", bodyType: "Coupe",
    vin: "WBS43AY06PCM12345",
    description: "Low-mileage M4 Competition in the sought-after Frozen Brooklyn Grey. Full M options: carbon ceramic brakes, M Drive Professional, Harman Kardon audio. Single owner, always dealer-serviced.",
    images: [
      "https://images.unsplash.com/photo-1555215695-3004980ad54e?w=1200",
    ],
    location: "Dubai",
    startingPrice: 295000, reservePrice: 330000, minIncrement: 2000,
    currentBid: 295000, currentBidder: null, currentBidderId: null,
    bids: [],
    startTime: NOW + 1 * DAY, endTime: NOW + 2 * DAY,
    manualEnded: false, featured: false,
    sellerId: "s2", sellerName: "Prestige Motors UAE",
    views: 634, watchers: 31,
  },
  {
    id: "a7",
    title: "2022 McLaren 720S Spider",
    make: "McLaren", model: "720S Spider", year: 2022,
    mileage: 19000, color: "Volcano Orange", condition: "Excellent",
    transmission: "Automatic", fuelType: "Petrol", bodyType: "Convertible",
    vin: "SBM14DCH4NW001234",
    description: "Breathtaking 720S Spider in Volcano Orange. Carbon fibre pack, electrochromic roof, MSO Defined options. Full service history at McLaren Dubai. The retractable hardtop deploys in 11 seconds.",
    images: [
      "https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=1200",
    ],
    location: "Dubai",
    startingPrice: 720000, reservePrice: 800000, minIncrement: 5000,
    currentBid: 720000, currentBidder: null, currentBidderId: null,
    bids: [],
    startTime: NOW + 3 * DAY, endTime: NOW + 4 * DAY,
    manualEnded: false, featured: false,
    sellerId: "s5", sellerName: "Gulf Auto Trade",
    views: 421, watchers: 19,
  },
  {
    id: "a8",
    title: "2021 Range Rover Sport SVR",
    make: "Land Rover", model: "Range Rover Sport SVR", year: 2021,
    mileage: 52000, color: "Santorini Black", condition: "Good",
    transmission: "Automatic", fuelType: "Petrol", bodyType: "SUV",
    vin: "SALWA2FE6MA234567",
    description: "Sought-after SVR model with supercharged V8. Full service history, MOT valid. Performance exhaust, panoramic roof, Meridian sound system.",
    images: [
      "https://images.unsplash.com/photo-1511919884226-fd3cad34687c?w=1200",
    ],
    location: "Abu Dhabi",
    startingPrice: 245000, reservePrice: 270000, minIncrement: 2000,
    currentBid: 282000, currentBidder: "Hamdan Al Suwaidi", currentBidderId: "b7",
    bids: [
      mkBid("b1", "Ahmed Al Rashid", 245000, 3 * 24 * 60),
      mkBid("b3", "Khalid Al Mazrouei", 255000, 3 * 24 * 60 - 30),
      mkBid("b7", "Hamdan Al Suwaidi", 265000, 3 * 24 * 60 - 90),
      mkBid("b1", "Ahmed Al Rashid", 272000, 3 * 24 * 60 - 120),
      mkBid("b7", "Hamdan Al Suwaidi", 282000, 3 * 24 * 60 - 150),
    ],
    startTime: NOW - 3 * DAY, endTime: NOW - 1 * DAY,
    manualEnded: false, featured: false,
    sellerId: "s3", sellerName: "Autostrada Premium",
    views: 4102, watchers: 203,
  },
  {
    id: "a9",
    title: "2020 Bentley Continental GT V8",
    make: "Bentley", model: "Continental GT", year: 2020,
    mileage: 37000, color: "Cricket Ball Red", condition: "Good",
    transmission: "Automatic", fuelType: "Petrol", bodyType: "Coupe",
    vin: "SCBCG2ZG2LCO99123",
    description: "The Continental GT V8 offers the perfect balance of performance and luxury. Full Naim audio, Mulliner Driving Specification, rotating display. Reserve not met at auction — relisted at starting price.",
    images: [
      "https://images.unsplash.com/photo-1563720223185-11003d516935?w=1200",
    ],
    location: "Dubai",
    startingPrice: 380000, reservePrice: 430000, minIncrement: 2000,
    currentBid: 398000, currentBidder: "Fatima Al Kaabi", currentBidderId: "b5",
    bids: [
      mkBid("b5", "Fatima Al Kaabi", 380000, 5 * 24 * 60),
      mkBid("b2", "Mohammed Al Farsi", 390000, 5 * 24 * 60 - 60),
      mkBid("b5", "Fatima Al Kaabi", 398000, 5 * 24 * 60 - 120),
    ],
    startTime: NOW - 5 * DAY, endTime: NOW - 2 * DAY,
    manualEnded: false, featured: false,
    sellerId: "s2", sellerName: "Prestige Motors UAE",
    views: 2156, watchers: 89,
  },
  {
    id: "a10",
    title: "2022 Audi RS6 Avant – Nardo Grey",
    make: "Audi", model: "RS6 Avant", year: 2022,
    mileage: 29000, color: "Nardo Grey", condition: "Excellent",
    transmission: "Automatic", fuelType: "Petrol", bodyType: "Estate",
    vin: "WAUZZZ4G9NN045678",
    description: "The ultimate practical supercar — RS6 Avant in the definitive Nardo Grey. Carbon optics, sport exhaust, RS Sport Suspension Plus. Sold above reserve price.",
    images: [
      "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=1200",
    ],
    location: "Dubai",
    startingPrice: 330000, reservePrice: 360000, minIncrement: 2000,
    currentBid: 375000, currentBidder: "Mohammed Al Farsi", currentBidderId: "b2",
    bids: [
      mkBid("b4", "Sara Al Hashimi", 330000, 7 * 24 * 60),
      mkBid("b2", "Mohammed Al Farsi", 345000, 7 * 24 * 60 - 60),
      mkBid("b4", "Sara Al Hashimi", 358000, 7 * 24 * 60 - 120),
      mkBid("b2", "Mohammed Al Farsi", 375000, 7 * 24 * 60 - 180),
    ],
    startTime: NOW - 7 * DAY, endTime: NOW - 4 * DAY,
    manualEnded: false, featured: false,
    sellerId: "s1", sellerName: "Elite Auto Dubai",
    views: 3567, watchers: 178,
  },
];

// ─── Simulated bidders ────────────────────────────────────────────────────────

const SIM_BIDDERS = [
  { id: "b1", name: "Ahmed Al Rashid" },
  { id: "b2", name: "Mohammed Al Farsi" },
  { id: "b3", name: "Khalid Al Mazrouei" },
  { id: "b4", name: "Sara Al Hashimi" },
  { id: "b5", name: "Fatima Al Kaabi" },
  { id: "b6", name: "Omar Al Blooshi" },
  { id: "b7", name: "Hamdan Al Suwaidi" },
];

// ─── Context ──────────────────────────────────────────────────────────────────

type AuctionCtx = {
  auctions: Auction[];
  placeBid: (auctionId: string, amount: number, bidderId: string, bidderName: string, isAdmin?: boolean) => string | null;
  createAuction: (draft: NewAuctionDraft) => string;
  updateAuction: (id: string, patch: Partial<Auction>) => void;
  endAuction: (id: string) => void;
  deleteAuction: (id: string) => void;
};

const Ctx = createContext<AuctionCtx | null>(null);

export function AuctionProvider({ children }: { children: React.ReactNode }) {
  const [auctions, setAuctions] = useState<Auction[]>(SEED);

  // Auto-simulation: occasionally place bids on live auctions
  useEffect(() => {
    const id = setInterval(() => {
      setAuctions((prev) =>
        prev.map((a) => {
          if (getStatus(a) !== "live") return a;
          if (Math.random() > 0.22) return a; // 22% chance each tick
          const others = SIM_BIDDERS.filter((b) => b.id !== a.currentBidderId);
          const bidder = others[Math.floor(Math.random() * others.length)];
          const extraIncrements = Math.floor(Math.random() * 3);
          const newBid = a.currentBid + a.minIncrement * (1 + extraIncrements);
          const bid: Bid = {
            id: `bid-${Date.now()}-${Math.random().toString(36).slice(2)}`,
            bidderName: bidder.name,
            bidderId: bidder.id,
            amount: newBid,
            timestamp: Date.now(),
            isAdmin: false,
          };
          return {
            ...a,
            currentBid: newBid,
            currentBidder: bidder.name,
            currentBidderId: bidder.id,
            bids: [...a.bids, bid],
          };
        })
      );
    }, 18_000); // every 18 seconds
    return () => clearInterval(id);
  }, []);

  const placeBid = useCallback(
    (auctionId: string, amount: number, bidderId: string, bidderName: string, isAdmin = false): string | null => {
      let error: string | null = null;
      setAuctions((prev) =>
        prev.map((a) => {
          if (a.id !== auctionId) return a;
          if (getStatus(a) !== "live") { error = "Auction is not currently live."; return a; }
          const minBid = a.currentBid + a.minIncrement;
          if (amount < minBid) { error = `Minimum bid is AED ${minBid.toLocaleString()}.`; return a; }
          if (a.currentBidderId === bidderId) { error = "You are already the highest bidder."; return a; }
          const bid: Bid = {
            id: `bid-${Date.now()}-${Math.random().toString(36).slice(2)}`,
            bidderName, bidderId, amount, timestamp: Date.now(), isAdmin,
          };
          return {
            ...a,
            currentBid: amount,
            currentBidder: bidderName,
            currentBidderId: bidderId,
            bids: [...a.bids, bid],
          };
        })
      );
      return error;
    },
    []
  );

  const createAuction = useCallback((draft: NewAuctionDraft) => {
    const id = `a-${Date.now()}`;
    const a: Auction = {
      ...draft,
      id,
      bids: [],
      currentBid: draft.startingPrice,
      currentBidder: null,
      currentBidderId: null,
      manualEnded: false,
      views: 0,
      watchers: 0,
    };
    setAuctions((prev) => [a, ...prev]);
    return id;
  }, []);

  const updateAuction = useCallback((id: string, patch: Partial<Auction>) => {
    setAuctions((prev) => prev.map((a) => (a.id === id ? { ...a, ...patch } : a)));
  }, []);

  const endAuction = useCallback((id: string) => {
    setAuctions((prev) => prev.map((a) => (a.id === id ? { ...a, manualEnded: true } : a)));
  }, []);

  const deleteAuction = useCallback((id: string) => {
    setAuctions((prev) => prev.filter((a) => a.id !== id));
  }, []);

  return (
    <Ctx.Provider value={{ auctions, placeBid, createAuction, updateAuction, endAuction, deleteAuction }}>
      {children}
    </Ctx.Provider>
  );
}

export function useAuction() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAuction must be used within AuctionProvider");
  return ctx;
}
