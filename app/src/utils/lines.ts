import type { Lines, Station } from "@/types";

/** WMATA's line codes on stations, and the NAME the same line has in the lines GeoJSON. */
export const LINES = [
  { code: "RD", name: "red", label: "Red" },
  { code: "OR", name: "orange", label: "Orange" },
  { code: "BL", name: "blue", label: "Blue" },
  { code: "GR", name: "green", label: "Green" },
  { code: "YL", name: "yellow", label: "Yellow" },
  { code: "SV", name: "silver", label: "Silver" },
] as const;

export type Line = (typeof LINES)[number];

/** A transfer station has a code per platform, so this is true only for the platform on the line. */
export const onLine = ({ properties: p }: Station, line: Line) =>
  [p.LineCode1, p.LineCode2, p.LineCode3, p.LineCode4].includes(line.code);

type Point = [number, number];

/** GeoJSON is [lng, lat]; Leaflet wants [lat, lng]. */
export const latLng = ([lng, lat]: number[]): Point => [lat, lng];

// Squared distance in degrees, with longitude shrunk to its length at DC's latitude.
const dist2 = ([x1, y1]: number[], [x2, y2]: number[]) => ((x1 - x2) * 0.78) ** 2 + (y1 - y2) ** 2;
const nearest = (shape: number[][], p: Point) =>
  shape.reduce((best, c, i) => (dist2(c, p) < dist2(shape[best], p) ? i : best), 0);
// About 500 m: farther than any station sits from its own line's shape.
const ON_SHAPE = 0.005 ** 2;

/**
 * A leg's path along the first of its lines whose shape passes every one of its stations (the
 * Yellow shape stops at Mt Vernon Square though the stations run on), else straight segments.
 */
export const legPath = (stops: Point[], lineCodes: string[], lines: Lines): Point[] => {
  for (const code of lineCodes) {
    const name = LINES.find((l) => l.code === code)?.name;
    const geometry = lines.features.find((f) => f.properties.NAME === name)?.geometry;
    if (geometry?.type !== "LineString") continue;
    const shape = geometry.coordinates;
    if (!stops.every((p) => dist2(shape[nearest(shape, p)], p) < ON_SHAPE)) continue;
    const [i, j] = [nearest(shape, stops[0]), nearest(shape, stops.at(-1)!)];
    const along = shape.slice(Math.min(i, j), Math.max(i, j) + 1) as Point[];
    return [stops[0], ...(i <= j ? along : along.reverse()), stops.at(-1)!];
  }
  return stops;
};
