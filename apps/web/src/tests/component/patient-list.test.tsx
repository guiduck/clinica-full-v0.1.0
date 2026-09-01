import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { PatientList } from "@/components/patients/patient-list";
import { Tooltip } from "@/components/tooltip";
import type { PatientSummary } from "@/types/patients";

const pushMock = vi.hoisted(() => vi.fn());
const replaceMock = vi.hoisted(() => vi.fn());

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: pushMock,
    refresh: vi.fn(),
    replace: replaceMock,
  }),
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock("@/actions/patients", () => ({
  createPatientWizardAction: vi.fn(),
}));

const patients: PatientSummary[] = [
  {
    id: "patient-active",
    name: "Ana Silva",
    phone: "(11) 99999-1111",
    email: "ana@example.com",
    cpf: "529.982.247-25",
    whatsappConsent: true,
    status: "ativo",
    hasCompleteFinancialProfile: true,
  },
  {
    id: "patient-inactive",
    name: "Bruno Souza",
    phone: "(11) 98888-2222",
    email: null,
    cpf: null,
    whatsappConsent: false,
    status: "inativo",
    hasCompleteFinancialProfile: false,
  },
  {
    id: "patient-archived",
    name: "Carla Lima",
    phone: "(11) 97777-3333",
    email: "carla@example.com",
    cpf: "111.444.777-35",
    whatsappConsent: false,
    status: "arquivado",
    hasCompleteFinancialProfile: false,
  },
];

function renderPatientList(items = patients) {
  return render(
    <Tooltip.Provider>
      <PatientList patients={items} />
    </Tooltip.Provider>,
  );
}

function selectTab(name: string) {
  const tab = screen.getByRole("tab", { name });
  fireEvent.mouseDown(tab, { button: 0, ctrlKey: false });
}

describe("PatientList", () => {
  beforeEach(() => {
    pushMock.mockClear();
    replaceMock.mockClear();
  });

  it("filters by supported identifiers and status", () => {
    renderPatientList();

    fireEvent.change(
      screen.getByPlaceholderText(
        "Buscar por nome, CPF, e-mail ou telefone...",
      ),
      { target: { value: "98888" } },
    );
    expect(screen.getByText("Bruno Souza")).toBeInTheDocument();
    expect(screen.queryByText("Ana Silva")).not.toBeInTheDocument();

    fireEvent.change(
      screen.getByPlaceholderText(
        "Buscar por nome, CPF, e-mail ou telefone...",
      ),
      { target: { value: "" } },
    );
    selectTab("Arquivados");
    expect(screen.getByText("Carla Lima")).toBeInTheDocument();
    expect(screen.queryByText("Bruno Souza")).not.toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Restaurar paciente" }),
    ).toBeInTheDocument();
  });

  it("distinguishes an empty database from an empty search result", () => {
    const { rerender } = renderPatientList([]);
    expect(
      screen.getByText("Nenhum paciente cadastrado ainda"),
    ).toBeInTheDocument();

    rerender(
      <Tooltip.Provider>
        <PatientList patients={patients} />
      </Tooltip.Provider>,
    );
    fireEvent.change(
      screen.getByPlaceholderText(
        "Buscar por nome, CPF, e-mail ou telefone...",
      ),
      { target: { value: "paciente inexistente" } },
    );
    expect(screen.getByText("Nenhum paciente encontrado")).toBeInTheDocument();
  });

  it("keeps contact and record mutations unavailable while contextual links navigate", () => {
    renderPatientList([patients[0]]);

    fireEvent.click(screen.getByRole("button", { name: "WhatsApp" }));
    expect(screen.getByRole("dialog")).toHaveTextContent(
      "Nenhuma mensagem foi enviada",
    );
    fireEvent.click(screen.getByRole("button", { name: "Entendi" }));

    fireEvent.click(screen.getByRole("button", { name: "Editar" }));
    expect(screen.getByRole("dialog")).toHaveTextContent(
      "Nenhum dado foi modificado",
    );
    fireEvent.click(screen.getByRole("button", { name: "Entendi" }));

    fireEvent.click(screen.getByRole("button", { name: "Financeiro" }));
    expect(pushMock).toHaveBeenCalledWith(
      "/pacientes/patient-active?tab=financeiro",
    );
    fireEvent.click(screen.getByRole("button", { name: "Dados de pagamento" }));
    expect(pushMock).toHaveBeenCalledWith(
      "/pacientes/patient-active/financeiro?focus=payment",
    );
  });
});
