"use client";

import { useActionState, useState } from "react";
import {
  upsertPatientFinancialProfileAction,
  type FinancialProfileActionState
} from "@/actions/patient-financial-profile";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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
  const [preferredPaymentMethod, setPreferredPaymentMethod] = useState(initialProfile?.preferredPaymentMethod ?? "pix");

  return (
    <Card>
      <CardHeader>
        <CardTitle>Dados de pagamento</CardTitle>
        <CardDescription>Escolha o método e preencha apenas os dados necessários.</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={action} className="grid gap-5">
          <div className="grid gap-2">
            <Label htmlFor="preferredPaymentMethod">Método preferido</Label>
            <Select name="preferredPaymentMethod" value={preferredPaymentMethod} onValueChange={setPreferredPaymentMethod}>
              <SelectTrigger id="preferredPaymentMethod"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="pix">PIX</SelectItem>
                <SelectItem value="card">Cartão</SelectItem>
                <SelectItem value="cash">Dinheiro</SelectItem>
                <SelectItem value="insurance">Convênio</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="defaultSessionPrice">Valor padrão da sessão</Label>
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
            <legend className="px-1 text-sm font-semibold">Cartão</legend>
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
            <Input name="cardHolderName" placeholder="Nome no cartão" defaultValue={initialProfile?.cardHolderName ?? ""} />
            <p className="text-xs text-muted-foreground">Nunca informe número completo ou CVV do cartão.</p>
          </fieldset>

          <fieldset className="grid gap-3 rounded-md border border-border p-4">
            <legend className="px-1 text-sm font-semibold">Convênio</legend>
            <Input name="insuranceName" placeholder="Convênio/pagador" defaultValue={initialProfile?.insuranceName ?? ""} />
            <Input
              name="insuranceMemberId"
              placeholder="Identificação do paciente"
              defaultValue={initialProfile?.insuranceMemberId ?? ""}
            />
            <Input
              name="insuranceAuthorizationInfo"
              placeholder="Autorização ou observação"
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
