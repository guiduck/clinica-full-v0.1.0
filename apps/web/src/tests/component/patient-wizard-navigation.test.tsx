import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { PatientWizard } from "@/components/patients/patient-wizard";

const pushMock = vi.hoisted(() => vi.fn());
const refreshMock = vi.hoisted(() => vi.fn());
const createPatientMock = vi.hoisted(() => vi.fn());

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock, refresh: refreshMock }),
}));

vi.mock("@/actions/patients", () => ({
  createPatientWizardAction: createPatientMock,
}));

describe("PatientWizard navigation", () => {
  it("opens Agenda with the newly created patient instead of racing back to the list", async () => {
    createPatientMock.mockResolvedValue({
      ok: true,
      patientId: "patient-created",
      patientName: "Ana Teste",
    });
    render(<PatientWizard open onOpenChange={vi.fn()} />);

    fireEvent.change(screen.getByLabelText("Nome completo *"), {
      target: { value: "Ana Teste" },
    });
    fireEvent.change(screen.getByLabelText("CPF *"), {
      target: { value: "529.982.247-25" },
    });
    fireEvent.change(screen.getByLabelText("Data de nascimento *"), {
      target: { value: "10/06/1990" },
    });
    fireEvent.change(screen.getByLabelText("E-mail *"), {
      target: { value: "ana@example.com" },
    });
    fireEvent.change(screen.getByLabelText("Telefone / WhatsApp *"), {
      target: { value: "(11) 99999-9999" },
    });
    fireEvent.click(screen.getByText(/Endereço \(opcional\)/));
    fireEvent.change(screen.getByLabelText("CEP"), { target: { value: "01310-100" } });
    fireEvent.change(screen.getByLabelText("Logradouro"), { target: { value: "Avenida Paulista" } });
    fireEvent.click(screen.getByText("Contato de emergência (opcional)"));
    fireEvent.change(screen.getByLabelText("Telefone"), { target: { value: "11988887777" } });
    fireEvent.click(screen.getByRole("button", { name: "Próximo" }));
    fireEvent.change(screen.getByLabelText("Valor por sessão (R$)"), {
      target: { value: "25000" },
    });
    fireEvent.change(screen.getByLabelText("Chave PIX"), {
      target: { value: "52998224725" },
    });
    fireEvent.click(screen.getByRole("button", { name: /Salvar paciente/i }));

    await waitFor(() => expect(createPatientMock).toHaveBeenCalled());
    const submitted = createPatientMock.mock.calls[0][0] as FormData;
    expect(submitted.get("addressZipCode")).toBe("01310-100");
    expect(submitted.get("emergencyContactPhone")).toBe("(11) 98888-7777");

    expect(
      await screen.findByRole("alertdialog", {
        name: "Paciente cadastrado com sucesso",
      }),
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Sim, agendar" }));

    await waitFor(() =>
      expect(pushMock).toHaveBeenCalledWith(
        "/agenda?new=1&patientId=patient-created",
      ),
    );
  });
});
