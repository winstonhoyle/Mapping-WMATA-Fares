import { useState } from "react";
import { Combobox } from "@/components/common/Combobox";
import { Disclosure } from "@/components/common/Disclosure";
import { IconButton } from "@/components/common/IconButton";
import { Panel } from "@/components/common/Panel";
import { SegmentedControl } from "@/components/common/SegmentedControl";
import { ExpandLessIcon, ExpandMoreIcon, InfoIcon } from "@/icons";
import type { Fares, RouteLeg, Station } from "@/types";
import { LINES, type Line } from "@/utils/lines";
import { MEASURE_GROUPS, MEASURES, measureInfo, type Measure } from "@/utils/fares";
import { LineStations } from "./LineStations";
import { RouteSummary } from "./RouteSummary";
import { StationPicker } from "./StationPicker";
import styles from "./OverlayPanel.module.css";

type OverlayPanelProps = {
  stations: Station[];
  byCode: Map<string, Station>;
  selected: string;
  onSelect: (code: string) => void;
  measure: Measure;
  onMeasureChange: (type: Measure) => void;
  loading: boolean;
  error: string | null;
  onAboutOpen: () => void;
  line: Line | null;
  onLineChange: (line: Line | null) => void;
  fares: Fares | null;
  to: string;
  onToChange: (code: string) => void;
  route: RouteLeg[] | null;
};

export const OverlayPanel = ({
  stations,
  byCode,
  selected,
  onSelect,
  measure,
  onMeasureChange,
  loading,
  error,
  onAboutOpen,
  line,
  onLineChange,
  fares,
  to,
  onToChange,
  route,
}: OverlayPanelProps) => {
  const [isOpen, setIsOpen] = useState(true);
  const { group } = measureInfo(measure);
  const siblings = MEASURES.filter((m) => m.group === group);

  return (
    <Panel id="overlay-panel" className={styles.panel}>
      <div className={styles.header}>
        <h1 className={styles.title}>Metrorail fares</h1>
        <div className={styles.actions}>
          <IconButton label="About WMATA Fares" onClick={onAboutOpen}>
            <InfoIcon />
          </IconButton>
          <IconButton
            label={isOpen ? "Collapse panel" : "Expand panel"}
            aria-expanded={isOpen}
            aria-controls="overlay-body"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </IconButton>
        </div>
      </div>

      {isOpen && (
        <div id="overlay-body" className={styles.body}>
          <StationPicker
            label="From"
            placeholder="Pick a station"
            stations={stations}
            value={byCode.get(selected) ?? null}
            onChange={onSelect}
          />
          {selected && (
            <StationPicker
              label="To"
              placeholder="Pick a destination for a route"
              stations={stations.filter((s) => s.properties.Code !== selected)}
              value={byCode.get(to) ?? null}
              onChange={onToChange}
            />
          )}
          {route && route.length > 0 && fares?.[to] && (
            <RouteSummary legs={route} byCode={byCode} fare={fares[to]} measure={measure} />
          )}

          <SegmentedControl
            legend="Color by"
            name="measure-group"
            options={MEASURE_GROUPS.map((g) => ({ value: g, label: g }))}
            value={group}
            onChange={(g) => onMeasureChange(MEASURES.find((m) => m.group === g)!.key)}
          />
          {siblings.length > 1 && (
            <SegmentedControl
              legend={`${group} type`}
              hideLegend
              name="measure"
              options={siblings.map((m) => ({ value: m.key, label: m.label }))}
              value={measure}
              onChange={onMeasureChange}
            />
          )}

          {/* Open on mount when a line is picked, so collapsing the panel doesn't hide the filter. */}
          <Disclosure label="Advanced" defaultOpen={Boolean(line)}>
            <Combobox<Line>
              label="Line"
              value={line}
              onChange={onLineChange}
              options={[...LINES]}
              getOptionLabel={(l) => l.label}
              getOptionValue={(l) => l.code}
              isClearable
              placeholder="All lines"
            />
            {line && selected && fares && (
              <LineStations
                stations={stations}
                line={line}
                origin={selected}
                fares={fares}
                measure={measure}
              />
            )}
          </Disclosure>

          {!selected && (
            <p className={styles.hint}>
              Click a station, or pick one above, to color every other station by its fare, travel
              time, or distance from there.
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
