import { fail, ok, withLatency, type ApiResult } from "./client";
import { seededListings } from "../mocks/seed";
import { readJson, writeJson } from "../storage";
import type { CreateListingInput, Listing, ListingFilters, ListingStatus } from "../types";

const KEY = "marketly_listings_v2";
const listeners = new Set<() => void>();

function load(): Listing[] {
  const stored = readJson<Listing[] | null>(KEY, null);
  if (!stored || !Array.isArray(stored) || stored.length === 0) {
    const seed = seededListings();
    writeJson(KEY, seed);
    return seed;
  }
  return stored;
}

function save(list: Listing[]) {
  writeJson(KEY, list);
  listeners.forEach((l) => l());
}

export function subscribeListings(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

export async function listListings(filters: ListingFilters = {}): Promise<ApiResult<Listing[]>> {
  return withLatency(() => {
    let list = load();
    const status = filters.status ?? "approved";
    if (status !== "all") {
      list = list.filter((l) => {
        if (l.status === status) return true;
        if (
          filters.includeOwnPending &&
          filters.userId &&
          l.status === "pending" &&
          l.ownerId === filters.userId
        ) {
          return true;
        }
        return false;
      });
    }
    if (filters.category) {
      const c = filters.category.toLowerCase();
      list = list.filter((l) => String(l.category).toLowerCase() === c);
    }
    if (filters.location) {
      const loc = filters.location.toLowerCase();
      list = list.filter((l) => l.location.toLowerCase().includes(loc));
    }
    if (filters.make) {
      const m = filters.make.toLowerCase();
      list = list.filter((l) => (l.make || "").toLowerCase() === m);
    }
    if (filters.model) {
      const m = filters.model.toLowerCase();
      list = list.filter((l) => (l.model || "").toLowerCase().includes(m));
    }
    if (filters.q) {
      const q = filters.q.toLowerCase();
      list = list.filter(
        (l) =>
          l.title.toLowerCase().includes(q) ||
          l.description.toLowerCase().includes(q) ||
          (l.make || "").toLowerCase().includes(q) ||
          (l.model || "").toLowerCase().includes(q),
      );
    }
    return ok(list);
  });
}

export async function getListing(id: number): Promise<ApiResult<Listing>> {
  return withLatency(() => {
    const found = load().find((l) => l.id === id);
    return found ? ok(found) : fail("Listing not found");
  });
}

export async function createListing(input: CreateListingInput): Promise<ApiResult<Listing>> {
  return withLatency(() => {
    const list = load();
    const nextId = Math.max(0, ...list.map((l) => l.id)) + 1;
    const status: ListingStatus =
      input.role === "dealer" || input.role === "admin" ? "approved" : "pending";
    const listing: Listing = {
      id: nextId,
      title: input.title,
      price: input.price,
      location: input.location,
      category: input.category,
      make: input.make,
      model: input.model,
      img: input.img,
      verified: input.role === "dealer" || input.role === "admin" || Boolean(input.featured),
      featured: Boolean(input.featured),
      searchRank: input.searchRank ?? 0,
      date: Date.now(),
      description: input.description,
      status,
      ownerId: input.ownerId,
      ownerName: input.ownerName,
    };
    save([listing, ...list]);
    return ok(listing);
  });
}

export async function updateListingStatus(
  id: number,
  status: ListingStatus,
): Promise<ApiResult<Listing>> {
  return withLatency(() => {
    const list = load();
    const idx = list.findIndex((l) => l.id === id);
    if (idx < 0) return fail("Listing not found");
    list[idx] = { ...list[idx], status };
    save(list);
    return ok(list[idx]);
  });
}

export async function removeListing(id: number): Promise<ApiResult<true>> {
  return withLatency(() => {
    const list = load();
    if (!list.some((l) => l.id === id)) return fail("Listing not found");
    save(list.filter((l) => l.id !== id));
    return ok(true);
  });
}

/** Sync helper for UI that needs all admin listings */
export function getAllListingsSync(): Listing[] {
  return load();
}
