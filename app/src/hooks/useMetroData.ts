import { useEffect, useState } from "react";
import { fetchFares, fetchLines, fetchStations } from "@/services/api";
import type { Fares, Lines, Station } from "@/types";

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

type FaresResult = { origin: string; fares: Fares | null; error: string | null };

export const useFares = (origin: string) => {
  const [result, setResult] = useState<FaresResult | null>(null);

  useEffect(() => {
    if (!origin) return;
    const controller = new AbortController();
    fetchFares(origin, controller.signal)
      .then((fares) => setResult({ origin, fares, error: null }))
      .catch((err) => {
        const error = message(err);
        if (error) setResult({ origin, fares: null, error });
      });
    return () => controller.abort();
  }, [origin]);

  // A result for an earlier origin would color the map wrong, so it counts as nothing yet.
  const current = origin && result?.origin === origin ? result : null;
  return {
    fares: current?.fares ?? null,
    loading: Boolean(origin) && !current,
    error: current?.error ?? null,
  };
};
