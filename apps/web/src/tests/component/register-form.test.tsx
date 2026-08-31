import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { RegisterForm } from "@/components/auth/register-form";

const registerMock = vi.hoisted(() => vi.fn());
const pushMock = vi.hoisted(() => vi.fn());
vi.mock("@/actions/auth", () => ({ registerAndLogin: registerMock }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ push: pushMock, refresh: vi.fn() }) }));

describe("RegisterForm", () => {
  beforeEach(() => { vi.clearAllMocks(); registerMock.mockResolvedValue({ error: false, data: { user: { id: "u1" } } }); });

  it("masks CPF and blocks invalid CPF and missing terms", async () => {
    render(<RegisterForm />);
    fireEvent.change(screen.getByLabelText("CPF"), { target: { value: "11111111111" } });
    expect(screen.getByLabelText("CPF")).toHaveValue("111.111.111-11");
    fireEvent.click(screen.getByRole("button", { name: "Criar conta" }));
    expect(await screen.findByText("Informe um CPF válido.")).toBeInTheDocument();
    expect(screen.getByText("Aceite os termos para continuar.")).toBeInTheDocument();
    expect(registerMock).not.toHaveBeenCalled();
  });

  it("submits valid account data with explicit consent", async () => {
    render(<RegisterForm />);
    fireEvent.change(screen.getByLabelText("Nome completo"), { target: { value: "Dra. Mariana Lopes" } });
    fireEvent.change(screen.getByLabelText("E-mail profissional"), { target: { value: "mariana@example.com" } });
    fireEvent.change(screen.getByLabelText("CPF"), { target: { value: "52998224725" } });
    fireEvent.change(screen.getByLabelText("Senha"), { target: { value: "senha-segura" } });
    fireEvent.click(screen.getByLabelText(/Aceito os Termos de Uso/));
    fireEvent.click(screen.getByRole("button", { name: "Criar conta" }));
    await waitFor(() => expect(registerMock).toHaveBeenCalledOnce());
    expect(registerMock.mock.calls[0][0]).toMatchObject({ cpf: "52998224725", acceptedTerms: true });
  });

  it("preserves values while errors are corrected and blocks duplicate pending submits", async () => {
    let resolve!: (value: { error: false; data: { user: { id: string } } }) => void;
    registerMock.mockReturnValueOnce(new Promise((done) => { resolve = done; }));
    render(<RegisterForm />);
    fireEvent.change(screen.getByLabelText("Nome completo"), { target: { value: "Dra. Mariana Lopes" } });
    fireEvent.change(screen.getByLabelText("E-mail profissional"), { target: { value: "mariana@example.com" } });
    fireEvent.change(screen.getByLabelText("CPF"), { target: { value: "11111111111" } });
    fireEvent.change(screen.getByLabelText("Senha"), { target: { value: "senha-segura" } });
    fireEvent.click(screen.getByLabelText(/Aceito os Termos de Uso/));
    fireEvent.click(screen.getByRole("button", { name: "Criar conta" }));
    expect(await screen.findByText("Informe um CPF válido.")).toBeInTheDocument();
    expect(screen.getByLabelText("Nome completo")).toHaveValue("Dra. Mariana Lopes");
    fireEvent.change(screen.getByLabelText("CPF"), { target: { value: "52998224725" } });
    fireEvent.click(screen.getByRole("button", { name: "Criar conta" }));
    await waitFor(() => expect(screen.getByRole("button", { name: "Criar conta" })).toBeDisabled());
    fireEvent.click(screen.getByRole("button", { name: "Criar conta" }));
    expect(registerMock).toHaveBeenCalledOnce();
    resolve({ error: false, data: { user: { id: "u1" } } });
    await waitFor(() => expect(pushMock).toHaveBeenCalledWith("/dashboard"));
  });
});
