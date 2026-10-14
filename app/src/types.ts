import type { Feature, FeatureCollection, LineString, MultiLineString, Point } from "geojson";

export type StationProperties = {
  Code: string;
  Name: string;
  StationTogether1: string;
  LineCode1: string | null;
  LineCode2: string | null;
  LineCode3: string | null;
  LineCode4: string | null;
};

export type Station = Feature<Point, StationProperties>;
export type Stations = FeatureCollection<Point, StationProperties>;
export type Lines = FeatureCollection<LineString | MultiLineString, { NAME: string }>;

export type Fare = {
  CompositeMiles: number;
  RailTime: number;
  PeakTime: number;
  OffPeakTime: number;
  SeniorDisabled: number;
};

/** Destination station code to the fare from the origin. */
export type Fares = Record<string, Fare>;
