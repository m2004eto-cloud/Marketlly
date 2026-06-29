import { useCallback, useEffect, useState } from "react";

export function useHashRoute() {
  const parse = () => {
    const raw = typeof window === "undefined" ? "" : window.location.hash.replace(/^#/, "");
    const [path, query = ""] = raw.split("?");
    const params: Record<string, string> = {};
    new URLSearchParams(query).forEach((v, k) => (params[k] = v));
    return { path: path || "landing", params };
  };
  const [route, setRoute] = useState(parse);
  useEffect(() => {
    const on = () => setRoute(parse());
    window.addEventListener("hashchange", on);
    window.addEventListener("popstate", on);
    return () => {
      window.removeEventListener("hashchange", on);
      window.removeEventListener("popstate", on);
    };
  }, []);
  const navigate = useCallback((path: string, params: Record<string, string> = {}) => {
    const qs = new URLSearchParams(params).toString();
    const hash = qs ? `#${path}?${qs}` : `#${path}`;
    if (window.location.hash !== hash) window.location.hash = hash;
  }, []);
  return { route, navigate };
}

export function useLocalStorage<T>(key: string, fallback: T): [T, (v: T | ((p: T) => T)) => void] {
  const [value, setValue] = useState<T>(() => {
    try {
      const raw = localStorage.getItem(key);
      return raw ? (JSON.parse(raw) as T) : fallback;
    } catch {
      return fallback;
    }
  });
  useEffect(() => {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* ignore */ }
  }, [key, value]);
  return [value, setValue];
}

export function useRecentlyViewed(max = 8) {
  const [ids, setIds] = useLocalStorage<number[]>("marketly_recent_v1", []);
  const push = useCallback((id: number) => {
    setIds((prev) => [id, ...prev.filter((x) => x !== id)].slice(0, max));
  }, [max, setIds]);
  const clear = useCallback(() => setIds([]), [setIds]);
  return { ids, push, clear };
}
