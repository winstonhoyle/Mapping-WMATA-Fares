import type { Fare, RouteLeg, Station } from "@/types";
import { fareSummary, type Measure } from "@/utils/fares";
import { LINES } from "@/utils/lines";
import styles from "./RouteSummary.module.css";

type RouteSummaryProps = {
  legs: RouteLeg[];
  byCode: Map<string, Station>;
  fare: Fare;
  measure: Measure;
};

const lineOf = (code: string) => LINES.find((l) => l.code === code);

const joinOr = (words: string[]) =>
  words.length < 2 ? words.join("") : `${words.slice(0, -1).join(", ")} or ${words.at(-1)}`;

export const RouteSummary = ({ legs, byCode, fare, measure }: RouteSummaryProps) => {
  const name = (code: string) => byCode.get(code)?.properties.Name ?? code;
  return (
    <section className={styles.route} aria-label="Route">
      <p className={styles.total}>{fareSummary(fare, measure)}</p>
      <ol className={styles.legs}>
        {legs.map((leg) => {
          const [first, ...others] = leg.lines;
          const from = leg.stations[0];
          const to = leg.stations.at(-1)!;
          return (
            <li key={from} className={styles.leg}>
              <span
                className={styles.bar}
                style={{ background: `var(--wf-map-line-${lineOf(first.line)?.name})` }}
                aria-hidden
              />
              <span>
                <strong>
                  {joinOr(leg.lines.map((l) => lineOf(l.line)?.label ?? l.line))} line
                </strong>
                {others.length === 0 && ` toward ${name(first.toward)}`}
                <br />
                {name(from)} to {name(to)}, {leg.stations.length - 1}{" "}
                {leg.stations.length === 2 ? "stop" : "stops"}
              </span>
            </li>
          );
        })}
      </ol>
    </section>
  );
};
