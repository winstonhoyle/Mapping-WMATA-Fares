import type { Fare } from "@/types";

/** What the map can color by. Measures in one group share a control; title heads the legend. */
export const MEASURES = [
  { key: "PeakTime", group: "Fare", label: "Peak", title: "Peak fare" },
  { key: "OffPeakTime", group: "Fare", label: "Off-peak", title: "Off-peak fare" },
  {
    key: "SeniorDisabled",
    group: "Fare",
    label: "Senior and disabled",
    title: "Senior and disabled fare",
  },
  { key: "RailTime", group: "Time", label: "Time", title: "Travel time" },
  { key: "CompositeMiles", group: "Distance", label: "Distance", title: "Distance" },
  { key: "PeakPerMile", group: "Per mile", label: "Per mile", title: "Peak fare per mile" },
] as const;

export type Measure = (typeof MEASURES)[number]["key"];
export type MeasureGroup = (typeof MEASURES)[number]["group"];

export const MEASURE_GROUPS = [...new Set(MEASURES.map((m) => m.group))];

export const measureInfo = (key: Measure) => MEASURES.find((m) => m.key === key)!;

/** A measure's value for one trip; per mile is derived, the rest are WMATA's fields. */
export const measureValue = (fare: Fare, key: Measure) =>
  key === "PeakPerMile" ? fare.PeakTime / fare.CompositeMiles : fare[key];

type Break = { min: number; token: `--${string}`; label?: string };

/** Hand-set color breaks per measure, highest first; a value takes the first it reaches. */
export const BREAKS: Record<Measure, Break[]> = {
  PeakTime: [
    { min: 6.75, token: "--rdylgn7-7", label: "$6.75 (max fare)" },
    { min: 6.0, token: "--rdylgn7-6" },
    { min: 5.0, token: "--rdylgn7-5" },
    { min: 4.0, token: "--rdylgn7-4" },
    { min: 3.0, token: "--rdylgn7-3" },
    { min: 2.3, token: "--rdylgn7-2" },
    { min: 2.0, token: "--rdylgn7-1", label: "$2.25 and under (base fare)" },
  ],
  OffPeakTime: [
    { min: 2.5, token: "--rdylgn3-3", label: "$2.50 (max fare)" },
    { min: 2.3, token: "--rdylgn3-2" },
    { min: 2.0, token: "--rdylgn3-1", label: "$2.25 and under (base fare)" },
  ],
  SeniorDisabled: [
    { min: 3.0, token: "--rdylgn6-6", label: "$3.00 (max fare)" },
    { min: 2.5, token: "--rdylgn6-5" },
    { min: 2.0, token: "--rdylgn6-4" },
    { min: 1.5, token: "--rdylgn6-3" },
    { min: 1.15, token: "--rdylgn6-2" },
    { min: 1.0, token: "--rdylgn6-1", label: "$1.10 (base fare)" },
  ],
  RailTime: [
    { min: 60, token: "--rdylgn7-7", label: "60 min and up" },
    { min: 50, token: "--rdylgn7-6", label: "50 to 59 min" },
    { min: 40, token: "--rdylgn7-5", label: "40 to 49 min" },
    { min: 30, token: "--rdylgn7-4", label: "30 to 39 min" },
    { min: 20, token: "--rdylgn7-3", label: "20 to 29 min" },
    { min: 10, token: "--rdylgn7-2", label: "10 to 19 min" },
    { min: 0, token: "--rdylgn7-1", label: "Under 10 min" },
  ],
  CompositeMiles: [
    { min: 30, token: "--rdylgn6-6", label: "30 mi and up" },
    { min: 20, token: "--rdylgn6-5", label: "20 to 30 mi" },
    { min: 15, token: "--rdylgn6-4", label: "15 to 20 mi" },
    { min: 10, token: "--rdylgn6-3", label: "10 to 15 mi" },
    { min: 5, token: "--rdylgn6-2", label: "5 to 10 mi" },
    { min: 0, token: "--rdylgn6-1", label: "Under 5 mi" },
  ],
  PeakPerMile: [
    { min: 1, token: "--rdylgn7-7", label: "$1 and up a mile" },
    { min: 0.75, token: "--rdylgn7-6", label: "75¢ to $1" },
    { min: 0.6, token: "--rdylgn7-5", label: "60¢ to 75¢" },
    { min: 0.5, token: "--rdylgn7-4", label: "50¢ to 60¢" },
    { min: 0.4, token: "--rdylgn7-3", label: "40¢ to 50¢" },
    { min: 0.3, token: "--rdylgn7-2", label: "30¢ to 40¢" },
    { min: 0, token: "--rdylgn7-1", label: "Under 30¢" },
  ],
};

export const BELOW_TOKEN = "--wf-map-fare-below";

export const breakToken = (value: number, type: Measure) =>
  BREAKS[type].find((b) => value >= b.min)?.token ?? BELOW_TOKEN;

export const formatFare = (value: number) => `$${value.toFixed(2)}`;

/** A break's own label, else "$6.00 and up" for the top break and "$5.00 to $5.99" below it. */
export const breakLabels = (type: Measure) =>
  BREAKS[type].map(
    (b, i, all) =>
      b.label ??
      (i === 0
        ? `${formatFare(b.min)} and up`
        : `${formatFare(b.min)} to ${formatFare(all[i - 1].min - 0.01)}`),
  );

/** The fare to show: the one picked, or peak while coloring by anything else. */
export const shownFare = (fare: Fare, type: Measure) =>
  measureValue(fare, measureInfo(type).group === "Fare" ? type : "PeakTime");

export const fareSummary = (fare: Fare, type: Measure) =>
  `${formatFare(shownFare(fare, type))} · ${fare.RailTime} min · ${fare.CompositeMiles} mi`;
