type Appointment = {
  id: string;
  startsAt: Date;
  endsAt: Date;
  status: string;
};

const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit"
});

export function PatientAppointmentsSummary({ appointments }: { appointments: Appointment[] }) {
  return (
    <div className="rounded-lg border border-border bg-card p-5">
      <h2 className="font-semibold">Agenda do paciente</h2>
      <div className="mt-4 grid gap-2">
        {appointments.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhuma consulta cadastrada.</p>
        ) : (
          appointments.map((appointment) => (
            <p key={appointment.id} className="text-sm">
              {dateFormatter.format(appointment.startsAt)} - {appointment.status}
            </p>
          ))
        )}
      </div>
    </div>
  );
}
