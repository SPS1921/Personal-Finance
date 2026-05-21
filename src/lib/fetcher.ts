"use client";
import { useQuery } from "@tanstack/react-query";
import { useStore } from "./store";

export async function fetcher<T = any>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, { ...init, headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) } });
  if (!res.ok) throw new Error(`${res.status}: ${await res.text()}`);
  return res.json();
}

export function useApi<T = any>(url: string) {
  const version = useStore((s) => s.version);
  return useQuery<T>({
    queryKey: [url, version],
    queryFn: () => fetcher<T>(url),
  });
}
