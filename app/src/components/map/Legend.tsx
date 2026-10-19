import { useState } from "react";
import { IconButton } from "@/components/common/IconButton";
import { Panel } from "@/components/common/Panel";
import { Swatch } from "@/components/common/Swatch";
import { AddIcon, RemoveIcon } from "@/icons";
import { breakLabels, BREAKS, measureInfo, type Measure } from "@/utils/fares";
import styles from "./Legend.module.css";

type LegendProps = { measure: Measure };

export const Legend = ({ measure }: LegendProps) => {
  // Starts closed on phones, where the open list would cover much of the map.
  const [open, setOpen] = useState(() => !window.matchMedia("(max-width: 40em)").matches);
  const labels = breakLabels(measure);
  const { title } = measureInfo(measure);
  return (
    <Panel id="legend" className={styles.legend}>
      <div className={styles.header}>
        <h2 className={styles.title} id="legend-title">
          {title}
        </h2>
        <IconButton
          label={open ? "Collapse legend" : "Expand legend"}
          aria-expanded={open}
          aria-controls="legend-items"
          onClick={() => setOpen(!open)}
        >
          {open ? <RemoveIcon /> : <AddIcon />}
        </IconButton>
      </div>

      {open && (
        <ul id="legend-items" className={styles.items} aria-labelledby="legend-title">
          {BREAKS[measure].map((b, i) => (
            <li key={b.min} className={styles.item}>
              <Swatch token={b.token} />
              {labels[i]}
            </li>
          ))}
        </ul>
      )}
    </Panel>
  );
};
