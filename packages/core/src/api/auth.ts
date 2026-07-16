import { fail, ok, withLatency, type ApiResult } from "./client";
import { readJson, writeJson } from "../storage";
import {
  BANNED_PERMISSIONS,
  DEFAULT_ADMIN_PERMISSIONS,
  DEFAULT_CUSTOMER_PERMISSIONS,
  DEFAULT_DEALER_PERMISSIONS,
  type AuthAccount,
  type FrontendPermissions,
  type SessionUser,
  type UserRole,
} from "../types";

const SESSION_KEY = "marketly_session_v1";
const ACCOUNTS_KEY = "marketly_accounts_v1";
const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((l) => l());
}

export function subscribeAuth(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
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
      permissions: { ...DEFAULT_DEALER_PERMISSIONS, maxAdsPerMonth: 500 },
      createdAt: "2024-11-20",
    },
    {
      id: "customer-1",
      name: "Sara Khan",
      email: "sara.k@example.com",
      password: "user1234",
      role: "customer",
      banned: false,
      verified: false,
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
      permissions: { ...DEFAULT_CUSTOMER_PERMISSIONS },
      createdAt: "2025-12-01",
    },
  ];
}

function loadAccounts(): AuthAccount[] {
  const stored = readJson<AuthAccount[] | null>(ACCOUNTS_KEY, null);
  if (!stored || !Array.isArray(stored) || stored.length === 0) {
    const seed = defaultAccounts();
    writeJson(ACCOUNTS_KEY, seed);
    return seed;
  }
  return stored;
}

function saveAccounts(accounts: AuthAccount[]) {
  writeJson(ACCOUNTS_KEY, accounts);
  notify();
}

function toSession(account: AuthAccount): SessionUser {
  return {
    id: account.id,
    name: account.name,
    email: account.email,
    role: account.role,
    banned: account.banned,
    verified: account.verified,
    permissions: account.banned ? { ...BANNED_PERMISSIONS } : { ...account.permissions },
  };
}

export function getSessionSync(): SessionUser | null {
  return readJson<SessionUser | null>(SESSION_KEY, null);
}

export async function getSession(): Promise<ApiResult<SessionUser | null>> {
  return withLatency(() => {
    const session = getSessionSync();
    if (!session) return ok(null);
    const account = loadAccounts().find((a) => a.id === session.id || a.email === session.email);
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
    const account = loadAccounts().find((a) => a.email === email);
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
    if (accounts.some((a) => a.email === email)) {
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
      permissions:
        input.role === "dealer"
          ? { ...DEFAULT_DEALER_PERMISSIONS }
          : { ...DEFAULT_CUSTOMER_PERMISSIONS },
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

export function listAccountsSync(): AuthAccount[] {
  return loadAccounts();
}

export async function updateAccountPermissions(
  email: string,
  permissions: FrontendPermissions,
): Promise<ApiResult<AuthAccount>> {
  return withLatency(() => {
    const accounts = loadAccounts();
    const idx = accounts.findIndex((a) => a.email === email.toLowerCase());
    if (idx < 0) return fail("Account not found");
    accounts[idx] = { ...accounts[idx], permissions: { ...permissions } };
    saveAccounts(accounts);
    const session = getSessionSync();
    if (session?.email === accounts[idx].email) {
      writeJson(SESSION_KEY, toSession(accounts[idx]));
      notify();
    }
    return ok(accounts[idx]);
  }, 0);
}

export async function updateAccountFlags(
  email: string,
  flags: Partial<Pick<AuthAccount, "banned" | "verified" | "name">>,
): Promise<ApiResult<AuthAccount>> {
  return withLatency(() => {
    const accounts = loadAccounts();
    const idx = accounts.findIndex((a) => a.email === email.toLowerCase());
    if (idx < 0) return fail("Account not found");
    accounts[idx] = { ...accounts[idx], ...flags };
    if (flags.banned) accounts[idx].permissions = { ...BANNED_PERMISSIONS };
    saveAccounts(accounts);
    const session = getSessionSync();
    if (session?.email === accounts[idx].email) {
      if (accounts[idx].banned) writeJson(SESSION_KEY, null);
      else writeJson(SESSION_KEY, toSession(accounts[idx]));
      notify();
    }
    return ok(accounts[idx]);
  }, 0);
}

export function permissionsForRole(role: UserRole): FrontendPermissions {
  if (role === "admin") return { ...DEFAULT_ADMIN_PERMISSIONS };
  if (role === "dealer") return { ...DEFAULT_DEALER_PERMISSIONS };
  return { ...DEFAULT_CUSTOMER_PERMISSIONS };
}
