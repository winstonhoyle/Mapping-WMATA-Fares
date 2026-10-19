import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { Station } from "@/types";
import { RouteSummary } from "./RouteSummary";

const byCode = new Map(
  [
    ["A15", "Shady Grove"],
    ["A01", "Metro Center"],
    ["C01", "Metro Center"],
    ["C05", "Rosslyn"],
    ["B11", "Glenmont"],
  ].map(([Code, Name]) => [Code, { properties: { Code, Name } } as Station]),
);

describe("RouteSummary", () => {
  it("lists each leg with its lines, direction, and stops", () => {
    render(
      <RouteSummary
        legs={[
          { stations: ["A15", "A14", "A01"], lines: [{ line: "RD", toward: "B11" }] },
          {
            stations: ["C01", "C02", "C05"],
            lines: [
              { line: "BL", toward: "J03" },
              { line: "OR", toward: "K08" },
              { line: "SV", toward: "N12" },
            ],
          },
        ]}
        byCode={byCode}
        fare={{
          PeakTime: 6.2,
          OffPeakTime: 2.5,
          SeniorDisabled: 3,
          RailTime: 48,
          CompositeMiles: 16,
        }}
        measure="PeakTime"
      />,
    );
    const legs = screen.getAllByRole("listitem");
    expect(legs[0]).toHaveTextContent("Red line toward Glenmont");
    expect(legs[0]).toHaveTextContent("Shady Grove to Metro Center, 2 stops");
    expect(legs[1]).toHaveTextContent("Blue, Orange or Silver line");
    expect(legs[1]).not.toHaveTextContent("toward");
    expect(screen.getByText("$6.20 · 48 min · 16 mi")).toBeInTheDocument();
  });
});
