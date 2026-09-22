import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { DashboardView } from "@/components/dashboard/dashboard-view";
import type { FinanceEntryView } from "@/types/finance";

const replaceMock = vi.hoisted(() => vi.fn());
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: replaceMock }),
}));
vi.mock("@/actions/ui-preferences", () => ({
  updateUserUiPreferenceAction: vi.fn().mockResolvedValue({ ok: true }),
}));

describe("DashboardView", () => {
  it("supports privacy, banner dismissal, editing and canonical quick actions", async () => {
    const financeEntries: FinanceEntryView[] = [
      {
        id: "effective",
        appointmentId: "appointment-1",
        patientId: "patient-1",
        patientName: "Ana",
        description: "Sessão — Ana",
        category: "Avulso",
        type: "receita",
        paymentMethod: "pix",
        status: "efetivado",
        valueCents: 15_000,
        date: new Date().toISOString(),
        dueDate: new Date().toISOString(),
      },
      {
        id: "expected",
        appointmentId: "appointment-2",
        patientId: "patient-1",
        patientName: "Ana",
        description: "Sessão futura — Ana",
        category: "Avulso",
        type: "receita",
        paymentMethod: "pix",
        status: "previsto",
        valueCents: 10_000,
        date: new Date().toISOString(),
        dueDate: new Date().toISOString(),
      },
    ];
    render(
      <DashboardView
        firstName="Gui"
        patients={[]}
        appointments={[]}
        financeEntries={financeEntries}
        initialOrder={null}
        initialFinancialHidden={false}
        showNews
      />,
    );
    expect(screen.getByText("Olá, Gui!")).toBeInTheDocument();
    expect(screen.getAllByText(/R\$\s*150,00/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/R\$\s*100,00/).length).toBeGreaterThan(0);
    expect(screen.getByText("Receitas a confirmar")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Novo paciente/ })).toHaveAttribute(
      "href",
      "/pacientes?new=1",
    );
    expect(screen.getAllByRole("button", { name: /Novo agendamento/ }).length).toBeGreaterThan(0);
    fireEvent.click(screen.getByRole("button", { name: "Ocultar valores" }));
    expect(screen.getByText(/Valores ocultos/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Fechar novidade" }));
    await waitFor(() =>
      expect(
        screen.queryByText("Filtros de período no Financeiro"),
      ).not.toBeInTheDocument(),
    );
    fireEvent.click(screen.getByRole("button", { name: /Editar layout/ }));
    expect(
      screen.getByRole("button", { name: /Concluir edição/ }),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Nenhuma mensagem programada no momento."),
    ).toBeInTheDocument();
  });
});
