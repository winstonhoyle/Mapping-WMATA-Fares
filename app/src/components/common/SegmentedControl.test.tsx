import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { SegmentedControl } from "./SegmentedControl";

const options = [
  { value: "a", label: "Apple" },
  { value: "b", label: "Banana" },
] as const;

describe("SegmentedControl", () => {
  it("is a named radio group with the value checked", () => {
    render(
      <SegmentedControl
        legend="Fruit"
        name="fruit"
        options={options}
        value="a"
        onChange={() => {}}
      />,
    );
    expect(screen.getByRole("group", { name: "Fruit" })).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: "Apple" })).toBeChecked();
  });

  it("reports the picked value", async () => {
    const onChange = vi.fn();
    render(
      <SegmentedControl
        legend="Fruit"
        name="fruit"
        options={options}
        value="a"
        onChange={onChange}
      />,
    );
    await userEvent.click(screen.getByText("Banana"));
    expect(onChange).toHaveBeenCalledWith("b");
  });
});
