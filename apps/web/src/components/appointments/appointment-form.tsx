"use client";
import * as React from "react";
import { useActionState } from "react";
import {
  createAppointmentAction,
  type AppointmentActionState,
} from "@/actions/appointments";
import { Button } from "@/components/ui/button";
import { AppointmentTimeSelect } from "@/components/appointments/appointment-time-select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { maskBrazilianDate } from "@/utils/masks";
type PatientOption = {
  id: string;
  name: string;
  hasCompleteFinancialProfile: boolean;
};
const initialState: AppointmentActionState = { ok: false, message: "" };
function iso(date: string, time: string) {
  const [day, month, year] = date.split("/");
  return day?.length === 2 && month?.length === 2 && year?.length === 4 && time
    ? `${year}-${month}-${day}T${time}`
    : "";
}
export function AppointmentForm({ patients }: { patients: PatientOption[] }) {
  const [state, action, isPending] = useActionState(
    createAppointmentAction,
    initialState,
  );
  const [date, setDate] = React.useState("");
  const [patientId, setPatientId] = React.useState("");
  const [start, setStart] = React.useState("09:00");
  const [end, setEnd] = React.useState("09:50");
  return (
    <Card>
      <CardHeader>
        <CardTitle>Novo agendamento</CardTitle>
        <CardDescription>
          Escolha o paciente, a data e os horários da sessão.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={action} className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="patientId">Paciente</Label>
            <Select name="patientId" value={patientId} onValueChange={setPatientId} required>
              <SelectTrigger id="patientId"><SelectValue placeholder="Selecione" /></SelectTrigger>
              <SelectContent>
              {patients.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.name}
                  {p.hasCompleteFinancialProfile
                    ? ""
                    : " — financeiro pendente"}
                </SelectItem>
              ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="grid gap-2">
              <Label htmlFor="appointment-date">Data</Label>
              <Input
                id="appointment-date"
                inputMode="numeric"
                placeholder="dd/mm/aaaa"
                maxLength={10}
                value={date}
                onChange={(e) => setDate(maskBrazilianDate(e.target.value))}
                required
              />
            </div>
            <AppointmentTimeSelect id="appointment-start" label="Início" value={start} onValueChange={setStart} />
            <AppointmentTimeSelect id="appointment-end" label="Fim" value={end} onValueChange={setEnd} />
          </div>
          <input type="hidden" name="startsAt" value={iso(date, start)} />
          <input type="hidden" name="endsAt" value={iso(date, end)} />
          {state.message ? (
            <p
              className={
                state.ok ? "text-sm text-green-700" : "text-sm text-destructive"
              }
            >
              {state.message}
            </p>
          ) : null}
          <Button type="submit" disabled={isPending}>
            Criar consulta
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
