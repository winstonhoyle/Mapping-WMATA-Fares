import { Pane, Polyline } from "react-leaflet";
import { tokenValue } from "@/styles/tokens";
import type { Lines, RouteLeg, Station } from "@/types";
import { latLng, legPath, LINES } from "@/utils/lines";

type RouteLayerProps = { legs: RouteLeg[]; byCode: Map<string, Station>; lines: Lines | null };

/** Each leg along its line's track, in the line's color over a dark casing. */
export const RouteLayer = ({ legs, byCode, lines }: RouteLayerProps) => (
  <Pane name="route" style={{ zIndex: 375 }}>
    {legs.map((leg) => {
      const stops = leg.stations.flatMap((c) =>
        byCode.has(c) ? [byCode.get(c)!.geometry.coordinates as [number, number]] : [],
      );
      const codes = leg.lines.map((l) => l.line);
      const positions = (lines ? legPath(stops, codes, lines) : stops).map(latLng);
      const name = LINES.find((l) => l.code === codes[0])?.name;
      return [
        <Polyline
          key={`${leg.stations[0]}-casing`}
          positions={positions}
          pathOptions={{ color: tokenValue("--wf-map-route-casing"), weight: 12 }}
          interactive={false}
        />,
        <Polyline
          key={leg.stations[0]}
          positions={positions}
          pathOptions={{ color: tokenValue(`--wf-map-line-${name}`), weight: 7 }}
          interactive={false}
        />,
      ];
    })}
  </Pane>
);
