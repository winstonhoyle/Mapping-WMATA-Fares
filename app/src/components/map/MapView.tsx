import { useEffect, useMemo, useRef, useState } from "react";
import { GeoJSON, MapContainer, Pane, TileLayer } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

import { AboutDialog } from "./AboutDialog";
import { Legend } from "./Legend";
import { OverlayPanel } from "./OverlayPanel";
import { RouteLayer } from "./RouteLayer";
import { StationMarker } from "./StationMarker";
import styles from "./MapView.module.css";

import { useFares, useMetroData, useRoute } from "@/hooks/useMetroData";
import { useQueryParam } from "@/hooks/useQueryParam";
import { useLineUrl } from "@/hooks/useLineUrl";
import { useStationUrl } from "@/hooks/useStationUrl";
import { tokenValue } from "@/styles/tokens";
import type { Station } from "@/types";
import type { Measure } from "@/utils/fares";
import { latLng, onLine, type Line } from "@/utils/lines";

const DEFAULT_CENTER: L.LatLngTuple = [38.898303, -77.028099]; // Metro Center

const lineStyle =
  (picked: Line | null, routed: boolean) => (feature?: { properties: { NAME: string } }) => ({
    color: tokenValue(`--wf-map-line-${feature?.properties.NAME ?? "silver"}`),
    weight: 5,
    opacity:
      !routed && (!picked || feature?.properties.NAME === picked.name)
        ? 0.9
        : Number(tokenValue("--wf-map-faded-line")),
  });

const boundsOf = (stations: Station[]) =>
  L.latLngBounds(stations.map((s) => latLng(s.geometry.coordinates)));

/** Keeps fits clear of the panel and legend, with a margin since Leaflet rounds the zoom up. */
// The stations a route or picked line is about; the rest fade and the map fits these.
const focusOf = (onRoute: Set<string>, line: Line | null) => (s: Station) =>
  onRoute.size ? onRoute.has(s.properties.Code) : !line || onLine(s, line);

const panelPadding = (): L.FitBoundsOptions => {
  const panel = document.getElementById("overlay-panel")?.getBoundingClientRect();
  if (!panel) return {};
  const legend = document.getElementById("legend")?.getBoundingClientRect();
  const gap = panel.top;
  if (!window.matchMedia("(max-width: 40em)").matches) {
    return {
      paddingTopLeft: [(legend?.right ?? 0) + gap, gap],
      paddingBottomRight: [window.innerWidth - panel.left + gap, gap],
    };
  }
  return {
    paddingTopLeft: [gap, panel.bottom + gap],
    paddingBottomRight: [gap, window.innerHeight - (legend?.top ?? window.innerHeight) + gap],
  };
};

export const MapView = () => {
  const { stations, lines, error: dataError } = useMetroData();
  const byCode = useMemo(() => new Map(stations.map((s) => [s.properties.Code, s])), [stations]);
  const [selected, select] = useStationUrl(byCode);
  const [measure, setMeasure] = useState<Measure>("PeakTime");
  const [showAbout, setShowAbout] = useState(false);
  const [line, setLine] = useLineUrl();
  const { fares, loading, error } = useFares(selected);
  const [toParam, setTo] = useQueryParam("to");
  const wantedTo = toParam?.toUpperCase() ?? "";
  const to = wantedTo !== selected && byCode.has(wantedTo) ? wantedTo : "";
  const { route, error: routeError } = useRoute(selected, to);
  const onRoute = useMemo(() => new Set(route?.flatMap((leg) => leg.stations)), [route]);
  const style = useMemo(() => lineStyle(line, onRoute.size > 0), [line, onRoute]);
  const inFocus = useMemo(() => focusOf(onRoute, line), [onRoute, line]);
  const mapRef = useRef<L.Map | null>(null);
  const fitted = useRef(false);

  useEffect(() => {
    const shown = stations.filter(inFocus);
    if (!shown.length) return;
    // Leaflet drops a fit made mid-animation, so the first one, on load, doesn't animate.
    mapRef.current?.fitBounds(boundsOf(shown), { ...panelPadding(), animate: fitted.current });
    fitted.current = true;
  }, [stations, inFocus]);

  return (
    <div className={styles.container}>
      <MapContainer
        className={styles.map}
        center={DEFAULT_CENTER}
        zoom={11}
        // Quarter steps let fitBounds fill the space beside the panel; wheel zoom stays whole steps.
        zoomSnap={0.25}
        minZoom={9}
        maxZoom={16}
        ref={mapRef}
        zoomControl={false}
      >
        <TileLayer
          attribution='Tiles &copy; Esri | Fares from <a href="https://developer.wmata.com/" target="_blank" rel="noopener noreferrer">WMATA</a>, lines from <a href="https://opendata.dc.gov/" target="_blank" rel="noopener noreferrer">Open Data DC</a>'
          url="https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}"
        />

        {/* Below the default overlay pane (400), so stations draw on top whichever loads first. */}
        <Pane name="lines" style={{ zIndex: 350 }}>
          {lines && <GeoJSON data={lines} style={style} interactive={false} />}
        </Pane>

        {route && <RouteLayer legs={route} byCode={byCode} lines={lines} />}

        {stations.map((station) => {
          const code = station.properties.Code;
          return (
            <StationMarker
              key={code}
              station={station}
              selected={code === selected}
              dimmed={!inFocus(station)}
              fare={fares?.[code]}
              measure={measure}
              onClick={select}
            />
          );
        })}
      </MapContainer>

      <OverlayPanel
        stations={stations}
        byCode={byCode}
        selected={selected}
        onSelect={select}
        measure={measure}
        onMeasureChange={setMeasure}
        loading={loading}
        error={error || routeError || dataError}
        onAboutOpen={() => setShowAbout(true)}
        line={line}
        onLineChange={setLine}
        fares={fares}
        to={to}
        onToChange={(code) => setTo(code || null)}
        route={route}
      />

      {selected && fares && <Legend measure={measure} />}

      <AboutDialog open={showAbout} onClose={() => setShowAbout(false)} />
    </div>
  );
};
