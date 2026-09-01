"use client";

import { useActionState, useState } from "react";
import { createPatientAction, type PatientActionState } from "@/actions/patients";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { maskBrazilianDate } from "@/utils/masks";

const initialState: PatientActionState = {
  ok: false,
  message: ""
};

export function PatientForm() {
  const [state, action, isPending] = useActionState(createPatientAction, initialState);
  const [birthDate, setBirthDate] = useState("");

  return (
    <Card>
      <CardHeader>
        <CardTitle>Novo paciente</CardTitle>
        <CardDescription>Cadastre os dados essenciais e siga para o financeiro quando quiser.</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={action} className="grid gap-5">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="name">Nome</Label>
              <Input id="name" name="name" required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="phone">Telefone</Label>
              <Input id="phone" name="phone" required placeholder="(11) 99999-9999" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">E-mail</Label>
              <Input id="email" name="email" type="email" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="cpf">CPF</Label>
              <Input id="cpf" name="cpf" inputMode="numeric" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="birthDate">Nascimento</Label>
              <Input id="birthDate" name="birthDate" inputMode="numeric" placeholder="dd/mm/aaaa" maxLength={10} value={birthDate} onChange={(event) => setBirthDate(maskBrazilianDate(event.target.value))} />
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="notes">Observações</Label>
            <Input id="notes" name="notes" />
          </div>

          <label className="flex items-center gap-3 text-sm">
            <Checkbox name="whatsappConsent" />
            Paciente autorizou comunicação por WhatsApp
          </label>

          {state.message ? (
            <p className={state.ok ? "text-sm text-green-700" : "text-sm text-red-700"}>{state.message}</p>
          ) : null}

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button name="intent" value="save" type="submit" disabled={isPending}>
              Salvar
            </Button>
            <Button name="intent" value="save_and_go_to_finance" type="submit" variant="outline" disabled={isPending}>
              Salvar e ir para o financeiro
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
