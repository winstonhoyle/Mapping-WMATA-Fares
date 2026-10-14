import { useEffect, useMemo, useRef, useState } from "react";
import { GeoJSON, MapContainer, Pane, TileLayer } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

import { AboutDialog } from "./AboutDialog";
import { Legend } from "./Legend";
import { OverlayPanel } from "./OverlayPanel";
import { StationMarker } from "./StationMarker";
import styles from "./MapView.module.css";

import { IconButton } from "@/components/common/IconButton";
import { useFares, useMetroData } from "@/hooks/useMetroData";
import { useStationUrl } from "@/hooks/useStationUrl";
import { InfoIcon } from "@/icons";
import { tokenValue } from "@/styles/tokens";
import type { Station } from "@/types";
import type { FareType } from "@/utils/fares";

const DEFAULT_CENTER: L.LatLngTuple = [38.898303, -77.028099]; // Metro Center

const lineStyle = (feature?: { properties: { NAME: string } }) => ({
  color: tokenValue(`--wf-map-line-${feature?.properties.NAME ?? "silver"}`),
  weight: 5,
  opacity: 0.9,
});

const boundsOf = (stations: Station[]) =>
  L.latLngBounds(
    stations.map(
      ({
        geometry: {
          coordinates: [lng, lat],
        },
      }) => [lat, lng],
    ),
  );

export const MapView = () => {
  const { stations, lines, error: dataError } = useMetroData();
  const byCode = useMemo(() => new Map(stations.map((s) => [s.properties.Code, s])), [stations]);
  const [selected, select] = useStationUrl(byCode);
  const [fareType, setFareType] = useState<FareType>("PeakTime");
  const [showAbout, setShowAbout] = useState(false);
  const { fares, loading, error } = useFares(selected);
  const mapRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (stations.length) mapRef.current?.fitBounds(boundsOf(stations));
  }, [stations]);

  return (
    <div className={styles.container}>
      <MapContainer
        className={styles.map}
        center={DEFAULT_CENTER}
        zoom={11}
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
          {lines && <GeoJSON data={lines} style={lineStyle} interactive={false} />}
        </Pane>

        {stations.map((station) => {
          const code = station.properties.Code;
          return (
            <StationMarker
              key={code}
              station={station}
              selected={code === selected}
              fare={fares?.[code]}
              fareType={fareType}
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
        fareType={fareType}
        onFareTypeChange={setFareType}
        loading={loading}
        error={error || dataError}
      />

      {selected && fares && (
        <Legend origin={byCode.get(selected)?.properties.Name ?? ""} fareType={fareType} />
      )}

      <IconButton
        label="About WMATA Fares"
        variant="floating"
        className={styles.infoButton}
        onClick={() => setShowAbout(true)}
      >
        <InfoIcon />
      </IconButton>

      <AboutDialog open={showAbout} onClose={() => setShowAbout(false)} />
    </div>
  );
};
