import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  PatientAnamneseTab,
  PatientClinicalRecordTab,
} from "@/components/patients/patient-clinical-tabs";
import { AgendaCalendar } from "@/components/appointments/agenda-calendar";

const actionMocks = vi.hoisted(() => ({
  saveAnamnesis: vi.fn(),
  saveEvolution: vi.fn(),
  startSession: vi.fn(),
  finishSession: vi.fn(),
  getSessionContext: vi.fn(),
}));
const toastMocks = vi.hoisted(() => ({
  success: vi.fn(),
  error: vi.fn(),
  message: vi.fn(),
}));
vi.mock("sonner", () => ({ toast: toastMocks }));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: vi.fn(), replace: vi.fn() }),
  usePathname: () => "/agenda",
  useSearchParams: () => new URLSearchParams(),
}));
vi.mock("@/actions/appointments", () => ({
  createAppointmentAction: vi.fn(),
  startAppointmentSessionAction: actionMocks.startSession,
  finishAppointmentSessionAction: actionMocks.finishSession,
}));
vi.mock("@/actions/clinical", () => ({
  saveAnamnesisAction: actionMocks.saveAnamnesis,
  saveEvolutionAction: actionMocks.saveEvolution,
  getClinicalSessionContextAction: actionMocks.getSessionContext,
}));

afterEach(() => vi.useRealTimers());
const clinicalAppointments = [{ id: "appointment-1", startsAt: "2026-09-01T09:00:00-03:00", type: "Sessão individual", status: "agendada" }];

describe("clinical tabs", () => {
  it("updates anamnesis progress and persists the encrypted record", async () => {
    actionMocks.saveAnamnesis.mockResolvedValue({ ok: true, message: "Anamnese salva com sucesso." });
    render(<PatientAnamneseTab patientId="patient-1" />);
    fireEvent.change(screen.getByLabelText("Descrição detalhada"), {
      target: { value: "Queixa" },
    });
    expect(screen.getByText("Alterações não salvas")).toBeInTheDocument();
    expect(screen.getByText("5%")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Salvar" }));
    await waitFor(() => expect(actionMocks.saveAnamnesis).toHaveBeenCalledWith("patient-1", expect.any(Object)));
    await waitFor(() => expect(toastMocks.success).toHaveBeenCalledWith("Anamnese salva com sucesso."));
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("validates clinical drafts before opening the unavailable notice", () => {
    render(<PatientClinicalRecordTab patientId="patient-1" appointments={clinicalAppointments} />);
    fireEvent.click(screen.getByRole("button", { name: "Nova evolução" }));
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

  it("persists a clinical evolution", async () => {
    actionMocks.saveEvolution.mockResolvedValue({
      ok: true,
      message: "Evolução salva com sucesso.",
      data: { id: "evolution-1", appointmentId: "appointment-1", occurredAt: new Date().toISOString(), mood: 5, free: "Registro clínico", subjective: "", objective: "", assessment: "", plan: "" },
    });
    render(<PatientClinicalRecordTab patientId="patient-1" appointments={clinicalAppointments} />);
    fireEvent.click(screen.getByRole("button", { name: "Nova evolução" }));
    const appointmentSelect = screen.getByRole("combobox", {
      name: "Sessão vinculada",
    });
    appointmentSelect.focus();
    fireEvent.keyDown(appointmentSelect, { key: "ArrowDown" });
    fireEvent.click(screen.getByRole("option", { name: /01\/09\/2026/ }));
    fireEvent.change(screen.getByLabelText("Registro livre"), {
      target: { value: "Registro clínico" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Salvar evolução" }));
    await waitFor(() => expect(actionMocks.saveEvolution).toHaveBeenCalledWith("patient-1", expect.objectContaining({ free: "Registro clínico" })));
    expect(await screen.findByText("Registro clínico")).toBeInTheDocument();
  });

  it("pauses, resumes and persists finalization of the session timer", async () => {
    vi.useFakeTimers();
    actionMocks.startSession.mockResolvedValue({ ok: true, message: "Sessão iniciada." });
    actionMocks.finishSession.mockResolvedValue({ ok: true, message: "Sessão finalizada." });
    actionMocks.getSessionContext.mockResolvedValue({ ok: true, data: { anamnesis: {}, evolutions: [] } });
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
            sessionStartedAt: null,
            sessionEndedAt: null,
          },
        ]}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: /Ana Teste/ }));
    await act(async () => fireEvent.click(screen.getByRole("button", { name: "Iniciar sessão" })));
    act(() => vi.advanceTimersByTime(2_000));
    expect(screen.getByText("00:02")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Pausar" }));
    act(() => vi.advanceTimersByTime(2_000));
    expect(screen.getByText("00:02")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Retomar" }));
    act(() => vi.advanceTimersByTime(1_000));
    expect(screen.getByText("00:03")).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText("Registro livre"), { target: { value: "Sessão concluída" } });
    await act(async () => fireEvent.click(screen.getByRole("button", { name: "Finalizar sessão" })));
    expect(actionMocks.finishSession).toHaveBeenCalledWith("appointment-1", expect.objectContaining({ free: "Sessão concluída" }));
  });

  it("allows an early finish without forcing an empty evolution", async () => {
    actionMocks.startSession.mockResolvedValue({ ok: true, message: "Sessão iniciada." });
    actionMocks.finishSession.mockResolvedValue({ ok: true, message: "Sessão finalizada sem evolução." });
    actionMocks.getSessionContext.mockResolvedValue({ ok: true, data: { anamnesis: {}, evolutions: [] } });
    render(
      <AgendaCalendar
        patients={[]}
        initialView="dia"
        initialDate="2026-09-01"
        appointments={[
          {
            id: "appointment-2",
            patientId: "patient-1",
            patientName: "Ana Teste",
            startsAt: "2026-09-01T10:00:00",
            endsAt: "2026-09-01T10:50:00",
            status: "agendada",
            type: "Sessão individual",
            videoUrl: null,
            sessionStartedAt: null,
            sessionEndedAt: null,
          },
        ]}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /Ana Teste/ }));
    await act(async () => fireEvent.click(screen.getByRole("button", { name: "Iniciar sessão" })));
    await act(async () => fireEvent.click(screen.getByRole("button", { name: "Finalizar sessão" })));

    expect(actionMocks.finishSession).toHaveBeenCalledWith(
      "appointment-2",
      expect.objectContaining({ free: "", subjective: "", objective: "", assessment: "", plan: "" }),
    );
  });
});
