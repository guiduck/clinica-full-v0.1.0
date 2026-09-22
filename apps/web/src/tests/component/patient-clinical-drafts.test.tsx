import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { PatientAnamneseTab, PatientClinicalRecordTab } from "@/components/patients/patient-clinical-tabs";

describe("clinical draft protection", () => {
  const appointments = [{ id: "appointment-1", startsAt: "2026-09-01T09:00:00-03:00", type: "Sessão individual", status: "agendada" }];
  it("reports meaningful anamnesis content to the profile guard", async () => {
    const onDirtyChange = vi.fn();
    render(<PatientAnamneseTab patientId="patient-1" onDirtyChange={onDirtyChange} />);

    fireEvent.change(screen.getByLabelText("Descrição detalhada"), {
      target: { value: "Conteúdo clínico em edição" },
    });

    await waitFor(() => expect(onDirtyChange).toHaveBeenLastCalledWith(true));
  });

  it("keeps an evolution draft until discard is explicitly confirmed", async () => {
    const onDirtyChange = vi.fn();
    render(<PatientClinicalRecordTab patientId="patient-1" appointments={appointments} onDirtyChange={onDirtyChange} />);

    fireEvent.click(screen.getByRole("button", { name: "Nova evolução" }));
    fireEvent.change(screen.getByLabelText("Registro livre"), {
      target: { value: "Registro que ainda não foi salvo" },
    });
    await waitFor(() => expect(onDirtyChange).toHaveBeenLastCalledWith(true));

    fireEvent.click(screen.getByRole("button", { name: "Cancelar" }));
    expect(screen.getByText("Descartar conteúdo não salvo?")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Continuar editando" }));
    expect(screen.getByDisplayValue("Registro que ainda não foi salvo")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Cancelar" }));
    fireEvent.click(screen.getByRole("button", { name: "Descartar e sair" }));
    await waitFor(() => expect(screen.queryByText("Nova evolução", { selector: "h2" })).not.toBeInTheDocument());
    expect(onDirtyChange).toHaveBeenLastCalledWith(false);
  });
});
