import { afterEach, describe, expect, it, vi } from "vitest";
import { API_BASE, fetchFares } from "./api";

afterEach(() => vi.unstubAllGlobals());

describe("fetchFares", () => {
  it("requests the station's fares", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({ A02: {} })));
    vi.stubGlobal("fetch", fetchMock);
    await expect(fetchFares("A01")).resolves.toEqual({ A02: {} });
    expect(fetchMock).toHaveBeenCalledWith(`${API_BASE}/fares/A01`, { signal: undefined });
  });

  it("throws on an error status", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("{}", { status: 404 })));
    await expect(fetchFares("ZZZ")).rejects.toThrow("404");
  });
});
