/** Compatibility helpers — prefer `@marketly/core` listingsApi in new code */
export type { Listing, ListingStatus } from "@marketly/core";
export { SEED_LISTINGS, seededListings } from "@marketly/core";
import { listingsApi, type Listing } from "@marketly/core";

export function getListings(all = false): Listing[] {
  const list = listingsApi.getAllListingsSync();
  return all ? list : list.filter((l) => l.status === "approved");
}

/** @deprecated Use getListings() — static seed snapshot for rare sync needs */
export const LISTINGS: Listing[] = listingsApi.getAllListingsSync();
