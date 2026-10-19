import { Swatch } from "@/components/common/Swatch";
import type { Fares, Station } from "@/types";
import { breakToken, formatFare, measureValue, shownFare, type Measure } from "@/utils/fares";
import { onLine, type Line } from "@/utils/lines";
import styles from "./LineStations.module.css";

type LineStationsProps = {
  stations: Station[];
  line: Line;
  origin: string;
  fares: Fares;
  measure: Measure;
};

export const LineStations = ({ stations, line, origin, fares, measure }: LineStationsProps) => {
  const rows = stations
    // A free fare is the origin's other platform, which the map leaves white too.
    .filter(
      (s) =>
        onLine(s, line) && s.properties.Code !== origin && fares[s.properties.Code]?.PeakTime > 0,
    )
    .map((s) => ({ station: s, fare: fares[s.properties.Code] }))
    .sort(
      (a, b) =>
        measureValue(a.fare, measure) - measureValue(b.fare, measure) ||
        a.fare.RailTime - b.fare.RailTime,
    );

  return (
    <table className={styles.table}>
      <caption className={styles.caption}>{line.label} line stations</caption>
      <thead>
        <tr>
          <th scope="col">Station</th>
          <th scope="col">Fare</th>
          <th scope="col">Time</th>
          <th scope="col">Miles</th>
        </tr>
      </thead>
      <tbody>
        {rows.map(({ station, fare }) => (
          <tr key={station.properties.Code}>
            <th scope="row">
              <Swatch
                token={breakToken(measureValue(fare, measure), measure)}
                className={styles.swatch}
              />
              {station.properties.Name}
            </th>
            <td>{formatFare(shownFare(fare, measure))}</td>
            <td>{fare.RailTime} min</td>
            <td>{fare.CompositeMiles}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};
