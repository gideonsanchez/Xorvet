"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type ApiError = { message: string; code?: string; status: number };

export async function apiFetch<T>(url: string, init?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(url, { ...init, headers: { "content-type": "application/json", ...init?.headers } });
  } catch {
    throw { message: "You appear to be offline. Check your connection and try again.", status: 0 } satisfies ApiError;
  }
  const body = await res.json().catch(() => null);
  if (!res.ok) {
    throw {
      message: body?.error?.message ?? "Something went wrong. Please try again.",
      code: body?.error?.code,
      status: res.status,
    } satisfies ApiError;
  }
  return body as T;
}

/** Minimal GET hook with loading, error and reload. Pass null to skip. */
export function useApi<T>(url: string | null, refreshMs?: number) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<ApiError | null>(null);
  const [loading, setLoading] = useState(Boolean(url));
  const seq = useRef(0);

  const load = useCallback(async () => {
    if (!url) return;
    const id = ++seq.current;
    setLoading(true);
    try {
      const result = await apiFetch<T>(url);
      if (id === seq.current) {
        setData(result);
        setError(null);
      }
    } catch (e) {
      if (id === seq.current) setError(e as ApiError);
    } finally {
      if (id === seq.current) setLoading(false);
    }
  }, [url]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch on mount and when the url changes
    void load();
    if (!refreshMs) return;
    const t = setInterval(() => document.visibilityState === "visible" && void load(), refreshMs);
    return () => clearInterval(t);
  }, [load, refreshMs]);

  return { data, error, loading, reload: load };
}
