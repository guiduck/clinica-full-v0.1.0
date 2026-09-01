import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { PatientProfileView } from "@/components/patients/patient-profile-view";

const pushMock = vi.hoisted(() => vi.fn());
const replaceMock = vi.hoisted(() => vi.fn());

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock, replace: replaceMock }),
}));

const patient = {
  id: "patient-legacy",
  name: "Paciente Legado",
  phone: "(11) 99999-0000",
  email: null,
  cpf: null,
  birthDate: null,
  notes: null,
  whatsappConsent: false,
  emailConsent: false,
  status: "ativo",
  financialComplete: true,
  defaultSessionPriceCents: 18000,
  appointments: [],
};

function selectTab(name: string) {
  const tab = screen.getByRole("tab", { name });
  fireEvent.mouseDown(tab, { button: 0, ctrlKey: false });
}

describe("PatientProfileView", () => {
  beforeEach(() => {
    pushMock.mockClear();
    replaceMock.mockClear();
  });

  it("keeps the canonical six-tab order and serializes tab navigation", async () => {
    render(<PatientProfileView patient={patient} />);

    expect(screen.getAllByRole("tab").map((tab) => tab.textContent)).toEqual([
      "Geral",
      "Anamnese",
      "Agenda",
      "Prontuário",
      "Financeiro",
      "Documentos",
    ]);

    selectTab("Financeiro");
    await waitFor(() =>
      expect(replaceMock).toHaveBeenCalledWith(
        "/pacientes/patient-legacy?tab=financeiro",
        { scroll: false },
      ),
    );
    expect(screen.getByText("Histórico financeiro")).toBeInTheDocument();
  });

  it("renders incomplete legacy identity safely and preserves contextual links", () => {
    render(<PatientProfileView patient={patient} initialTab="geral" />);

    expect(screen.getAllByText("Não informado")).toHaveLength(3);
    expect(screen.getByText("Nenhum endereço cadastrado.")).toBeInTheDocument();

    selectTab("Agenda");
    expect(
      screen.getByRole("link", { name: "Agendar sessão" }),
    ).toHaveAttribute("href", "/agenda?new=1&patientId=patient-legacy");

    selectTab("Financeiro");
    expect(
      screen.getByRole("link", { name: "Dados de pagamento" }),
    ).toHaveAttribute(
      "href",
      "/pacientes/patient-legacy/financeiro?focus=payment",
    );
  });

  it("keeps archive, edit and manual WhatsApp actions explicitly unavailable", () => {
    render(<PatientProfileView patient={patient} />);

    fireEvent.click(screen.getByRole("button", { name: "WhatsApp" }));
    expect(screen.getByRole("dialog")).toHaveTextContent(
      "Nenhuma mensagem foi enviada",
    );
    fireEvent.click(screen.getByRole("button", { name: "Entendi" }));

    fireEvent.click(screen.getByRole("button", { name: "Arquivar" }));
    expect(screen.getByRole("dialog")).toHaveTextContent("não será persistido");
    fireEvent.click(screen.getByRole("button", { name: "Entendi" }));

    fireEvent.click(screen.getByRole("button", { name: "Editar paciente" }));
    expect(screen.getByRole("dialog")).toHaveTextContent("não será persistido");
  });
});
