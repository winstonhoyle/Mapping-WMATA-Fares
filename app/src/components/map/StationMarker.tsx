import { memo, useEffect, useRef } from "react";
import { CircleMarker, Tooltip } from "react-leaflet";
import type L from "leaflet";
import { tokenValue } from "@/styles/tokens";
import type { Fare, Station } from "@/types";
import { breakToken, fareSummary, measureValue, type Measure } from "@/utils/fares";
import styles from "./StationMarker.module.css";

type StationMarkerProps = {
  station: Station;
  selected: boolean;
  dimmed: boolean;
  fare: Fare | undefined;
  measure: Measure;
  onClick: (code: string) => void;
};

const fillToken = ({ selected, fare, measure }: StationMarkerProps) => {
  if (selected) return "--wf-map-origin";
  // 0 is the selected station's other platform (Metro Center A01/C01): free, so left white.
  const value = fare && measureValue(fare, measure);
  if (value && value > 0) return breakToken(value, measure);
  return "--wf-map-station-fill";
};

export const StationMarker = memo(function StationMarker(props: StationMarkerProps) {
  const { station, selected, dimmed, fare, measure, onClick } = props;
  const [lng, lat] = station.geometry.coordinates;
  const { Code, Name } = station.properties;
  const ref = useRef<L.CircleMarker>(null);

  // SVG paints in the order markers were added, so the origin must be raised above its neighbors.
  useEffect(() => {
    if (selected) ref.current?.bringToFront();
  }, [selected]);

  return (
    <CircleMarker
      ref={ref}
      center={[lat, lng]}
      radius={selected ? 8 : 6}
      pathOptions={{
        color: tokenValue("--wf-map-station-stroke"),
        weight: 1,
        opacity: dimmed ? Number(tokenValue("--wf-map-faded-station")) : 1,
        fillColor: tokenValue(fillToken(props)),
        fillOpacity: dimmed ? Number(tokenValue("--wf-map-faded-station")) : 1,
      }}
      eventHandlers={{ click: () => onClick(Code) }}
    >
      <Tooltip direction="top" offset={[0, -6]} className={styles.tooltip}>
        <strong>{Name}</strong>
        {fare && !selected && <span>{fareSummary(fare, measure)}</span>}
      </Tooltip>
    </CircleMarker>
  );
});
