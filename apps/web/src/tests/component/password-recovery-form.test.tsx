import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { PasswordRecoveryForm } from "@/components/auth/password-recovery-form";

describe("PasswordRecoveryForm", () => {
  it("validates e-mail then explains unavailability without fake delivery", async () => {
    render(<PasswordRecoveryForm />);
    fireEvent.click(screen.getByRole("button", { name: "Enviar link" }));
    expect(await screen.findByText("Informe seu e-mail.")).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText("E-mail"), { target: { value: "terapeuta@example.com" } });
    fireEvent.click(screen.getByRole("button", { name: "Enviar link" }));
    expect(screen.getByRole("dialog")).toHaveTextContent("Nenhum link foi enviado");
    expect(screen.queryByText("Link enviado")).not.toBeInTheDocument();
  });
});
