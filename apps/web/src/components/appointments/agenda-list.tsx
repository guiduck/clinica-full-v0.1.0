import { CalendarClock, CalendarSync, Eye, XCircle } from "lucide-react";
import { AppointmentStatusBadge } from "@/components/appointmentStatusBadge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { AgendaView } from "@/components/appointments/agenda-calendar-model";
import {
  formatBrazilianDate,
  formatTime24,
} from "@/utils/formatters";

export type AgendaCardAppointment = {
  id: string;
  patientId: string;
  patientName: string;
  startsAt: string;
  endsAt: string;
  status: string;
  type: string;
  videoUrl: string | null;
  sessionStartedAt: string | null;
  sessionEndedAt: string | null;
};

const periodNames: Record<AgendaView, string> = {
  dia: "do dia",
  semana: "da semana",
  mes: "do mês",
};

export function AgendaPeriodCards({
  appointments,
  view,
  onSelect,
  onEdit,
  onCancel,
}: {
  appointments: AgendaCardAppointment[];
  view: AgendaView;
  onSelect: (appointment: AgendaCardAppointment) => void;
  onEdit: (appointment: AgendaCardAppointment) => void;
  onCancel: (appointment: AgendaCardAppointment) => void;
}) {
  return (
    <section aria-labelledby="agenda-period-title" className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h2 id="agenda-period-title" className="text-xl font-semibold">
            Consultas {periodNames[view]}
          </h2>
          <p className="text-sm text-muted-foreground">
            {appointments.length} {appointments.length === 1 ? "consulta encontrada" : "consultas encontradas"} no filtro atual.
          </p>
        </div>
      </div>
      {appointments.length === 0 ? (
        <Card className="border-dashed p-8 text-center text-sm text-muted-foreground">
          Nenhuma consulta prevista neste período.
        </Card>
      ) : (
        <div className="grid gap-3 lg:grid-cols-2">
          {appointments.map((appointment) => {
            const locked =
              appointment.status === "cancelada" ||
              appointment.status === "realizada" ||
              Boolean(appointment.sessionStartedAt || appointment.sessionEndedAt);
            return (
              <Card key={appointment.id} className="p-5">
                <article className="flex h-full flex-col gap-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-semibold">{appointment.patientName}</h3>
                      <p className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                        <CalendarClock aria-hidden="true" className="size-4" />
                        {formatBrazilianDate(appointment.startsAt)} · {formatTime24(appointment.startsAt)}–{formatTime24(appointment.endsAt)}
                      </p>
                      <p className="mt-1 text-sm text-muted-foreground">{appointment.type}</p>
                    </div>
                    <AppointmentStatusBadge status={appointment.status} />
                  </div>
                  <div className="mt-auto flex flex-wrap gap-2">
                    <Button variant="outline" size="sm" onClick={() => onSelect(appointment)}>
                      <Eye aria-hidden="true" className="size-4" />
                      Ver detalhes
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => onEdit(appointment)} disabled={locked}>
                      <CalendarSync aria-hidden="true" className="size-4" />
                      Remarcar
                    </Button>
                    <Button variant="outline" size="sm" className="text-destructive" onClick={() => onCancel(appointment)} disabled={locked}>
                      <XCircle aria-hidden="true" className="size-4" />
                      Cancelar
                    </Button>
                  </div>
                </article>
              </Card>
            );
          })}
        </div>
      )}
    </section>
  );
}
