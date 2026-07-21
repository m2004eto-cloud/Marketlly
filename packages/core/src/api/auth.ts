import { fail, ok, withLatency, type ApiResult } from "./client";
import { readJson, writeJson } from "../storage";
import {
  BANNED_PERMISSIONS,
  DEFAULT_ADMIN_PERMISSIONS,
  DEFAULT_CUSTOMER_PERMISSIONS,
  DEFAULT_DEALER_PERMISSIONS,
  type AuthAccount,
  type FrontendPermissions,
  type KycStatus,
  type PublicAccount,
  type SessionUser,
  type UserRole,
} from "../types";

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

function defaultAccounts(): AuthAccount[] {
  return [
    {
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
    },
    {
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
    },
    {
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
      permissions: { ...DEFAULT_DEALER_PERMISSIONS, maxAdsPerMonth: 500 },
      createdAt: "2024-11-20",
    },
    {
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
    },
    {
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
      permissions: { ...DEFAULT_DEALER_PERMISSIONS, maxAdsPerMonth: 200 },
      createdAt: "2025-06-30",
    },
    {
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
    },
    {
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
    },
    {
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
    },
    {
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
    },
  ];
}

/** Merge missing seed accounts and backfill new profile fields on known demos. */
function mergeMissingSeeds(stored: AuthAccount[]): AuthAccount[] {
  const seed = defaultAccounts();
  const seedByEmail = Object.fromEntries(seed.map((s) => [s.email.toLowerCase(), s]));
  let changed = false;

  const merged = stored.map((account) => {
    const demo = seedByEmail[account.email.toLowerCase()];
    if (!demo) return account;
    const next: AuthAccount = {
      ...account,
      phone: account.phone ?? demo.phone,
      location: account.location ?? demo.location,
      notes: account.notes ?? demo.notes,
      kycStatus: account.kycStatus ?? demo.kycStatus,
      ads: account.ads ?? demo.ads,
      lastActive: account.lastActive ?? demo.lastActive,
      tradeLicense: account.tradeLicense ?? demo.tradeLicense,
    };
    if (
      next.phone !== account.phone ||
      next.location !== account.location ||
      next.notes !== account.notes ||
      next.kycStatus !== account.kycStatus ||
      next.ads !== account.ads ||
      next.lastActive !== account.lastActive ||
      next.tradeLicense !== account.tradeLicense
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

function toSession(account: AuthAccount): SessionUser {
  return {
    id: account.id,
    name: account.name,
    email: account.email,
    role: account.role,
    banned: account.banned,
    verified: account.verified,
    permissions: account.banned
      ? { ...BANNED_PERMISSIONS }
      : normalizePermissions(account.role, account.permissions),
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

/** Public signup — customer or dealer only (never admin). */
export async function signup(input: {
  email: string;
  password: string;
  name: string;
  role: "customer" | "dealer";
  tradeLicense?: string;
  vatTrn?: string;
}): Promise<ApiResult<SessionUser>> {
  return withLatency(() => {
    const email = input.email.trim().toLowerCase();
    if (!email || input.password.length < 6) return fail("Invalid credentials");
    if (input.name.trim().length < 2) return fail("Name is required");
    if (input.role === "dealer" && !input.tradeLicense?.trim()) {
      return fail("Trade License Number is required for dealers");
    }
    const accounts = loadAccounts();
    if (accounts.some((a) => a.email.toLowerCase() === email)) {
      return fail("An account with this email already exists. Please sign in.");
    }
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
      phone: undefined,
      location: "UAE",
      notes: input.tradeLicense?.trim() ? `Trade License: ${input.tradeLicense.trim()}` : "",
      kycStatus: defaultKycForRole(input.role, false),
      ads: 0,
      lastActive: new Date().toISOString().slice(0, 10),
      permissions: permissionsForRole(input.role),
      createdAt: new Date().toISOString().slice(0, 10),
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
      lastActive: new Date().toISOString().slice(0, 10),
      permissions: permissionsForRole(input.role),
      createdAt: new Date().toISOString().slice(0, 10),
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
