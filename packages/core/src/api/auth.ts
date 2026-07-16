import { fail, ok, withLatency, type ApiResult } from "./client";
import { readJson, writeJson } from "../storage";
import type { SessionUser, UserRole } from "../types";

const KEY = "marketly_session_v1";
const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((l) => l());
}

export function subscribeAuth(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

export function getSessionSync(): SessionUser | null {
  return readJson<SessionUser | null>(KEY, null);
}

export async function getSession(): Promise<ApiResult<SessionUser | null>> {
  return withLatency(() => ok(getSessionSync()), 0);
}

export async function login(input: {
  email: string;
  password: string;
  name?: string;
  role: UserRole;
}): Promise<ApiResult<SessionUser>> {
  return withLatency(() => {
    if (!input.email?.trim() || !input.password || input.password.length < 6) {
      return fail("Invalid credentials");
    }
    const fallback = input.email.split("@")[0] || "Guest";
    const display = (input.name || fallback).trim();
    const user: SessionUser = {
      id: `user-${input.email.toLowerCase()}`,
      email: input.email.trim().toLowerCase(),
      name: display.charAt(0).toUpperCase() + display.slice(1),
      role: input.role,
    };
    writeJson(KEY, user);
    notify();
    return ok(user);
  });
}

export async function logout(): Promise<ApiResult<true>> {
  return withLatency(() => {
    writeJson(KEY, null);
    notify();
    return ok(true);
  }, 0);
}
