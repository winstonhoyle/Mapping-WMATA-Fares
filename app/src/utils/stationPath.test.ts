import { describe, expect, it } from "vitest";
import { buildStationPath, parseStationPath } from "./stationPath";

describe("parseStationPath", () => {
  it("reads one station code, in any case", () => {
    expect(parseStationPath("/a01")).toBe("A01");
    expect(parseStationPath("/A01/")).toBe("A01");
  });

  it("ignores anything else", () => {
    for (const path of ["/", "/metro", "/A01/C05", "/A1"]) expect(parseStationPath(path)).toBe("");
  });

  it("round-trips with buildStationPath", () => {
    expect(parseStationPath(buildStationPath("A01"))).toBe("A01");
    expect(buildStationPath("")).toBe("/");
  });
});
