export type ApiResult<T> = { ok: true; data: T } | { ok: false; error: string };

export function ok<T>(data: T): ApiResult<T> {
  return { ok: true, data };
}

export function fail<T = never>(error: string): ApiResult<T> {
  return { ok: false, error };
}

export async function withLatency<T>(fn: () => T, ms = 40): Promise<T> {
  if (ms > 0) await new Promise((r) => setTimeout(r, ms));
  return fn();
}
