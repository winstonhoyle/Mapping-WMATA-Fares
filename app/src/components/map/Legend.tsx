import { Panel } from "@/components/common/Panel";
import { breakLabels, FARE_BREAKS, FARE_TYPES, type FareType } from "@/utils/fares";
import styles from "./Legend.module.css";

type LegendProps = { origin: string; fareType: FareType };

export const Legend = ({ origin, fareType }: LegendProps) => {
  const labels = breakLabels(fareType);
  const typeLabel = FARE_TYPES.find((t) => t.key === fareType)?.label;
  return (
    <Panel className={styles.legend}>
      <h2 className={styles.title} id="legend-title">
        {typeLabel} fare from {origin}
      </h2>
      <ul className={styles.items} aria-labelledby="legend-title">
        {FARE_BREAKS[fareType].map((b, i) => (
          <li key={b.min} className={styles.item}>
            <span className={styles.swatch} style={{ background: `var(${b.token})` }} aria-hidden />
            {labels[i]}
          </li>
        ))}
      </ul>
    </Panel>
  );
};
