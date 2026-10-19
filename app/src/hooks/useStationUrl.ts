import { useEffect, useState } from "react";
import type { Station } from "@/types";
import { buildStationPath, parseStationPath } from "@/utils/stationPath";

/** The selected station lives in the URL (/A01), so every view can be shared and reloaded. */
export const useStationUrl = (byCode: Map<string, Station>) => {
  const [path, setPath] = useState(() => window.location.pathname);

  useEffect(() => {
    const onPopState = () => setPath(window.location.pathname);
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  // Unknown codes fall back to the home map once the stations are known.
  const ready = byCode.size > 0;
  const wanted = parseStationPath(path);
  const code = ready && byCode.has(wanted) ? wanted : "";

  useEffect(() => {
    if (!ready) return;
    const canonical = buildStationPath(code);
    if (canonical !== window.location.pathname)
      window.history.replaceState(null, "", canonical + window.location.search);
    const name = byCode.get(code)?.properties.Name;
    document.title = name
      ? `Fares from ${name} | WMATA Fares`
      : "WMATA Fares: Metrorail fares on a map";
  }, [ready, code, byCode]);

  const select = (next: string) => {
    const nextPath = buildStationPath(next);
    // The query (?line=) belongs to the view, not the station, so it carries over.
    if (nextPath !== window.location.pathname)
      window.history.pushState(null, "", nextPath + window.location.search);
    setPath(nextPath);
  };

  return [code, select] as const;
};
