import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { FinanceDashboard } from "@/components/finance/finance-dashboard";
import { ForecastView } from "@/components/finance/forecast-view";
import type { FinanceEntryView } from "@/types/finance";

const replaceMock = vi.hoisted(() => vi.fn());
const navigationState = vi.hoisted(() => ({ query: "" }));
const createFinanceEntryMock = vi.hoisted(() => vi.fn());
const updateFinanceEntryMock = vi.hoisted(() => vi.fn());
const setFinanceEntryStatusMock = vi.hoisted(() => vi.fn());
vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: replaceMock, refresh: vi.fn() }),
  usePathname: () => "/financeiro",
  useSearchParams: () => new URLSearchParams(navigationState.query),
}));
vi.mock("@/actions/finance", () => ({
  createFinanceEntryAction: createFinanceEntryMock,
  updateFinanceEntryAction: updateFinanceEntryMock,
  setFinanceEntryStatusAction: setFinanceEntryStatusMock,
}));

const effective: FinanceEntryView = {
  id: "r1",
  appointmentId: "a1",
  patientId: "p1",
  patientName: "Ana Teste",
  description: "Sessão individual — Ana Teste",
  category: "Avulso",
  type: "receita",
  paymentMethod: "pix",
  status: "efetivado",
  valueCents: 15_000,
  date: new Date().toISOString(),
  dueDate: new Date().toISOString(),
};

describe("FinanceDashboard", () => {
  it("renders canonical records and persists a valid manual entry", async () => {
    createFinanceEntryMock.mockResolvedValue({ ok: true, message: "Lançamento salvo." });
    render(
      <FinanceDashboard
        entries={[effective]}
        patients={[{ id: "p1", name: "Ana Teste" }]}
      />,
    );
    expect(
      screen.getByText("Sessão individual — Ana Teste"),
    ).toBeInTheDocument();
    expect(screen.getAllByText(/R\$\s*150,00/).length).toBeGreaterThan(0);
    fireEvent.click(screen.getByRole("tab", { name: "Despesas" }));
    expect(screen.getByRole("tab", { name: "Despesas" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /Nova receita/ }));
    expect(
      screen.getByRole("dialog", { name: "Registro financeiro" }),
    ).toBeInTheDocument();
    fireEvent.change(screen.getByPlaceholderText("Ex.: Sessão semanal"), {
      target: { value: "Sessão teste" },
    });
    fireEvent.click(screen.getByRole("combobox", { name: /Categoria/ }));
    fireEvent.click(screen.getByRole("option", { name: "Avulso" }));
    fireEvent.change(screen.getByPlaceholderText("0,00"), { target: { value: "150,00" } });
    fireEvent.click(screen.getByRole("button", { name: "Salvar" }));
    await waitFor(() => expect(createFinanceEntryMock).toHaveBeenCalledOnce());
  });

  it("does not fake a receipt when no effective revenue exists", () => {
    render(<FinanceDashboard entries={[]} patients={[]} />);
    fireEvent.click(screen.getByRole("button", { name: "Emitir recibo" }));
    expect(
      screen.getByText("Nenhuma receita efetivada está disponível."),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Continuar" })).toBeDisabled();
  });

  it("applies visible filters to forecast cards and entry lists", () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const lastDay = new Date(year, date.getMonth() + 1, 0).getDate();
    navigationState.query =
      `month=${year}-${month}&from=${year}-${month}-01&to=${year}-${month}-${lastDay}&q=Ana`;
    render(
      <ForecastView
        entries={[
          effective,
          {
            ...effective,
            id: "r2",
            patientId: "p2",
            patientName: "Bruno",
            description: "Sessão individual — Bruno",
            valueCents: 5_000,
          },
        ]}
        patients={[]}
      />,
    );
    expect(screen.getAllByText(/R\$\s*150,00/).length).toBeGreaterThan(0);
    expect(screen.queryByText(/R\$\s*200,00/)).not.toBeInTheDocument();
    expect(screen.queryByText("Sessão individual — Bruno")).not.toBeInTheDocument();
  });
});
