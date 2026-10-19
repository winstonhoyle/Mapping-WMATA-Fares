import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { Fare, Station } from "@/types";
import { LINES } from "@/utils/lines";
import { LineStations } from "./LineStations";

const station = (Code: string, Name: string, LineCode1: string): Station => ({
  type: "Feature",
  geometry: { type: "Point", coordinates: [0, 0] },
  properties: {
    Code,
    Name,
    StationTogether1: "",
    LineCode1,
    LineCode2: null,
    LineCode3: null,
    LineCode4: null,
  },
});

const fare = (PeakTime: number, RailTime: number, CompositeMiles: number): Fare => ({
  PeakTime,
  OffPeakTime: 2.5,
  SeniorDisabled: PeakTime / 2,
  RailTime,
  CompositeMiles,
});

describe("LineStations", () => {
  it("lists the line's other paid stations, lowest first", () => {
    const stations = [
      station("A01", "Metro Center", "RD"),
      station("A15", "Shady Grove", "RD"),
      station("B01", "Gallery Place", "RD"),
      station("A02", "Farragut North", "RD"),
      station("C05", "Rosslyn", "BL"),
    ];
    const fares = {
      A01: fare(0, 0, 0),
      A15: fare(6.75, 33, 20),
      A02: fare(2, 2, 0.75),
      C05: fare(3, 8, 3),
      B01: fare(0, 0, 0),
    };
    render(
      <LineStations
        stations={stations}
        line={LINES[0]}
        origin="A01"
        fares={fares}
        measure="RailTime"
      />,
    );
    const rows = within(screen.getByRole("table")).getAllByRole("row").slice(1);
    expect(rows.map((r) => within(r).getByRole("rowheader").textContent)).toEqual([
      "Farragut North",
      "Shady Grove",
    ]);
    expect(rows[1]).toHaveTextContent("$6.75");
  });
});
