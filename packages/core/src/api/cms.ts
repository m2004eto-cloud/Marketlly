import { ok, withLatency, type ApiResult } from "./client";
import { readJson, writeJson } from "../storage";
import type { CmsSnapshot } from "../types";

const KEY = "marketly_cms_v1";
const listeners = new Set<() => void>();

const EMPTY: CmsSnapshot = {
  values: {},
  banners: [],
  design: {},
  updatedAt: 0,
};

function notify() {
  listeners.forEach((l) => l());
}

export function subscribeCms(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

export function getCmsSync(): CmsSnapshot {
  return readJson<CmsSnapshot>(KEY, EMPTY);
}

export async function getCms(): Promise<ApiResult<CmsSnapshot>> {
  return withLatency(() => ok(getCmsSync()), 0);
}

export async function saveCms(partial: Partial<CmsSnapshot>): Promise<ApiResult<CmsSnapshot>> {
  return withLatency(() => {
    const prev = getCmsSync();
    const next: CmsSnapshot = {
      values: partial.values ?? prev.values,
      banners: partial.banners ?? prev.banners,
      design: partial.design ?? prev.design,
      updatedAt: Date.now(),
    };
    writeJson(KEY, next);
    notify();
    return ok(next);
  }, 0);
}

export function getCmsValue(id: string, fallback: string): string {
  const snap = getCmsSync();
  return snap.values[id] ?? fallback;
}
