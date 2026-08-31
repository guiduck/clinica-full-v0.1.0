"use client";
import * as React from "react";
import { useActionState } from "react";
import {
  createAppointmentAction,
  type AppointmentActionState,
} from "@/actions/appointments";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  const [start, setStart] = React.useState("");
  const [end, setEnd] = React.useState("");
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
            <select
              id="patientId"
              name="patientId"
              className="min-h-11 rounded-md border bg-background px-3 text-sm"
              required
            >
              <option value="">Selecione</option>
              {patients.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                  {p.hasCompleteFinancialProfile
                    ? ""
                    : " — financeiro pendente"}
                </option>
              ))}
            </select>
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
            <div className="grid gap-2">
              <Label htmlFor="appointment-start">Início</Label>
              <Input
                id="appointment-start"
                type="time"
                lang="pt-BR"
                value={start}
                onChange={(e) => setStart(e.target.value)}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="appointment-end">Fim</Label>
              <Input
                id="appointment-end"
                type="time"
                lang="pt-BR"
                value={end}
                onChange={(e) => setEnd(e.target.value)}
                required
              />
            </div>
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
