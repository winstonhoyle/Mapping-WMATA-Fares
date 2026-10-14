import { describe, expect, it } from "vitest";
import { BELOW_TOKEN, breakLabels, fareToken } from "./fares";

describe("fareToken", () => {
  it("uses the original peak breaks", () => {
    expect(fareToken(6.75, "PeakTime")).toBe("--rdylgn7-7");
    expect(fareToken(6.0, "PeakTime")).toBe("--rdylgn7-7");
    expect(fareToken(5.95, "PeakTime")).toBe("--rdylgn7-6");
    expect(fareToken(2.25, "PeakTime")).toBe("--rdylgn7-1");
  });

  it("uses the original off-peak and senior breaks", () => {
    expect(fareToken(3.85, "OffPeakTime")).toBe("--rdylgn5-5");
    expect(fareToken(2.5, "OffPeakTime")).toBe("--rdylgn5-2");
    expect(fareToken(3.0, "SeniorDisabled")).toBe("--rdylgn5-5");
    expect(fareToken(1.1, "SeniorDisabled")).toBe("--rdylgn5-1");
  });

  it("falls below the lowest break", () => {
    expect(fareToken(1.95, "PeakTime")).toBe(BELOW_TOKEN);
  });
});

describe("breakLabels", () => {
  it("labels each break, most expensive first", () => {
    expect(breakLabels("SeniorDisabled")).toEqual([
      "$3.00 and up",
      "$2.50 to $2.99",
      "$2.00 to $2.49",
      "$1.50 to $1.99",
      "$1.00 to $1.49",
    ]);
  });
});
