import { fireEvent, render, screen } from "@testing-library/react";
import * as React from "react";
import { describe, expect, it } from "vitest";
import { DatePickerInput } from "@/components/datePicker";

function DatePickerHarness() {
  const [value, setValue] = React.useState("22/09/2026");
  return (
    <DatePickerInput
      value={value}
      onValueChange={setValue}
      aria-label="Data da consulta"
    />
  );
}

describe("DatePickerInput", () => {
  it("selects a Brazilian date from the calendar without text entry", () => {
    render(<DatePickerHarness />);

    fireEvent.click(screen.getByRole("button", { name: "Data da consulta" }));
    expect(screen.getByText("setembro de 2026")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Próximo mês" }));
    fireEvent.click(
      screen.getByRole("button", { name: "15 de outubro de 2026" }),
    );

    expect(screen.getByRole("button", { name: "Data da consulta" })).toHaveTextContent(
      "15/10/2026",
    );
  });
});
