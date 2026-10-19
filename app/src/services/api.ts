import type { Fares, Lines, RouteLeg, Stations } from "@/types";

export const API_BASE = import.meta.env.VITE_API_BASE || "https://api.wmatafares.com";

const fetchJSON = async <T>(path: string, signal?: AbortSignal): Promise<T> => {
  const res = await fetch(`${API_BASE}${path}`, { signal });
  if (!res.ok) throw new Error(`HTTP error ${res.status} on ${path}`);
  return res.json() as Promise<T>;
};

export const fetchStations = (signal?: AbortSignal) => fetchJSON<Stations>("/stations", signal);
export const fetchLines = (signal?: AbortSignal) => fetchJSON<Lines>("/lines", signal);
export const fetchFares = (code: string, signal?: AbortSignal) =>
  fetchJSON<Fares>(`/fares/${encodeURIComponent(code)}`, signal);
export const fetchRoute = (from: string, to: string, signal?: AbortSignal) =>
  fetchJSON<RouteLeg[]>(`/route/${encodeURIComponent(from)}/${encodeURIComponent(to)}`, signal);
