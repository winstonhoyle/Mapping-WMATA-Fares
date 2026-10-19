import { useEffect, useState } from "react";
import { fetchFares, fetchLines, fetchRoute, fetchStations } from "@/services/api";
import type { Lines, Station } from "@/types";

const message = (err: unknown) =>
  err instanceof Error && err.name === "AbortError" ? null : "Couldn't load Metro data. Try again.";

export const useMetroData = () => {
  const [stations, setStations] = useState<Station[]>([]);
  const [lines, setLines] = useState<Lines | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    Promise.all([fetchStations(controller.signal), fetchLines(controller.signal)])
      .then(([s, l]) => {
        setStations(
          [...s.features].sort((a, b) => a.properties.Name.localeCompare(b.properties.Name)),
        );
        setLines(l);
      })
      .catch((err) => setError(message(err)));
    return () => controller.abort();
  }, []);

  return { stations, lines, error };
};

type Result<T> = { key: string; data: T | null; error: string | null };

/** Loads by key (nothing for ""); `load` must be stable, like the api functions. */
const useLoad = <T>(key: string, load: (key: string, signal: AbortSignal) => Promise<T>) => {
  const [result, setResult] = useState<Result<T> | null>(null);

  useEffect(() => {
    if (!key) return;
    const controller = new AbortController();
    load(key, controller.signal)
      .then((data) => setResult({ key, data, error: null }))
      .catch((err) => {
        const error = message(err);
        if (error) setResult({ key, data: null, error });
      });
    return () => controller.abort();
  }, [key, load]);

  const current = key && result?.key === key ? result : null;
  return {
    // The last result stays up while the next one loads, so the map doesn't flash between.
    data: key ? (result?.data ?? null) : null,
    loading: Boolean(key) && !current,
    error: current?.error ?? null,
  };
};

export const useFares = (origin: string) => {
  const { data, ...rest } = useLoad(origin, fetchFares);
  return { fares: data, ...rest };
};

const routeByKey = (key: string, signal: AbortSignal) => {
  const [from, to] = key.split("/");
  return fetchRoute(from, to, signal);
};

export const useRoute = (from: string, to: string) => {
  const { data, ...rest } = useLoad(from && to ? `${from}/${to}` : "", routeByKey);
  return { route: data, ...rest };
};
