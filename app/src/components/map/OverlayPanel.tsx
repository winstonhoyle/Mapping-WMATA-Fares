import { useState } from "react";
import { Combobox } from "@/components/common/Combobox";
import { IconButton } from "@/components/common/IconButton";
import { Panel } from "@/components/common/Panel";
import { ExpandLessIcon, ExpandMoreIcon } from "@/icons";
import type { Station } from "@/types";
import { FARE_TYPES, type FareType } from "@/utils/fares";
import styles from "./OverlayPanel.module.css";

type OverlayPanelProps = {
  stations: Station[];
  byCode: Map<string, Station>;
  selected: string;
  onSelect: (code: string) => void;
  fareType: FareType;
  onFareTypeChange: (type: FareType) => void;
  loading: boolean;
  error: string | null;
};

export const OverlayPanel = ({
  stations,
  byCode,
  selected,
  onSelect,
  fareType,
  onFareTypeChange,
  loading,
  error,
}: OverlayPanelProps) => {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <Panel id="overlay-panel" className={styles.panel}>
      <div className={styles.header}>
        <h1 className={styles.title}>Metrorail fares</h1>
        <IconButton
          label={isOpen ? "Collapse panel" : "Expand panel"}
          aria-expanded={isOpen}
          aria-controls="overlay-body"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        </IconButton>
      </div>

      {isOpen && (
        <div id="overlay-body" className={styles.body}>
          <Combobox<Station>
            label="Station"
            value={byCode.get(selected) ?? null}
            onChange={(s) => onSelect(s?.properties.Code ?? "")}
            options={stations}
            getOptionLabel={(s) => s.properties.Name}
            getOptionValue={(s) => s.properties.Code}
            isClearable
            placeholder="Pick a station"
          />

          <fieldset className={styles.fareTypes}>
            <legend className={styles.label}>Fare</legend>
            {FARE_TYPES.map(({ key, label }) => (
              <label key={key} className={styles.fareType}>
                <input
                  type="radio"
                  name="fare-type"
                  value={key}
                  checked={fareType === key}
                  onChange={() => onFareTypeChange(key)}
                />
                {label}
              </label>
            ))}
          </fieldset>

          {!selected && (
            <p className={styles.hint}>
              Click a station, or pick one above, to color every other station by its fare from
              there.
            </p>
          )}

          <div role="status" className={styles.status}>
            {loading && "Loading fares…"}
          </div>
          {error && (
            <p role="alert" className={styles.error}>
              {error}
            </p>
          )}
        </div>
      )}
    </Panel>
  );
};
