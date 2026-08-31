"use client";

import { useActionState } from "react";
import {
  upsertPatientFinancialProfileAction,
  type FinancialProfileActionState
} from "@/actions/patient-financial-profile";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initialState: FinancialProfileActionState = {
  ok: false,
  message: ""
};

type InitialProfile = {
  preferredPaymentMethod: string;
  defaultSessionPriceCents: number;
  pixKeyType: string | null;
  pixKey: string | null;
  cardProvider: string | null;
  cardPaymentMethodRef: string | null;
  cardBrand: string | null;
  cardLast4: string | null;
  cardHolderName: string | null;
  insuranceName: string | null;
  insuranceMemberId: string | null;
  insuranceAuthorizationInfo: string | null;
} | null;

export function PatientFinancialProfileForm({
  patientId,
  initialProfile
}: {
  patientId: string;
  initialProfile?: InitialProfile;
}) {
  const [state, action, isPending] = useActionState(
    upsertPatientFinancialProfileAction.bind(null, patientId),
    initialState
  );
  const defaultSessionPrice = initialProfile
    ? (initialProfile.defaultSessionPriceCents / 100).toFixed(2)
    : "";

  return (
    <Card>
      <CardHeader>
        <CardTitle>Dados de pagamento</CardTitle>
        <CardDescription>Escolha o metodo e preencha apenas os dados necessarios.</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={action} className="grid gap-5">
          <div className="grid gap-2">
            <Label htmlFor="preferredPaymentMethod">Metodo preferido</Label>
            <select
              id="preferredPaymentMethod"
              name="preferredPaymentMethod"
              className="min-h-11 rounded-md border border-border bg-background px-3 text-sm"
              defaultValue={initialProfile?.preferredPaymentMethod ?? "pix"}
            >
              <option value="pix">PIX</option>
              <option value="card">Cartao</option>
              <option value="cash">Dinheiro</option>
              <option value="insurance">Convenio</option>
            </select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="defaultSessionPrice">Valor padrao da sessao</Label>
            <Input
              id="defaultSessionPrice"
              name="defaultSessionPrice"
              type="number"
              min="1"
              step="0.01"
              required
              defaultValue={defaultSessionPrice}
            />
          </div>

          <fieldset className="grid gap-3 rounded-md border border-border p-4">
            <legend className="px-1 text-sm font-semibold">PIX</legend>
            <Input name="pixKeyType" placeholder="Tipo da chave" defaultValue={initialProfile?.pixKeyType ?? ""} />
            <Input name="pixKey" placeholder="Chave PIX" defaultValue={initialProfile?.pixKey ?? ""} />
          </fieldset>

          <fieldset className="grid gap-3 rounded-md border border-border p-4">
            <legend className="px-1 text-sm font-semibold">Cartao</legend>
            <Input name="cardProvider" placeholder="Provedor (ex: Stripe)" defaultValue={initialProfile?.cardProvider ?? ""} />
            <Input
              name="cardPaymentMethodRef"
              placeholder="Token/referencia segura"
              defaultValue={initialProfile?.cardPaymentMethodRef ?? ""}
            />
            <Input name="cardBrand" placeholder="Bandeira" defaultValue={initialProfile?.cardBrand ?? ""} />
            <Input
              name="cardLast4"
              placeholder="Ultimos 4 digitos"
              maxLength={4}
              defaultValue={initialProfile?.cardLast4 ?? ""}
            />
            <Input name="cardHolderName" placeholder="Nome no cartao" defaultValue={initialProfile?.cardHolderName ?? ""} />
            <p className="text-xs text-muted-foreground">Nunca informe numero completo ou CVV do cartao.</p>
          </fieldset>

          <fieldset className="grid gap-3 rounded-md border border-border p-4">
            <legend className="px-1 text-sm font-semibold">Convenio</legend>
            <Input name="insuranceName" placeholder="Convenio/pagador" defaultValue={initialProfile?.insuranceName ?? ""} />
            <Input
              name="insuranceMemberId"
              placeholder="Identificacao do paciente"
              defaultValue={initialProfile?.insuranceMemberId ?? ""}
            />
            <Input
              name="insuranceAuthorizationInfo"
              placeholder="Autorizacao ou observacao"
              defaultValue={initialProfile?.insuranceAuthorizationInfo ?? ""}
            />
          </fieldset>

          {state.message ? (
            <p className={state.ok ? "text-sm text-green-700" : "text-sm text-red-700"}>{state.message}</p>
          ) : null}

          <Button type="submit" disabled={isPending}>
            Salvar dados de pagamento
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
