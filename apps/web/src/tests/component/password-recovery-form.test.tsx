import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { PasswordRecoveryForm } from "@/components/auth/password-recovery-form";

const requestMock = vi.hoisted(() => vi.fn());
const resetMock = vi.hoisted(() => vi.fn());
const pushMock = vi.hoisted(() => vi.fn());
vi.mock("@/actions/auth", () => ({ requestPasswordResetAction: requestMock, resetPasswordWithCodeAction: resetMock }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ push: pushMock }) }));

describe("PasswordRecoveryForm", () => {
  it("validates e-mail and opens the code reset step", async () => {
    requestMock.mockResolvedValue({ ok: true, message: "Se existir uma conta com esse e-mail, enviaremos um código válido por 15 minutos." });
    render(<PasswordRecoveryForm />);
    fireEvent.click(screen.getByRole("button", { name: "Enviar código" }));
    expect(await screen.findByText("Informe seu e-mail.")).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText("E-mail"), { target: { value: "terapeuta@example.com" } });
    fireEvent.click(screen.getByRole("button", { name: "Enviar código" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("Confira seu e-mail");
    expect(screen.getByLabelText("Código de verificação")).toBeInTheDocument();
    expect(requestMock).toHaveBeenCalledWith({ email: "terapeuta@example.com" });
  });
});
