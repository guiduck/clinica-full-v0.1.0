import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  PatientAnamneseTab,
  PatientClinicalRecordTab,
} from "@/components/patients/patient-clinical-tabs";
import { AgendaCalendar } from "@/components/appointments/agenda-calendar";

vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh: vi.fn() }) }));
vi.mock("@/actions/appointments", () => ({ createAppointmentAction: vi.fn() }));

afterEach(() => vi.useRealTimers());

describe("clinical tabs", () => {
  it("keeps anamnesis transient, updates progress and blocks save", () => {
    render(<PatientAnamneseTab />);
    fireEvent.change(screen.getByLabelText("Descrição detalhada"), {
      target: { value: "Queixa" },
    });
    expect(screen.getByText("Rascunho local não salvo")).toBeInTheDocument();
    expect(screen.getByText("5%")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Salvar" }));
    expect(
      screen.getByRole("dialog", {
        name: "Prontuário seguro ainda não conectado",
      }),
    ).toBeInTheDocument();
  });

  it("validates clinical drafts before opening the unavailable notice", () => {
    render(<PatientClinicalRecordTab />);
    fireEvent.click(screen.getByRole("button", { name: "Nova evolução" }));
    fireEvent.change(screen.getByLabelText("Data"), {
      target: { value: "31/02/2026" },
    });
    fireEvent.change(screen.getByLabelText("Registro livre"), {
      target: { value: "Registro clínico" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Salvar evolução" }));
    expect(screen.getByText("Revise a evolução")).toBeInTheDocument();
    expect(
      screen.queryByRole("dialog", {
        name: "Prontuário seguro ainda não conectado",
      }),
    ).not.toBeInTheDocument();
  });

  it("keeps evolution transient and blocks its final save", () => {
    render(<PatientClinicalRecordTab />);
    fireEvent.click(screen.getByRole("button", { name: "Nova evolução" }));
    fireEvent.change(screen.getByLabelText("Registro livre"), {
      target: { value: "Registro clínico" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Salvar evolução" }));
    expect(
      screen.getByRole("dialog", {
        name: "Prontuário seguro ainda não conectado",
      }),
    ).toBeInTheDocument();
  });

  it("pauses, resumes and blocks finalization of the transient session timer", () => {
    vi.useFakeTimers();
    render(
      <AgendaCalendar
        patients={[]}
        initialView="dia"
        initialDate="2026-09-01"
        appointments={[
          {
            id: "appointment-1",
            patientId: "patient-1",
            patientName: "Ana Teste",
            startsAt: "2026-09-01T09:00:00",
            endsAt: "2026-09-01T09:50:00",
            status: "agendada",
            type: "Sessão individual",
            videoUrl: null,
          },
        ]}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: /Ana Teste/ }));
    fireEvent.click(screen.getByRole("button", { name: "Iniciar sessão" }));
    act(() => vi.advanceTimersByTime(2_000));
    expect(screen.getByText("00:02")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Pausar" }));
    act(() => vi.advanceTimersByTime(2_000));
    expect(screen.getByText("00:02")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Retomar" }));
    act(() => vi.advanceTimersByTime(1_000));
    expect(screen.getByText("00:03")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Finalizar sessão" }));
    expect(
      screen.getByRole("dialog", { name: "Ação ainda não disponível" }),
    ).toBeInTheDocument();
  });
});
