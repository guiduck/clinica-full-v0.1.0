"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { requestPasswordResetAction, resetPasswordWithCodeAction } from "@/actions/auth";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { passwordRecoverySchema, passwordResetCodeSchema } from "@/utils/validators/auth-email";
import type { z } from "zod";

type RecoveryValues = z.input<typeof passwordRecoverySchema>;
type ResetValues = z.input<typeof passwordResetCodeSchema>;

function PasswordCodeResetForm({ email, onUseAnotherEmail }: { email: string; onUseAnotherEmail: () => void }) {
  const router = useRouter();
  const [result, setResult] = React.useState<{ ok: boolean; message: string } | null>(null);
  const [pending, startTransition] = React.useTransition();
  const { register, handleSubmit, formState: { errors } } = useForm<ResetValues>({
    resolver: zodResolver(passwordResetCodeSchema),
    defaultValues: { email, code: "", password: "", confirmPassword: "" },
  });

  function onSubmit(values: ResetValues) {
    setResult(null);
    startTransition(async () => {
      const next = await resetPasswordWithCodeAction(values);
      setResult(next);
      if (next.ok) window.setTimeout(() => router.push("/login?reset=1"), 900);
    });
  }

  return <form className="space-y-5" noValidate onSubmit={handleSubmit(onSubmit)}>
    <input type="hidden" {...register("email")} />
    <Alert>
      <AlertTitle>Confira seu e-mail</AlertTitle>
      <AlertDescription>Se a conta existir, enviamos um código de 6 números para {email}. Ele vale por 15 minutos.</AlertDescription>
    </Alert>
    <div className="space-y-2">
      <Label htmlFor="recovery-code">Código de verificação</Label>
      <Input id="recovery-code" inputMode="numeric" autoComplete="one-time-code" maxLength={6} aria-invalid={Boolean(errors.code)} {...register("code")} />
      {errors.code && <p className="text-sm text-destructive">{errors.code.message}</p>}
    </div>
    <div className="space-y-2">
      <Label htmlFor="recovery-new-password">Nova senha</Label>
      <Input id="recovery-new-password" type="password" autoComplete="new-password" aria-invalid={Boolean(errors.password)} {...register("password")} />
      {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
    </div>
    <div className="space-y-2">
      <Label htmlFor="recovery-confirm-password">Confirmar nova senha</Label>
      <Input id="recovery-confirm-password" type="password" autoComplete="new-password" aria-invalid={Boolean(errors.confirmPassword)} {...register("confirmPassword")} />
      {errors.confirmPassword && <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>}
    </div>
    <Button type="submit" className="w-full" disabled={pending}>{pending ? "Salvando..." : "Redefinir senha"}</Button>
    <Button type="button" variant="ghost" className="w-full" disabled={pending} onClick={onUseAnotherEmail}>Usar outro e-mail</Button>
    {result && <Alert variant={result.ok ? "default" : "destructive"}><AlertTitle>{result.ok ? "Senha alterada" : "Não foi possível alterar"}</AlertTitle><AlertDescription>{result.message}</AlertDescription></Alert>}
  </form>;
}

export function PasswordRecoveryForm() {
  const [requestedEmail, setRequestedEmail] = React.useState("");
  const [result, setResult] = React.useState<{ ok: boolean; message: string } | null>(null);
  const [pending, startTransition] = React.useTransition();
  const { register, handleSubmit, formState: { errors } } = useForm<RecoveryValues>({
    resolver: zodResolver(passwordRecoverySchema),
    defaultValues: { email: "" },
  });

  function onSubmit(values: RecoveryValues) {
    setResult(null);
    startTransition(async () => {
      const next = await requestPasswordResetAction(values);
      setResult(next);
      if (next.ok) setRequestedEmail(values.email.trim().toLowerCase());
    });
  }

  if (requestedEmail) {
    return <PasswordCodeResetForm email={requestedEmail} onUseAnotherEmail={() => setRequestedEmail("")} />;
  }

  return <form className="space-y-5" noValidate onSubmit={handleSubmit(onSubmit)}>
    <div className="space-y-2">
      <Label htmlFor="recovery-email">E-mail</Label>
      <Input id="recovery-email" type="email" autoComplete="email" aria-invalid={Boolean(errors.email)} {...register("email")} />
      {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
    </div>
    <Button type="submit" className="w-full" disabled={pending}>{pending ? "Enviando..." : "Enviar código"}</Button>
    {result && <Alert variant="destructive"><AlertTitle>Não foi possível enviar</AlertTitle><AlertDescription>{result.message}</AlertDescription></Alert>}
  </form>;
}
