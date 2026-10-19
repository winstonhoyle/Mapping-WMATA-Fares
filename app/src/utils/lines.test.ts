import { describe, expect, it } from "vitest";
import type { Lines } from "@/types";
import { legPath } from "./lines";

const shape = (NAME: string, coordinates: number[][]): Lines["features"][number] => ({
  type: "Feature",
  properties: { NAME },
  geometry: { type: "LineString", coordinates },
});

// Red bends through (1, 1); Yellow's shape stops at x = 1.
const lines: Lines = {
  type: "FeatureCollection",
  features: [
    shape("red", [
      [0, 0],
      [0.5, 0.5],
      [1, 1],
      [1.5, 0.5],
      [2, 0],
    ]),
    shape("yellow", [
      [0, 0],
      [1, 0],
    ]),
    shape("green", [
      [0, 0],
      [1, 0],
      [2, 0],
    ]),
  ],
};

describe("legPath", () => {
  it("follows the line's shape between the stations, either way", () => {
    expect(
      legPath(
        [
          [0.5, 0.5],
          [1.5, 0.5],
        ],
        ["RD"],
        lines,
      ),
    ).toEqual([
      [0.5, 0.5],
      [0.5, 0.5],
      [1, 1],
      [1.5, 0.5],
      [1.5, 0.5],
    ]);
    expect(
      legPath(
        [
          [1.5, 0.5],
          [0.5, 0.5],
        ],
        ["RD"],
        lines,
      )[2],
    ).toEqual([1, 1]);
  });

  it("uses the next line when a station is off the first one's shape", () => {
    expect(
      legPath(
        [
          [0, 0],
          [2, 0],
        ],
        ["YL", "GR"],
        lines,
      ),
    ).toEqual([
      [0, 0],
      [0, 0],
      [1, 0],
      [2, 0],
      [2, 0],
    ]);
  });

  it("falls back to straight segments", () => {
    expect(
      legPath(
        [
          [5, 5],
          [6, 6],
        ],
        ["RD"],
        lines,
      ),
    ).toEqual([
      [5, 5],
      [6, 6],
    ]);
  });
});
