import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { PasswordRecoveryForm } from "@/components/auth/password-recovery-form";

const requestMock = vi.hoisted(() => vi.fn());
vi.mock("@/actions/auth", () => ({ requestPasswordResetAction: requestMock }));

describe("PasswordRecoveryForm", () => {
  it("validates e-mail and requests a real reset link", async () => {
    requestMock.mockResolvedValue({ ok: true, message: "Se existir uma conta com esse e-mail, enviaremos um link válido por 30 minutos." });
    render(<PasswordRecoveryForm />);
    fireEvent.click(screen.getByRole("button", { name: "Enviar link" }));
    expect(await screen.findByText("Informe seu e-mail.")).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText("E-mail"), { target: { value: "terapeuta@example.com" } });
    fireEvent.click(screen.getByRole("button", { name: "Enviar link" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("Confira seu e-mail");
    expect(requestMock).toHaveBeenCalledWith({ email: "terapeuta@example.com" });
  });
});
