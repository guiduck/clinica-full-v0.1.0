import { NotificationStatusChip } from "@/components/appointments/notification-status-chip";

type Appointment = {
  id: string;
  startsAt: Date;
  endsAt: Date;
  status: string;
  patient: {
    name: string;
    phone: string;
  };
  notifications: {
    status: "pendente" | "enviado" | "falhou";
  }[];
};

const dayTimeFormatter = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit"
});

const timeFormatter = new Intl.DateTimeFormat("pt-BR", {
  hour: "2-digit",
  minute: "2-digit"
});

export function AgendaList({ appointments }: { appointments: Appointment[] }) {
  if (appointments.length === 0) {
    return <p className="rounded-lg border border-dashed border-border p-6 text-sm text-muted-foreground">Nenhuma consulta cadastrada.</p>;
  }

  return (
    <div className="grid gap-3">
      {appointments.map((appointment) => (
        <article key={appointment.id} className="rounded-lg border border-border bg-card p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-semibold">{appointment.patient.name}</h2>
              <p className="text-sm text-muted-foreground">
                {dayTimeFormatter.format(appointment.startsAt)} ate {timeFormatter.format(appointment.endsAt)}
              </p>
            </div>
            <NotificationStatusChip status={appointment.notifications[0]?.status ?? null} />
          </div>
        </article>
      ))}
    </div>
  );
}
