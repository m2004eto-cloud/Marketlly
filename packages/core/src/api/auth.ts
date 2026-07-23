import { fail, ok, withLatency, type ApiResult } from "./client";
import { readJson, writeJson } from "../storage";
import {
  buildSubscription,
  defaultPlanForRole,
  getPlan,
  isPaidPlan,
  planRank,
  refreshSubscriptionStatus,
  renewSubscriptionPeriod,
  SEARCH_RANK_SCORE,
  type BillingCycle,
  type PlanId,
  type UserSubscription,
} from "../plans";
import {
  BANNED_PERMISSIONS,
  DEFAULT_ADMIN_PERMISSIONS,
  DEFAULT_CUSTOMER_PERMISSIONS,
  DEFAULT_DEALER_PERMISSIONS,
  type AuthAccount,
  type DealerKycProfile,
  type FrontendPermissions,
  type KycStatus,
  type LegalAcceptance,
  type PublicAccount,
  type SessionUser,
  type UserRole,
} from "../types";

/** Bump when Terms / Privacy / Seller Policies change materially. */
export const LEGAL_TERMS_VERSION = "2026.07.1";

const SESSION_KEY = "marketly_session_v1";
const ACCOUNTS_KEY = "marketly_accounts_v1";
const listeners = new Set<() => void>();

export type AccountListFilters = {
  role?: UserRole;
  banned?: boolean;
  verified?: boolean;
  q?: string;
};

export type AdminCreateAccountInput = {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  phone?: string;
  tradeLicense?: string;
  location?: string;
  vatTrn?: string;
  planId?: PlanId;
  billingCycle?: BillingCycle;
};

export type AccountProfileUpdate = {
  name?: string;
  email?: string;
  phone?: string;
  location?: string;
  notes?: string;
  kycStatus?: KycStatus;
  tradeLicense?: string;
  vatTrn?: string;
  ads?: number;
  lastActive?: string;
};

function notify() {
  listeners.forEach((l) => l());
}

export function subscribeAuth(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

function toPublicAccount(account: AuthAccount): PublicAccount {
  const { password: _password, ...publicAccount } = account;
  return publicAccount;
}

function emailEq(a: string, b: string) {
  return a.trim().toLowerCase() === b.trim().toLowerCase();
}

function findAccountIndex(accounts: AuthAccount[], email: string) {
  const key = email.trim().toLowerCase();
  return accounts.findIndex((a) => a.email.toLowerCase() === key);
}

function requireAdmin(): ApiResult<true> {
  const session = getSessionSync();
  if (!session || session.role !== "admin" || session.banned) {
    return fail("Unauthorized");
  }
  return ok(true);
}

function withPlan(
  account: Omit<AuthAccount, "subscription" | "permissions"> & {
    permissions?: FrontendPermissions;
    planId: PlanId;
    billingCycle?: BillingCycle;
    periodStart?: string;
  },
): AuthAccount {
  const cycle = account.billingCycle || "monthly";
  const start = account.periodStart || account.createdAt;
  return {
    ...account,
    permissions: permissionsFromPlan(account.role, account.planId, account.permissions),
    subscription: buildSubscription(account.planId, cycle, start, 0),
  };
}

/** Re-apply plan entitlements to every account on a given plan (after admin edits). */
export function syncAccountsForPlan(planId: PlanId): number {
  const accounts = loadAccounts();
  let n = 0;
  for (let i = 0; i < accounts.length; i++) {
    const sub = accounts[i].subscription;
    if (!sub || sub.planId !== planId) continue;
    accounts[i] = {
      ...accounts[i],
      permissions: permissionsFromPlan(accounts[i].role, planId, accounts[i].permissions),
    };
    n++;
    syncSessionForAccount(accounts[i]);
  }
  if (n > 0) saveAccounts(accounts);
  return n;
}

function defaultAccounts(): AuthAccount[] {
  return [
    withPlan({
      id: "admin-1",
      name: "Marketly Admin",
      email: "admin@marketly.ae",
      password: "admin123",
      role: "admin",
      banned: false,
      verified: true,
      phone: "+971 4 000 0000",
      location: "Dubai",
      kycStatus: "verified",
      ads: 0,
      lastActive: "2026-07-16",
      notes: "Platform administrator",
      permissions: { ...DEFAULT_ADMIN_PERMISSIONS },
      createdAt: "2025-01-01",
      planId: "enterprise",
      billingCycle: "annual",
    }),
    withPlan({
      id: "dealer-1",
      name: "Ahmed Al Mansoori",
      email: "ahmed@example.ae",
      password: "dealer123",
      role: "dealer",
      banned: false,
      verified: true,
      tradeLicense: "CN-1234567",
      phone: "+971 50 123 4567",
      location: "Dubai",
      kycStatus: "verified",
      ads: 24,
      lastActive: "2026-07-15",
      notes: "Premium Motors partner. Top seller Q1-Q2 2026.",
      permissions: { ...DEFAULT_DEALER_PERMISSIONS },
      createdAt: "2025-08-12",
      planId: "pro",
      periodStart: "2026-07-15",
    }),
    withPlan({
      id: "dealer-2",
      name: "Premium Motors LLC",
      email: "sales@premiummotors.ae",
      password: "dealer123",
      role: "dealer",
      banned: false,
      verified: true,
      tradeLicense: "CN-7654321",
      phone: "+971 4 321 0987",
      location: "Dubai",
      kycStatus: "verified",
      ads: 87,
      lastActive: "2026-07-16",
      notes: "Enterprise account. Dedicated account manager: Rania.",
      permissions: { ...DEFAULT_DEALER_PERMISSIONS },
      createdAt: "2024-11-20",
      planId: "enterprise",
      billingCycle: "annual",
      periodStart: "2025-11-20",
    }),
    withPlan({
      id: "dealer-3",
      name: "Gulf Auto Trade",
      email: "ops@gulfauto.ae",
      password: "dealer123",
      role: "dealer",
      banned: false,
      verified: false,
      tradeLicense: "CN-9988776",
      phone: "+971 4 111 2233",
      location: "Ajman",
      kycStatus: "pending",
      ads: 12,
      lastActive: "2026-07-12",
      notes: "KYC docs submitted 2026-07-01. Awaiting legal review.",
      permissions: { ...DEFAULT_DEALER_PERMISSIONS },
      createdAt: "2026-03-22",
      planId: "starter",
      periodStart: "2026-07-01",
    }),
    withPlan({
      id: "dealer-4",
      name: "Tech Gadgets Store",
      email: "sales@techgadgets.ae",
      password: "dealer123",
      role: "dealer",
      banned: false,
      verified: true,
      tradeLicense: "CN-5544332",
      phone: "+971 4 555 7777",
      location: "Dubai",
      kycStatus: "verified",
      ads: 44,
      lastActive: "2026-07-15",
      notes: "Electronics specialist. Featured dealer.",
      permissions: { ...DEFAULT_DEALER_PERMISSIONS },
      createdAt: "2025-06-30",
      planId: "pro",
      billingCycle: "annual",
      periodStart: "2025-07-01",
    }),
    withPlan({
      id: "customer-1",
      name: "Sara Khan",
      email: "sara.k@example.com",
      password: "user1234",
      role: "customer",
      banned: false,
      verified: false,
      phone: "+971 55 987 6543",
      location: "Abu Dhabi",
      kycStatus: "pending",
      ads: 3,
      lastActive: "2026-07-10",
      notes: "",
      permissions: { ...DEFAULT_CUSTOMER_PERMISSIONS },
      createdAt: "2026-01-04",
      planId: "free",
      periodStart: "2026-07-04",
    }),
    withPlan({
      id: "customer-2",
      name: "Layla Ibrahim",
      email: "layla@example.ae",
      password: "user1234",
      role: "customer",
      banned: false,
      verified: true,
      phone: "+971 54 654 3210",
      location: "Dubai",
      kycStatus: "verified",
      ads: 6,
      lastActive: "2026-07-14",
      notes: "",
      permissions: { ...DEFAULT_CUSTOMER_PERMISSIONS },
      createdAt: "2025-12-01",
      planId: "starter",
      periodStart: "2026-07-01",
    }),
    withPlan({
      id: "customer-3",
      name: "Omar Hassan",
      email: "omar@example.ae",
      password: "user1234",
      role: "customer",
      banned: true,
      verified: false,
      phone: "+971 52 456 7890",
      location: "Sharjah",
      kycStatus: "none",
      ads: 1,
      lastActive: "2026-04-01",
      notes: "Banned: fraudulent listings. Case #2026-0318.",
      permissions: { ...BANNED_PERMISSIONS },
      createdAt: "2026-02-18",
      planId: "starter",
      periodStart: "2026-02-18",
    }),
    withPlan({
      id: "customer-4",
      name: "Fatima Al Zaabi",
      email: "fatima.z@example.ae",
      password: "user1234",
      role: "customer",
      banned: false,
      verified: true,
      phone: "+971 56 789 0123",
      location: "Abu Dhabi",
      kycStatus: "verified",
      ads: 2,
      lastActive: "2026-07-16",
      notes: "",
      permissions: { ...DEFAULT_CUSTOMER_PERMISSIONS },
      createdAt: "2026-05-14",
      planId: "free",
      periodStart: "2026-07-14",
    }),
  ];
}

/** Merge missing seed accounts and backfill new profile fields on known demos. */
function mergeMissingSeeds(stored: AuthAccount[]): AuthAccount[] {
  const seed = defaultAccounts();
  const seedByEmail = Object.fromEntries(seed.map((s) => [s.email.toLowerCase(), s]));
  let changed = false;

  const merged = stored.map((account) => {
    const demo = seedByEmail[account.email.toLowerCase()];
    let next: AuthAccount = { ...account };
    if (demo) {
      next = {
        ...next,
        phone: next.phone ?? demo.phone,
        location: next.location ?? demo.location,
        notes: next.notes ?? demo.notes,
        kycStatus: next.kycStatus ?? demo.kycStatus,
        ads: next.ads ?? demo.ads,
        lastActive: next.lastActive ?? demo.lastActive,
        tradeLicense: next.tradeLicense ?? demo.tradeLicense,
        subscription: next.subscription ?? demo.subscription,
      };
    }
    if (!next.subscription) {
      const planId = defaultPlanForRole(next.role);
      next = {
        ...next,
        subscription: buildSubscription(planId, "monthly", next.createdAt || new Date().toISOString().slice(0, 10)),
        permissions: permissionsFromPlan(next.role, planId, next.permissions),
      };
      changed = true;
    } else if (
      !("maxPhotosPerAd" in next.permissions) ||
      !("searchRankScore" in next.permissions) ||
      !("canViewAnalytics" in next.permissions)
    ) {
      next = {
        ...next,
        permissions: permissionsFromPlan(next.role, next.subscription.planId, next.permissions),
      };
      changed = true;
    } else {
      next = {
        ...next,
        subscription: refreshSubscriptionStatus(next.subscription),
      };
    }
    if (
      demo &&
      (next.phone !== account.phone ||
        next.location !== account.location ||
        next.notes !== account.notes ||
        next.kycStatus !== account.kycStatus ||
        next.ads !== account.ads ||
        next.lastActive !== account.lastActive ||
        next.tradeLicense !== account.tradeLicense ||
        !account.subscription)
    ) {
      changed = true;
    }
    return next;
  });

  const byEmail = new Set(merged.map((a) => a.email.toLowerCase()));
  const missing = seed.filter((s) => !byEmail.has(s.email.toLowerCase()));
  if (missing.length > 0) {
    changed = true;
    merged.push(...missing);
  }

  if (changed) writeJson(ACCOUNTS_KEY, merged);
  return merged;
}

function loadAccounts(): AuthAccount[] {
  const stored = readJson<AuthAccount[] | null>(ACCOUNTS_KEY, null);
  if (!stored || !Array.isArray(stored) || stored.length === 0) {
    const seed = defaultAccounts();
    writeJson(ACCOUNTS_KEY, seed);
    return seed;
  }
  return mergeMissingSeeds(stored);
}

function saveAccounts(accounts: AuthAccount[]) {
  writeJson(ACCOUNTS_KEY, accounts);
  notify();
}

function syncSessionForAccount(account: AuthAccount) {
  const session = getSessionSync();
  if (!session) return;
  if (session.id !== account.id && !emailEq(session.email, account.email)) return;
  if (account.banned) {
    writeJson(SESSION_KEY, null);
  } else {
    writeJson(SESSION_KEY, toSession(account));
  }
  notify();
}

export function permissionsForRole(role: UserRole): FrontendPermissions {
  if (role === "admin") return { ...DEFAULT_ADMIN_PERMISSIONS };
  if (role === "dealer") return { ...DEFAULT_DEALER_PERMISSIONS };
  return { ...DEFAULT_CUSTOMER_PERMISSIONS };
}

function normalizePermissions(role: UserRole, perms?: Partial<FrontendPermissions>): FrontendPermissions {
  const base = permissionsForRole(role);
  return {
    ...base,
    ...perms,
    canBrowseAuctions: role === "admin" ? true : Boolean(perms?.canBrowseAuctions),
    canBidInAuctions: role === "admin" ? true : Boolean(perms?.canBidInAuctions),
    canPostAuction: role === "admin" ? true : Boolean(perms?.canPostAuction),
  };
}

function ensureSubscription(account: AuthAccount): UserSubscription {
  if (account.subscription) return refreshSubscriptionStatus(account.subscription);
  return buildSubscription(defaultPlanForRole(account.role), "monthly", account.createdAt);
}

/** Map subscription plan Includes → runtime permissions. */
export function permissionsFromPlan(
  role: UserRole,
  planId: PlanId,
  existing?: Partial<FrontendPermissions>,
): FrontendPermissions {
  const plan = getPlan(planId);
  const caps = plan.capabilities;
  const base = normalizePermissions(role, existing);
  const featured = caps.featuredBadge || caps.homepageSlots > 0;
  return {
    ...base,
    maxAdsPerMonth: plan.maxAds,
    maxPhotosPerAd: caps.maxPhotos,
    canFeatureListings: featured || base.canFeatureListings,
    showVerifiedBadge: caps.featuredBadge || base.showVerifiedBadge,
    canViewAnalytics: caps.analytics,
    dedicatedAccountPage: caps.dedicatedAccountPage || caps.brandedDealerPage,
    searchRankScore: SEARCH_RANK_SCORE[caps.searchRank],
    homepageSlots: caps.homepageSlots,
    // Dealers keep bulk tools; Pro+ analytics is plan-gated above
    canBulkManageAds: role === "dealer" ? true : base.canBulkManageAds,
  };
}

function applyPlanPermissions(account: AuthAccount, planId: PlanId): FrontendPermissions {
  if (account.banned) return { ...BANNED_PERMISSIONS };
  return permissionsFromPlan(account.role, planId, account.permissions);
}

function toSession(account: AuthAccount): SessionUser {
  const subscription = ensureSubscription(account);
  const permissions = account.banned
    ? { ...BANNED_PERMISSIONS }
    : applyPlanPermissions({ ...account, subscription }, subscription.planId);
  return {
    id: account.id,
    name: account.name,
    email: account.email,
    role: account.role,
    banned: account.banned,
    verified: account.verified,
    permissions,
    subscription,
  };
}

function defaultKycForRole(role: UserRole, verified: boolean): KycStatus {
  if (verified) return "verified";
  if (role === "dealer") return "pending";
  return "none";
}

export function getSessionSync(): SessionUser | null {
  return readJson<SessionUser | null>(SESSION_KEY, null);
}

export async function getSession(): Promise<ApiResult<SessionUser | null>> {
  return withLatency(() => {
    const session = getSessionSync();
    if (!session) return ok(null);
    const account = loadAccounts().find(
      (a) => a.id === session.id || emailEq(a.email, session.email),
    );
    if (!account) {
      writeJson(SESSION_KEY, null);
      return ok(null);
    }
    if (account.banned) {
      writeJson(SESSION_KEY, null);
      return ok(null);
    }
    const fresh = toSession(account);
    writeJson(SESSION_KEY, fresh);
    return ok(fresh);
  }, 0);
}

/** Sign-in: role and permissions come from the stored account — not from the client. */
export async function login(input: {
  email: string;
  password: string;
}): Promise<ApiResult<SessionUser>> {
  return withLatency(() => {
    const email = input.email.trim().toLowerCase();
    const account = loadAccounts().find((a) => a.email.toLowerCase() === email);
    if (!account || account.password !== input.password) {
      return fail("Invalid email or password");
    }
    if (account.banned) {
      return fail("This account has been suspended. Contact support.");
    }
    const session = toSession(account);
    writeJson(SESSION_KEY, session);
    notify();
    return ok(session);
  });
}

export type SignupKycInput = Omit<DealerKycProfile, "submittedAt" | "declaredAccurate"> & {
  declaredAccurate: boolean;
};

/** Public signup — customer or dealer only (never admin). Requires a subscription plan. */
export async function signup(input: {
  email: string;
  password: string;
  name: string;
  role: "customer" | "dealer";
  planId: PlanId;
  billingCycle?: BillingCycle;
  /** Mandatory for all roles */
  acceptTerms: boolean;
  acceptPrivacy: boolean;
  /** Mandatory for dealers */
  acceptSellerPolicies?: boolean;
  marketingConsent?: boolean;
  /** Full KYC required for dealers */
  kyc?: SignupKycInput;
  /** @deprecated prefer kyc.tradeLicenseNumber */
  tradeLicense?: string;
  /** @deprecated prefer kyc.vatTrn */
  vatTrn?: string;
}): Promise<ApiResult<SessionUser>> {
  return withLatency(() => {
    const email = input.email.trim().toLowerCase();
    if (!email || input.password.length < 6) return fail("Invalid credentials");
    if (input.name.trim().length < 2) return fail("Name is required");
    if (!input.planId || !getPlan(input.planId)) return fail("Please select a subscription plan");
    if (!input.acceptTerms || !input.acceptPrivacy) {
      return fail("You must accept the Terms & Conditions and Privacy Policy to create an account");
    }

    let kycProfile: DealerKycProfile | undefined;
    let tradeLicense: string | undefined;
    let vatTrn: string | undefined;
    let phone: string | undefined;
    let location = "UAE";

    if (input.role === "dealer") {
      if (!input.acceptSellerPolicies) {
        return fail("Dealers must accept the Seller Policies & KYC Procedures");
      }
      const k = input.kyc;
      if (!k) return fail("Dealer KYC form is required");
      const required: Array<[keyof SignupKycInput, string]> = [
        ["companyLegalName", "Company legal name"],
        ["tradeName", "Trade name"],
        ["tradeLicenseNumber", "Trade licence number"],
        ["licenseIssuingAuthority", "Licence issuing authority"],
        ["licenseExpiry", "Licence expiry date"],
        ["authorizedSignatoryName", "Authorised signatory name"],
        ["emiratesIdOrPassport", "Emirates ID or passport number"],
        ["phone", "UAE mobile number"],
        ["businessEmirate", "Business emirate"],
        ["businessAddress", "Business address"],
      ];
      for (const [key, label] of required) {
        const val = String(k[key] ?? "").trim();
        if (!val) return fail(`${label} is required`);
      }
      if (!k.tradeLicenseDocument?.dataUrl || !k.tradeLicenseDocument.fileName) {
        return fail("Please upload a copy of your Trade Licence (PDF or image)");
      }
      if (!k.declaredAccurate) {
        return fail("You must declare that KYC information is true and accurate");
      }
      const trn = (k.vatTrn || "").trim();
      if (trn && !/^\d{15}$/.test(trn)) {
        return fail("VAT TRN must be exactly 15 digits when provided");
      }
      const expiry = k.licenseExpiry.trim();
      if (expiry && expiry < new Date().toISOString().slice(0, 10)) {
        return fail("Trade licence appears expired — renew before registering as a Dealer");
      }
      const todayIso = new Date().toISOString();
      kycProfile = {
        companyLegalName: k.companyLegalName.trim(),
        tradeName: k.tradeName.trim(),
        tradeLicenseNumber: k.tradeLicenseNumber.trim(),
        tradeLicenseDocument: {
          fileName: k.tradeLicenseDocument.fileName.trim(),
          mimeType: k.tradeLicenseDocument.mimeType || "application/octet-stream",
          dataUrl: k.tradeLicenseDocument.dataUrl,
          uploadedAt: k.tradeLicenseDocument.uploadedAt || todayIso,
        },
        licenseIssuingAuthority: k.licenseIssuingAuthority.trim(),
        licenseExpiry: expiry,
        vatTrn: trn || undefined,
        authorizedSignatoryName: k.authorizedSignatoryName.trim(),
        emiratesIdOrPassport: k.emiratesIdOrPassport.trim(),
        phone: k.phone.trim(),
        businessEmirate: k.businessEmirate.trim(),
        businessAddress: k.businessAddress.trim(),
        declaredAccurate: true,
        submittedAt: todayIso,
      };
      tradeLicense = kycProfile.tradeLicenseNumber;
      vatTrn = kycProfile.vatTrn;
      phone = kycProfile.phone;
      location = kycProfile.businessEmirate;
    }

    const accounts = loadAccounts();
    if (accounts.some((a) => a.email.toLowerCase() === email)) {
      return fail("An account with this email already exists. Please sign in.");
    }
    const today = new Date().toISOString().slice(0, 10);
    const nowIso = new Date().toISOString();
    const cycle = input.billingCycle || "monthly";
    const permissions = permissionsFromPlan(input.role, input.planId);
    const legalAcceptance: LegalAcceptance = {
      termsVersion: LEGAL_TERMS_VERSION,
      termsAcceptedAt: nowIso,
      privacyAcceptedAt: nowIso,
      sellerPoliciesAcceptedAt: input.role === "dealer" ? nowIso : undefined,
      marketingConsent: Boolean(input.marketingConsent),
    };
    const account: AuthAccount = {
      id: `${input.role}-${Date.now()}`,
      name: input.name.trim(),
      email,
      password: input.password,
      role: input.role,
      banned: false,
      verified: false,
      tradeLicense,
      vatTrn,
      phone,
      location,
      notes: tradeLicense ? `Trade License: ${tradeLicense}` : "",
      kycStatus: input.role === "dealer" ? "pending" : "none",
      kyc: kycProfile,
      legalAcceptance,
      ads: 0,
      lastActive: today,
      permissions,
      subscription: buildSubscription(input.planId, cycle, today, 0),
      createdAt: today,
    };
    saveAccounts([account, ...accounts]);
    const session = toSession(account);
    writeJson(SESSION_KEY, session);
    notify();
    return ok(session);
  });
}

export async function logout(): Promise<ApiResult<true>> {
  return withLatency(() => {
    writeJson(SESSION_KEY, null);
    notify();
    return ok(true);
  }, 0);
}

/** Safe list — passwords stripped. */
export function listAccountsSync(filters?: AccountListFilters): PublicAccount[] {
  let list = loadAccounts().map(toPublicAccount);
  if (filters?.role) list = list.filter((a) => a.role === filters.role);
  if (typeof filters?.banned === "boolean") list = list.filter((a) => a.banned === filters.banned);
  if (typeof filters?.verified === "boolean") list = list.filter((a) => a.verified === filters.verified);
  if (filters?.q?.trim()) {
    const q = filters.q.trim().toLowerCase();
    list = list.filter(
      (a) =>
        a.name.toLowerCase().includes(q) ||
        a.email.toLowerCase().includes(q) ||
        (a.phone || "").toLowerCase().includes(q),
    );
  }
  return list;
}

export async function listAccounts(
  filters?: AccountListFilters,
): Promise<ApiResult<PublicAccount[]>> {
  return withLatency(() => ok(listAccountsSync(filters)), 0);
}

export function getAccountByEmailSync(email: string): PublicAccount | null {
  const account = loadAccounts().find((a) => emailEq(a.email, email));
  return account ? toPublicAccount(account) : null;
}

/** Admin create — does not auto-login the new account. */
export async function adminCreateAccount(
  input: AdminCreateAccountInput,
): Promise<ApiResult<PublicAccount>> {
  return withLatency(() => {
    const authz = requireAdmin();
    if (!authz.ok) return authz;

    const email = input.email.trim().toLowerCase();
    if (!email || input.password.length < 6) return fail("Invalid credentials");
    if (input.name.trim().length < 2) return fail("Name is required");
    if (input.role === "dealer" && !input.tradeLicense?.trim()) {
      return fail("Trade License Number is required for dealers");
    }

    const accounts = loadAccounts();
    if (accounts.some((a) => a.email.toLowerCase() === email)) {
      return fail("An account with this email already exists.");
    }

    const today = new Date().toISOString().slice(0, 10);
    const planId = input.planId || defaultPlanForRole(input.role);
    const account: AuthAccount = {
      id: `${input.role}-${Date.now()}`,
      name: input.name.trim(),
      email,
      password: input.password,
      role: input.role,
      banned: false,
      verified: false,
      tradeLicense: input.tradeLicense?.trim(),
      vatTrn: input.vatTrn?.trim(),
      phone: input.phone?.trim() || undefined,
      location: input.location?.trim() || "UAE",
      notes: "",
      kycStatus: defaultKycForRole(input.role, false),
      ads: 0,
      lastActive: today,
      permissions: permissionsFromPlan(input.role, planId),
      subscription: buildSubscription(planId, input.billingCycle || "monthly", today, 0),
      createdAt: today,
    };
    saveAccounts([account, ...accounts]);
    return ok(toPublicAccount(account));
  }, 0);
}

export async function deleteAccount(email: string): Promise<ApiResult<true>> {
  return withLatency(() => {
    const authz = requireAdmin();
    if (!authz.ok) return authz;

    const accounts = loadAccounts();
    const idx = findAccountIndex(accounts, email);
    if (idx < 0) return fail("Account not found");

    const target = accounts[idx];
    const session = getSessionSync();
    if (session && (session.id === target.id || emailEq(session.email, target.email))) {
      return fail("You cannot delete your own account while signed in.");
    }
    if (target.role === "admin") {
      const adminCount = accounts.filter((a) => a.role === "admin").length;
      if (adminCount <= 1) return fail("Cannot delete the last admin account.");
    }

    const next = accounts.filter((_, i) => i !== idx);
    saveAccounts(next);
    return ok(true);
  }, 0);
}

export async function updateAccountProfile(
  email: string,
  patch: AccountProfileUpdate,
): Promise<ApiResult<PublicAccount>> {
  return withLatency(() => {
    const authz = requireAdmin();
    if (!authz.ok) return authz;

    const accounts = loadAccounts();
    const idx = findAccountIndex(accounts, email);
    if (idx < 0) return fail("Account not found");

    let nextEmail = accounts[idx].email;
    if (patch.email !== undefined) {
      const normalized = patch.email.trim().toLowerCase();
      if (!normalized) return fail("Email is required");
      if (
        accounts.some(
          (a, i) => i !== idx && a.email.toLowerCase() === normalized,
        )
      ) {
        return fail("An account with this email already exists.");
      }
      nextEmail = normalized;
    }

    const updated: AuthAccount = {
      ...accounts[idx],
      email: nextEmail,
      name: patch.name !== undefined ? patch.name.trim() : accounts[idx].name,
      phone: patch.phone !== undefined ? patch.phone.trim() : accounts[idx].phone,
      location: patch.location !== undefined ? patch.location.trim() : accounts[idx].location,
      notes: patch.notes !== undefined ? patch.notes : accounts[idx].notes,
      kycStatus: patch.kycStatus !== undefined ? patch.kycStatus : accounts[idx].kycStatus,
      tradeLicense:
        patch.tradeLicense !== undefined
          ? patch.tradeLicense.trim() || undefined
          : accounts[idx].tradeLicense,
      vatTrn:
        patch.vatTrn !== undefined ? patch.vatTrn.trim() || undefined : accounts[idx].vatTrn,
      ads: patch.ads !== undefined ? patch.ads : accounts[idx].ads,
      lastActive:
        patch.lastActive !== undefined ? patch.lastActive : accounts[idx].lastActive,
    };

    accounts[idx] = updated;
    saveAccounts(accounts);
    syncSessionForAccount(updated);
    return ok(toPublicAccount(updated));
  }, 0);
}

export async function updateAccountRole(
  email: string,
  role: UserRole,
): Promise<ApiResult<PublicAccount>> {
  return withLatency(() => {
    const authz = requireAdmin();
    if (!authz.ok) return authz;

    const accounts = loadAccounts();
    const idx = findAccountIndex(accounts, email);
    if (idx < 0) return fail("Account not found");

    const target = accounts[idx];
    if (target.role === "admin" && role !== "admin") {
      const adminCount = accounts.filter((a) => a.role === "admin").length;
      if (adminCount <= 1) return fail("Cannot demote the last admin account.");
    }

    const session = getSessionSync();
    if (
      session &&
      (session.id === target.id || emailEq(session.email, target.email)) &&
      role !== "admin"
    ) {
      return fail("You cannot demote your own admin account while signed in.");
    }

    const updated: AuthAccount = {
      ...target,
      role,
      permissions: target.banned
        ? { ...BANNED_PERMISSIONS }
        : permissionsForRole(role),
      kycStatus: target.kycStatus || defaultKycForRole(role, target.verified),
    };
    accounts[idx] = updated;
    saveAccounts(accounts);
    syncSessionForAccount(updated);
    return ok(toPublicAccount(updated));
  }, 0);
}

export async function setPassword(
  email: string,
  newPassword: string,
): Promise<ApiResult<true>> {
  return withLatency(() => {
    const authz = requireAdmin();
    if (!authz.ok) return authz;
    if (newPassword.length < 6) return fail("Password must be at least 6 characters");

    const accounts = loadAccounts();
    const idx = findAccountIndex(accounts, email);
    if (idx < 0) return fail("Account not found");

    accounts[idx] = { ...accounts[idx], password: newPassword };
    saveAccounts(accounts);
    return ok(true);
  }, 0);
}

export async function updateAccountPermissions(
  email: string,
  permissions: FrontendPermissions,
): Promise<ApiResult<PublicAccount>> {
  return withLatency(() => {
    const authz = requireAdmin();
    if (!authz.ok) return authz;

    const accounts = loadAccounts();
    const idx = findAccountIndex(accounts, email);
    if (idx < 0) return fail("Account not found");
    accounts[idx] = { ...accounts[idx], permissions: { ...permissions } };
    saveAccounts(accounts);
    syncSessionForAccount(accounts[idx]);
    return ok(toPublicAccount(accounts[idx]));
  }, 0);
}

export async function updateAccountFlags(
  email: string,
  flags: Partial<Pick<AuthAccount, "banned" | "verified" | "name">>,
): Promise<ApiResult<PublicAccount>> {
  return withLatency(() => {
    const authz = requireAdmin();
    if (!authz.ok) return authz;

    const accounts = loadAccounts();
    const idx = findAccountIndex(accounts, email);
    if (idx < 0) return fail("Account not found");

    const prev = accounts[idx];
    const updated: AuthAccount = { ...prev, ...flags };

    if (flags.banned === true) {
      updated.permissions = { ...BANNED_PERMISSIONS };
    } else if (flags.banned === false) {
      // Restore role defaults if account was still on banned permissions
      const wasBannedPerms =
        prev.permissions.maxAdsPerMonth === 0 &&
        !prev.permissions.canBrowseMotors &&
        !prev.permissions.canPostAds;
      if (wasBannedPerms) {
        updated.permissions = permissionsForRole(updated.role);
      }
    }

    if (flags.verified === true && (!updated.kycStatus || updated.kycStatus === "pending" || updated.kycStatus === "none")) {
      updated.kycStatus = "verified";
    } else if (flags.verified === false && updated.kycStatus === "verified") {
      updated.kycStatus = defaultKycForRole(updated.role, false);
    }

    accounts[idx] = updated;
    saveAccounts(accounts);
    syncSessionForAccount(updated);
    return ok(toPublicAccount(updated));
  }, 0);
}

export type AdQuota = {
  planId: PlanId;
  planName: string;
  maxAds: number;
  used: number;
  remaining: number;
  periodStart: string;
  periodEnd: string;
  status: UserSubscription["status"];
  canPost: boolean;
  canRenew: boolean;
};

function resolveAccountSubscription(account: AuthAccount): UserSubscription {
  return refreshSubscriptionStatus(ensureSubscription(account));
}

export function getAdQuotaSync(userIdOrEmail?: string): AdQuota | null {
  const session = getSessionSync();
  const key = userIdOrEmail || session?.email || session?.id;
  if (!key) return null;
  const account = loadAccounts().find(
    (a) => a.id === key || emailEq(a.email, key),
  );
  if (!account) return null;
  const sub = resolveAccountSubscription(account);
  const plan = getPlan(sub.planId);
  const used = sub.adsUsedThisPeriod;
  const remaining = Math.max(0, plan.maxAds - used);
  const active = sub.status === "active";
  return {
    planId: sub.planId,
    planName: plan.name,
    maxAds: plan.maxAds,
    used,
    remaining,
    periodStart: sub.periodStart,
    periodEnd: sub.periodEnd,
    status: sub.status,
    canPost: active && remaining > 0 && !account.banned,
    canRenew: isPaidPlan(sub.planId),
  };
}

/** Upgrade to a higher plan. Resets the billing window from today. */
export async function upgradeSubscription(input: {
  planId: PlanId;
  billingCycle?: BillingCycle;
}): Promise<ApiResult<SessionUser>> {
  return withLatency(() => {
    const session = getSessionSync();
    if (!session) return fail("Sign in required");
    if (session.role === "admin") return fail("Admin accounts do not need a subscription upgrade");

    const accounts = loadAccounts();
    const idx = findAccountIndex(accounts, session.email);
    if (idx < 0) return fail("Account not found");

    const current = resolveAccountSubscription(accounts[idx]);
    if (planRank(input.planId) < planRank(current.planId)) {
      return fail("Choose a higher plan to upgrade, or renew your current plan.");
    }
    if (input.planId === current.planId && current.status === "active") {
      return fail("You are already on this plan. Use Renew to extend the period.");
    }

    const today = new Date().toISOString().slice(0, 10);
    const cycle = input.billingCycle || current.billingCycle || "monthly";
    const updated: AuthAccount = {
      ...accounts[idx],
      subscription: buildSubscription(input.planId, cycle, today, 0),
      permissions: permissionsFromPlan(accounts[idx].role, input.planId, accounts[idx].permissions),
    };
    accounts[idx] = updated;
    saveAccounts(accounts);
    const nextSession = toSession(updated);
    writeJson(SESSION_KEY, nextSession);
    notify();
    return ok(nextSession);
  }, 0);
}

/**
 * Renew the current paid plan (allowed mid-period).
 * Resets the window from the renew date and clears ad usage.
 * Free plan cannot be renewed — upgrade instead.
 */
export async function renewSubscription(
  billingCycle?: BillingCycle,
): Promise<ApiResult<SessionUser>> {
  return withLatency(() => {
    const session = getSessionSync();
    if (!session) return fail("Sign in required");

    const accounts = loadAccounts();
    const idx = findAccountIndex(accounts, session.email);
    if (idx < 0) return fail("Account not found");

    const current = resolveAccountSubscription(accounts[idx]);
    if (!isPaidPlan(current.planId)) {
      return fail("Free plan cannot be renewed. Please upgrade to a paid plan.");
    }

    const today = new Date().toISOString().slice(0, 10);
    const nextSub = renewSubscriptionPeriod(
      {
        ...current,
        billingCycle: billingCycle || current.billingCycle,
      },
      today,
    );
    const updated: AuthAccount = {
      ...accounts[idx],
      subscription: nextSub,
      permissions: permissionsFromPlan(accounts[idx].role, nextSub.planId, accounts[idx].permissions),
    };
    accounts[idx] = updated;
    saveAccounts(accounts);
    const nextSession = toSession(updated);
    writeJson(SESSION_KEY, nextSession);
    notify();
    return ok(nextSession);
  }, 0);
}

/** Consume one ad slot for the current period after a successful listing create. */
export function recordAdPostedSync(userIdOrEmail?: string): ApiResult<AdQuota> {
  const session = getSessionSync();
  const key = userIdOrEmail || session?.email || session?.id;
  if (!key) return fail("Sign in required");
  const accounts = loadAccounts();
  const idx = accounts.findIndex((a) => a.id === key || emailEq(a.email, key));
  if (idx < 0) return fail("Account not found");

  const sub = resolveAccountSubscription(accounts[idx]);
  if (sub.status !== "active") {
    return fail("Your plan period has expired. Renew or upgrade to continue posting.");
  }
  const plan = getPlan(sub.planId);
  if (sub.adsUsedThisPeriod >= plan.maxAds) {
    return fail("You have reached your plan’s ad limit. Upgrade or renew to post more ads.");
  }

  const updated: AuthAccount = {
    ...accounts[idx],
    ads: (accounts[idx].ads || 0) + 1,
    subscription: {
      ...sub,
      adsUsedThisPeriod: sub.adsUsedThisPeriod + 1,
    },
  };
  accounts[idx] = updated;
  saveAccounts(accounts);
  if (session && (session.id === updated.id || emailEq(session.email, updated.email))) {
    writeJson(SESSION_KEY, toSession(updated));
    notify();
  }
  return ok(getAdQuotaSync(updated.email)!);
}

export function canPostAdSync(userIdOrEmail?: string): ApiResult<true> {
  const quota = getAdQuotaSync(userIdOrEmail);
  if (!quota) return fail("Sign in required");
  if (quota.status !== "active") {
    return fail("Your plan period has expired. Renew or upgrade to continue posting.");
  }
  if (!quota.canPost) {
    return fail("You have reached your plan’s ad limit. Upgrade or renew to post more ads.");
  }
  return ok(true);
}

