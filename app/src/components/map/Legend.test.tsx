import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { Legend } from "./Legend";

describe("Legend", () => {
  it("lists the peak breaks, most expensive first", () => {
    render(<Legend measure="PeakTime" />);
    const items = screen.getAllByRole("listitem");
    expect(items).toHaveLength(7);
    expect(items[0]).toHaveTextContent("$6.75 (max fare)");
    expect(items[6]).toHaveTextContent("$2.25 and under (base fare)");
  });

  it("names the measure", () => {
    render(<Legend measure="OffPeakTime" />);
    expect(screen.getByRole("heading")).toHaveTextContent("Off-peak fare");
  });

  it("collapses", async () => {
    render(<Legend measure="PeakTime" />);
    await userEvent.click(screen.getByRole("button", { name: "Collapse legend" }));
    expect(screen.queryByRole("list")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Expand legend" })).toHaveAttribute(
      "aria-expanded",
      "false",
    );
  });
});
