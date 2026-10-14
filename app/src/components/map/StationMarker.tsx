import { memo } from "react";
import { CircleMarker, Tooltip } from "react-leaflet";
import { tokenValue } from "@/styles/tokens";
import type { Fare, Station } from "@/types";
import { fareSummary, fareToken, type FareType } from "@/utils/fares";
import styles from "./StationMarker.module.css";

type StationMarkerProps = {
  station: Station;
  selected: boolean;
  fare: Fare | undefined;
  fareType: FareType;
  onClick: (code: string) => void;
};

const fillToken = ({ selected, fare, fareType }: StationMarkerProps) => {
  if (selected) return "--wf-map-origin";
  // 0 is the selected station's other platform (Metro Center A01/C01): free, so left white.
  if (fare && fare[fareType] > 0) return fareToken(fare[fareType], fareType);
  return "--wf-map-station-fill";
};

export const StationMarker = memo(function StationMarker(props: StationMarkerProps) {
  const { station, selected, fare, fareType, onClick } = props;
  const [lng, lat] = station.geometry.coordinates;
  const { Code, Name } = station.properties;

  return (
    <CircleMarker
      center={[lat, lng]}
      radius={selected ? 8 : 6}
      pathOptions={{
        color: tokenValue("--wf-map-station-stroke"),
        weight: 1,
        fillColor: tokenValue(fillToken(props)),
        fillOpacity: 1,
      }}
      eventHandlers={{ click: () => onClick(Code) }}
    >
      <Tooltip direction="top" offset={[0, -6]} className={styles.tooltip}>
        <strong>{Name}</strong>
        {fare && !selected && <span>{fareSummary(fare, fareType)}</span>}
      </Tooltip>
    </CircleMarker>
  );
});
