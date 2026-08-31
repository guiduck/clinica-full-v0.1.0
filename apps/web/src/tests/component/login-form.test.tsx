import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { LoginForm } from "@/components/auth/login-form";

const loginMock = vi.hoisted(() => vi.fn());
const pushMock = vi.hoisted(() => vi.fn());
vi.mock("@/actions/login", () => ({ loginAndSetSession: loginMock }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ push: pushMock, refresh: vi.fn() }), useSearchParams: () => new URLSearchParams() }));

describe("LoginForm", () => {
  beforeEach(() => { vi.clearAllMocks(); loginMock.mockResolvedValue({ error: false, data: { user: { id: "u1" } } }); });

  it("validates fields inline and toggles password visibility", async () => {
    render(<LoginForm />);
    fireEvent.click(screen.getByRole("button", { name: "Entrar" }));
    expect(await screen.findByText("Informe seu e-mail.")).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText("Senha"), { target: { value: "segredo" } });
    fireEvent.click(screen.getByRole("button", { name: "Mostrar senha" }));
    expect(screen.getByLabelText("Senha")).toHaveAttribute("type", "text");
  });

  it("submits the real credentials once and navigates", async () => {
    render(<LoginForm />);
    fireEvent.change(screen.getByLabelText("E-mail"), { target: { value: "terapeuta@example.com" } });
    fireEvent.change(screen.getByLabelText("Senha"), { target: { value: "senha-segura" } });
    fireEvent.click(screen.getByLabelText("Lembrar de mim neste dispositivo"));
    fireEvent.click(screen.getByRole("button", { name: "Entrar" }));
    await waitFor(() => expect(loginMock).toHaveBeenCalledOnce());
    expect(pushMock).toHaveBeenCalledWith("/dashboard");
  });

  it("keeps submit disabled while the real action is pending", async () => {
    let resolve!: (value: { error: false; data: { user: { id: string } } }) => void;
    loginMock.mockReturnValueOnce(new Promise((done) => { resolve = done; }));
    render(<LoginForm />);
    fireEvent.change(screen.getByLabelText("E-mail"), { target: { value: "terapeuta@example.com" } });
    fireEvent.change(screen.getByLabelText("Senha"), { target: { value: "senha-segura" } });
    fireEvent.click(screen.getByRole("button", { name: "Entrar" }));
    await waitFor(() => expect(screen.getByRole("button", { name: "Entrar" })).toBeDisabled());
    resolve({ error: false, data: { user: { id: "u1" } } });
    await waitFor(() => expect(pushMock).toHaveBeenCalledWith("/dashboard"));
  });

  it("keeps Google visible but performs no login", () => {
    render(<LoginForm />);
    fireEvent.click(screen.getByRole("button", { name: "Continuar com Google" }));
    expect(screen.getByRole("dialog")).toHaveTextContent("ainda não está disponível");
    expect(loginMock).not.toHaveBeenCalled();
  });
});
