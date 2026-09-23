import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { AgendaCalendar } from "@/components/appointments/agenda-calendar";
import { AppointmentComposerProvider } from "@/components/appointmentComposer";

const navigationMocks = vi.hoisted(() => ({ refresh: vi.fn(), replace: vi.fn() }));
const appointmentMocks = vi.hoisted(() => ({ cancel: vi.fn() }));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: navigationMocks.refresh, replace: navigationMocks.replace }),
  usePathname: () => "/agenda",
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock("@/actions/appointments", () => ({
  createAppointmentAction: vi.fn(),
  updateAppointmentAction: vi.fn(),
  startAppointmentSessionAction: vi.fn(),
  finishAppointmentSessionAction: vi.fn(),
  cancelAppointmentAction: appointmentMocks.cancel,
}));

vi.mock("@/actions/integrations", () => ({ syncUpcomingAppointmentsAction: vi.fn() }));

const patient = {
  id: "patient-1",
  name: "Ana Teste",
  hasCompleteFinancialProfile: true,
};
const renderAgenda = (element: React.ReactNode) => render(
  <AppointmentComposerProvider patients={[patient]} whatsappConfigured={false}>
    {element}
  </AppointmentComposerProvider>,
);

describe("AgendaCalendar", () => {
  it("renders the empty month view and exposes unavailable blocking", () => {
    renderAgenda(
      <AgendaCalendar
        patients={[]}
        appointments={[]}
        initialDate="2026-09-01"
        initialView="mes"
      />,
    );
    expect(screen.getByRole("tab", { name: "Mês" })).toHaveAttribute(
      "data-state",
      "active",
    );
    fireEvent.click(screen.getByRole("button", { name: "Bloquear horário" }));
    expect(
      screen.getByRole("dialog", { name: "Ação ainda não disponível" }),
    ).toBeInTheDocument();
  });

  it("opens appointment details and the persisted edit form", () => {
    renderAgenda(
      <AgendaCalendar
        patients={[]}
        initialView="dia"
        initialDate="2026-09-01"
        appointments={[
          {
            id: "appointment-1",
            patientId: "patient-1",
            patientName: "Ana Teste",
            startsAt: "2026-09-01T09:00:00-03:00",
            endsAt: "2026-09-01T09:50:00-03:00",
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
    expect(screen.getByText("Detalhes do agendamento")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Editar" }));
    expect(screen.getByRole("dialog", { name: "Editar agendamento" })).toBeInTheDocument();
    expect(screen.getByLabelText("Início")).toHaveTextContent("09:00");
  });

  it("shows only the month-filtered appointments in chronological cards", () => {
    renderAgenda(
      <AgendaCalendar
        patients={[patient]}
        initialView="mes"
        initialDate="2026-09-22"
        appointments={[
          {
            id: "appointment-october",
            patientId: "patient-1",
            patientName: "Fora do mês",
            startsAt: "2026-10-01T09:00:00-03:00",
            endsAt: "2026-10-01T09:50:00-03:00",
            status: "agendada",
            type: "Sessão individual",
            videoUrl: null,
            sessionStartedAt: null,
            sessionEndedAt: null,
          },
          {
            id: "appointment-september",
            patientId: "patient-1",
            patientName: "Ana Teste",
            startsAt: "2026-09-26T09:00:00-03:00",
            endsAt: "2026-09-26T09:50:00-03:00",
            status: "agendada",
            type: "Sessão individual",
            videoUrl: null,
            sessionStartedAt: null,
            sessionEndedAt: null,
          },
        ]}
      />,
    );
    const cards = screen.getByRole("heading", { name: "Consultas do mês" }).closest("section");
    expect(cards).not.toBeNull();
    const scoped = within(cards as HTMLElement);
    expect(scoped.getByText("1 consulta encontrada no filtro atual.")).toBeInTheDocument();
    expect(scoped.getByText("Ana Teste")).toBeInTheDocument();
    expect(scoped.queryByText("Fora do mês")).not.toBeInTheDocument();
  });

  it("opens cancellation from a period card", async () => {
    appointmentMocks.cancel.mockResolvedValue({
      ok: true,
      message: "Consulta cancelada.",
    });
    renderAgenda(
      <AgendaCalendar
        patients={[patient]}
        initialView="dia"
        initialDate="2026-09-26"
        appointments={[{
          id: "appointment-1",
          patientId: "patient-1",
          patientName: "Ana Teste",
          startsAt: "2026-09-26T09:00:00-03:00",
          endsAt: "2026-09-26T09:50:00-03:00",
          status: "agendada",
          type: "Sessão individual",
          videoUrl: null,
          sessionStartedAt: null,
          sessionEndedAt: null,
        }]}
      />,
    );
    const cards = screen.getByRole("heading", { name: "Consultas do dia" }).closest("section");
    fireEvent.click(within(cards as HTMLElement).getByRole("button", { name: "Cancelar" }));
    const dialog = screen.getByRole("alertdialog", { name: "Cancelar esta consulta?" });
    fireEvent.click(within(dialog).getByRole("button", { name: "Cancelar consulta" }));
    expect(appointmentMocks.cancel).toHaveBeenCalledWith("appointment-1");
  });
  it("opens the create dialog from canonical URL state with the patient selected", () => {
    renderAgenda(
      <AgendaCalendar
        patients={[patient]}
        appointments={[]}
        initialOpen="1"
        defaultPatientId="patient-1"
      />,
    );

    expect(
      screen.getByRole("dialog", { name: "Novo agendamento" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("combobox", { name: "Paciente" }),
    ).toHaveTextContent("Ana Teste");
  });

  it("warns without blocking when WhatsApp is not configured", () => {
    renderAgenda(
      <AgendaCalendar
        patients={[patient]}
        appointments={[]}
        initialOpen="1"
        defaultPatientId="patient-1"
        whatsappConfigured={false}
      />,
    );

    expect(
      screen.getByText(/a consulta será criada normalmente/i),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Salvar" })).toBeEnabled();
  });

  it("disables end-time choices that are not after the selected start", () => {
    renderAgenda(
      <AgendaCalendar
        patients={[patient]}
        appointments={[]}
        initialOpen="1"
        defaultPatientId="patient-1"
      />,
    );

    const endTrigger = screen.getByRole("combobox", { name: "Fim" });
    endTrigger.focus();
    fireEvent.keyDown(endTrigger, { key: "ArrowDown" });

    expect(screen.getByRole("option", { name: "08:50" })).toHaveAttribute(
      "data-disabled",
    );
    expect(screen.getByRole("option", { name: "09:00" })).toHaveAttribute(
      "data-disabled",
    );
    expect(screen.getByRole("option", { name: "09:10" })).not.toHaveAttribute(
      "data-disabled",
    );
  }, 10_000);
});
