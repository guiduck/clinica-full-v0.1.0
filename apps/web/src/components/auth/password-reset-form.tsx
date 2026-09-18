"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { resetPasswordAction } from "@/actions/auth";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { passwordResetSchema } from "@/utils/validators/auth-email";
import type { z } from "zod";

type Values = z.input<typeof passwordResetSchema>;

export function PasswordResetForm({ token }: { token: string }) {
  const router = useRouter();
  const [result, setResult] = React.useState<{ ok: boolean; message: string } | null>(null);
  const [pending, startTransition] = React.useTransition();
  const { register, handleSubmit, formState: { errors } } = useForm<Values>({ resolver: zodResolver(passwordResetSchema), defaultValues: { token, password: "", confirmPassword: "" } });

  function onSubmit(values: Values) {
    setResult(null);
    startTransition(async () => {
      const next = await resetPasswordAction(values);
      setResult(next);
      if (next.ok) window.setTimeout(() => router.push("/login?reset=1"), 900);
    });
  }

  return <form className="space-y-5" noValidate onSubmit={handleSubmit(onSubmit)}>
    <input type="hidden" {...register("token")} />
    <div className="space-y-2"><Label htmlFor="new-password">Nova senha</Label><Input id="new-password" type="password" autoComplete="new-password" aria-invalid={Boolean(errors.password)} {...register("password")} />{errors.password ? <p className="text-sm text-destructive">{errors.password.message}</p> : null}</div>
    <div className="space-y-2"><Label htmlFor="confirm-password">Confirmar nova senha</Label><Input id="confirm-password" type="password" autoComplete="new-password" aria-invalid={Boolean(errors.confirmPassword)} {...register("confirmPassword")} />{errors.confirmPassword ? <p className="text-sm text-destructive">{errors.confirmPassword.message}</p> : null}</div>
    <Button type="submit" className="w-full" disabled={pending || !token}>{pending ? "Salvando..." : "Salvar nova senha"}</Button>
    {result ? <Alert variant={result.ok ? "default" : "destructive"}><AlertTitle>{result.ok ? "Senha alterada" : "Não foi possível alterar"}</AlertTitle><AlertDescription>{result.message}</AlertDescription></Alert> : null}
  </form>;
}
