"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { requestPasswordResetAction } from "@/actions/auth";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { passwordRecoverySchema } from "@/utils/validators/auth-email";
import type { z } from "zod";

type Values = z.input<typeof passwordRecoverySchema>;

export function PasswordRecoveryForm() {
  const [result, setResult] = React.useState<{ ok: boolean; message: string } | null>(null);
  const [pending, startTransition] = React.useTransition();
  const { register, handleSubmit, formState: { errors } } = useForm<Values>({ resolver: zodResolver(passwordRecoverySchema), defaultValues: { email: "" } });

  function onSubmit(values: Values) {
    setResult(null);
    startTransition(async () => setResult(await requestPasswordResetAction(values)));
  }

  return <form className="space-y-5" noValidate onSubmit={handleSubmit(onSubmit)}>
    <div className="space-y-2"><Label htmlFor="recovery-email">E-mail</Label><Input id="recovery-email" type="email" autoComplete="email" aria-invalid={Boolean(errors.email)} {...register("email")} />{errors.email ? <p className="text-sm text-destructive">{errors.email.message}</p> : null}</div>
    <Button type="submit" className="w-full" disabled={pending}>{pending ? "Enviando..." : "Enviar link"}</Button>
    {result ? <Alert variant={result.ok ? "default" : "destructive"}><AlertTitle>{result.ok ? "Confira seu e-mail" : "Não foi possível enviar"}</AlertTitle><AlertDescription>{result.message}</AlertDescription></Alert> : null}
  </form>;
}
