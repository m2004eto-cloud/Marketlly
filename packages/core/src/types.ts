export type UserRole = "customer" | "dealer" | "admin";

export type SessionUser = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
};

export type ListingStatus = "pending" | "approved" | "rejected";

export type ListingCategory =
  | "motors"
  | "classifieds"
  | "mobiles"
  | "property"
  | "jobs"
  | "furniture"
  | string;

export type Listing = {
  id: number;
  title: string;
  price: number;
  location: string;
  category: ListingCategory;
  make?: string;
  model?: string;
  img: string;
  verified: boolean;
  date: number;
  description: string;
  status: ListingStatus;
  ownerId?: string;
  ownerName?: string;
};

export type ListingFilters = {
  q?: string;
  location?: string;
  category?: string;
  make?: string;
  model?: string;
  status?: ListingStatus | "all";
  includeOwnPending?: boolean;
  userId?: string;
};

export type CmsSnapshot = {
  values: Record<string, string>;
  banners: unknown[];
  design: Record<string, unknown>;
  updatedAt: number;
};

export type CreateListingInput = {
  title: string;
  price: number;
  location: string;
  category: ListingCategory;
  make?: string;
  model?: string;
  img: string;
  description: string;
  ownerId?: string;
  ownerName?: string;
  role?: UserRole;
};
