import type { Fare } from "@/types";

export const FARE_TYPES = [
  { key: "PeakTime", label: "Peak" },
  { key: "OffPeakTime", label: "Off-peak" },
  { key: "SeniorDisabled", label: "Senior and disabled" },
] as const;

export type FareType = (typeof FARE_TYPES)[number]["key"];

type Break = { min: number; token: `--${string}` };

/** Fixed color breaks per fare type, most expensive first; a fare takes the first break it reaches. */
export const FARE_BREAKS: Record<FareType, Break[]> = {
  PeakTime: [
    { min: 6.0, token: "--rdylgn7-7" },
    { min: 5.0, token: "--rdylgn7-6" },
    { min: 4.0, token: "--rdylgn7-5" },
    { min: 3.5, token: "--rdylgn7-4" },
    { min: 3.0, token: "--rdylgn7-3" },
    { min: 2.5, token: "--rdylgn7-2" },
    { min: 2.0, token: "--rdylgn7-1" },
  ],
  OffPeakTime: [
    { min: 3.85, token: "--rdylgn5-5" },
    { min: 3.5, token: "--rdylgn5-4" },
    { min: 3.0, token: "--rdylgn5-3" },
    { min: 2.5, token: "--rdylgn5-2" },
    { min: 2.0, token: "--rdylgn5-1" },
  ],
  SeniorDisabled: [
    { min: 3.0, token: "--rdylgn5-5" },
    { min: 2.5, token: "--rdylgn5-4" },
    { min: 2.0, token: "--rdylgn5-3" },
    { min: 1.5, token: "--rdylgn5-2" },
    { min: 1.0, token: "--rdylgn5-1" },
  ],
};

export const BELOW_TOKEN = "--wf-map-fare-below";

export const fareToken = (value: number, type: FareType) =>
  FARE_BREAKS[type].find((b) => value >= b.min)?.token ?? BELOW_TOKEN;

export const formatFare = (value: number) => `$${value.toFixed(2)}`;

/** "$6.00 and up", then "$5.00 to $5.99" down the list. */
export const breakLabels = (type: FareType) =>
  FARE_BREAKS[type].map((b, i, all) =>
    i === 0
      ? `${formatFare(b.min)} and up`
      : `${formatFare(b.min)} to ${formatFare(all[i - 1].min - 0.01)}`,
  );

export const fareSummary = (fare: Fare, type: FareType) =>
  `${formatFare(fare[type])} · ${fare.RailTime} min · ${fare.CompositeMiles} mi`;
