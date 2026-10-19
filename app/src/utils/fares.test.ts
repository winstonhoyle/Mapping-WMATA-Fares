import { describe, expect, it } from "vitest";
import { BELOW_TOKEN, breakLabels, breakToken, fareSummary, measureValue } from "./fares";

describe("breakToken", () => {
  it("gives the peak max fare its own class", () => {
    expect(breakToken(6.75, "PeakTime")).toBe("--rdylgn7-7");
    expect(breakToken(6.7, "PeakTime")).toBe("--rdylgn7-6");
    expect(breakToken(2.3, "PeakTime")).toBe("--rdylgn7-2");
    expect(breakToken(2.25, "PeakTime")).toBe("--rdylgn7-1");
  });

  it("splits off-peak into base, distance, and max", () => {
    expect(breakToken(2.5, "OffPeakTime")).toBe("--rdylgn3-3");
    expect(breakToken(2.45, "OffPeakTime")).toBe("--rdylgn3-2");
    expect(breakToken(2.0, "OffPeakTime")).toBe("--rdylgn3-1");
  });

  it("uses the senior and disabled breaks", () => {
    expect(breakToken(3.0, "SeniorDisabled")).toBe("--rdylgn6-6");
    expect(breakToken(1.15, "SeniorDisabled")).toBe("--rdylgn6-2");
    expect(breakToken(1.1, "SeniorDisabled")).toBe("--rdylgn6-1");
  });

  it("bins travel time by 10 minutes", () => {
    expect(breakToken(104, "RailTime")).toBe("--rdylgn7-7");
    expect(breakToken(59, "RailTime")).toBe("--rdylgn7-6");
    expect(breakToken(2, "RailTime")).toBe("--rdylgn7-1");
  });

  it("bins distance", () => {
    expect(breakToken(39.47, "CompositeMiles")).toBe("--rdylgn6-6");
    expect(breakToken(10, "CompositeMiles")).toBe("--rdylgn6-3");
  });

  it("falls below the lowest break", () => {
    expect(breakToken(1.95, "PeakTime")).toBe(BELOW_TOKEN);
  });
});

describe("breakLabels", () => {
  it("labels each break, most expensive first", () => {
    expect(breakLabels("OffPeakTime")).toEqual([
      "$2.50 (max fare)",
      "$2.30 to $2.49",
      "$2.25 and under (base fare)",
    ]);
  });
});

describe("fareSummary", () => {
  const fare = {
    CompositeMiles: 5.2,
    RailTime: 12,
    PeakTime: 3.1,
    OffPeakTime: 2.5,
    SeniorDisabled: 1.55,
  };

  it("shows the picked fare, or peak for time and distance", () => {
    expect(fareSummary(fare, "OffPeakTime")).toBe("$2.50 · 12 min · 5.2 mi");
    expect(fareSummary(fare, "RailTime")).toBe("$3.10 · 12 min · 5.2 mi");
  });
});

describe("measureValue", () => {
  it("divides peak fare by miles for per mile", () => {
    const fare = {
      CompositeMiles: 10,
      RailTime: 20,
      PeakTime: 5.5,
      OffPeakTime: 2.5,
      SeniorDisabled: 2.75,
    };
    expect(measureValue(fare, "PeakPerMile")).toBe(0.55);
    expect(breakToken(measureValue(fare, "PeakPerMile"), "PeakPerMile")).toBe("--rdylgn7-4");
    expect(measureValue(fare, "RailTime")).toBe(20);
  });
});
