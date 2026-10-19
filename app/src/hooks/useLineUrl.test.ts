import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { LINES } from "@/utils/lines";
import { useLineUrl } from "./useLineUrl";

afterEach(() => window.history.replaceState(null, "", "/"));

describe("useLineUrl", () => {
  it("reads the line from the query, in any case", () => {
    window.history.replaceState(null, "", "/A01?line=Orange");
    expect(renderHook(useLineUrl).result.current[0]?.code).toBe("OR");
  });

  it("ignores an unknown line", () => {
    window.history.replaceState(null, "", "/A01?line=purple");
    expect(renderHook(useLineUrl).result.current[0]).toBeNull();
  });

  it("writes and clears the query, keeping the station path", () => {
    window.history.replaceState(null, "", "/A01");
    const { result } = renderHook(useLineUrl);
    act(() => result.current[1](LINES[5]));
    expect(window.location.pathname + window.location.search).toBe("/A01?line=silver");
    act(() => result.current[1](null));
    expect(window.location.pathname + window.location.search).toBe("/A01");
  });
});
