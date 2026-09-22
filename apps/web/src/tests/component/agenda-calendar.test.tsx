import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { AgendaCalendar } from "@/components/appointments/agenda-calendar";
import { AppointmentComposerProvider } from "@/components/appointmentComposer";

const navigationMocks = vi.hoisted(() => ({ refresh: vi.fn(), replace: vi.fn() }));

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
