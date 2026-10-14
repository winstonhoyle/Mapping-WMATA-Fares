import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Legend } from "./Legend";

describe("Legend", () => {
  it("lists the peak breaks, most expensive first", () => {
    render(<Legend origin="Metro Center" fareType="PeakTime" />);
    const items = screen.getAllByRole("listitem");
    expect(items).toHaveLength(7);
    expect(items[0]).toHaveTextContent("$6.00 and up");
    expect(items[6]).toHaveTextContent("$2.00 to $2.49");
  });

  it("names the fare type and station", () => {
    render(<Legend origin="Metro Center" fareType="OffPeakTime" />);
    expect(screen.getByRole("heading")).toHaveTextContent("Off-peak fare from Metro Center");
  });
});
