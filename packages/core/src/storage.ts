export type StorageAdapter = {
  getItem(key: string): string | null | Promise<string | null>;
  setItem(key: string, value: string): void | Promise<void>;
  removeItem(key: string): void | Promise<void>;
};

let adapter: StorageAdapter = {
  getItem(key) {
    if (typeof localStorage === "undefined") return null;
    return localStorage.getItem(key);
  },
  setItem(key, value) {
    if (typeof localStorage === "undefined") return;
    localStorage.setItem(key, value);
  },
  removeItem(key) {
    if (typeof localStorage === "undefined") return;
    localStorage.removeItem(key);
  },
};

export function setStorageAdapter(next: StorageAdapter) {
  adapter = next;
}

export function getStorage(): StorageAdapter {
  return adapter;
}

export function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = adapter.getItem(key);
    if (raw == null || typeof raw !== "string") return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function writeJson(key: string, value: unknown) {
  adapter.setItem(key, JSON.stringify(value));
}
