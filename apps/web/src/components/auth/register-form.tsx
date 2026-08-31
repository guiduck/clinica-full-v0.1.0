"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { registerAndLogin } from "@/actions/auth";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { publicRoutes } from "@/lib/seo/public-routes";
import { maskCpf } from "@/utils/masks";
import { registerResolver, type RegisterInput } from "@/utils/validators/register";

export function RegisterForm() {
  const router = useRouter();
  const [formError, setFormError] = React.useState<string | null>(null);
  const { register, handleSubmit, setValue, watch, formState: { errors, isSubmitting } } = useForm<RegisterInput>({ resolver: registerResolver, defaultValues: { name: "", email: "", cpf: "", password: "", acceptedTerms: false } });
  const cpfRegistration = register("cpf");
  const cpf = watch("cpf");

  async function onSubmit(values: RegisterInput) {
    setFormError(null);
    const result = await registerAndLogin(values);
    if (result.error) { setFormError(result.errorUserMessage); return; }
    router.push(publicRoutes.dashboard);
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
      <div className="space-y-2"><Label htmlFor="name">Nome completo</Label><Input id="name" autoComplete="name" placeholder="Dra. Mariana Lopes" aria-invalid={Boolean(errors.name)} {...register("name")} />{errors.name ? <p className="text-sm text-destructive">{errors.name.message}</p> : null}</div>
      <div className="space-y-2"><Label htmlFor="register-email">E-mail profissional</Label><Input id="register-email" type="email" autoComplete="email" placeholder="seu@email.com" aria-invalid={Boolean(errors.email)} {...register("email")} />{errors.email ? <p className="text-sm text-destructive">{errors.email.message}</p> : null}</div>
      <div className="space-y-2"><Label htmlFor="cpf">CPF</Label><Input id="cpf" inputMode="numeric" autoComplete="off" maxLength={14} placeholder="000.000.000-00" value={maskCpf(cpf)} name={cpfRegistration.name} ref={cpfRegistration.ref} onBlur={cpfRegistration.onBlur} onChange={(event) => setValue("cpf", event.target.value.replace(/\D/g, ""), { shouldDirty: true, shouldValidate: true })} aria-invalid={Boolean(errors.cpf)} />{errors.cpf ? <p className="text-sm text-destructive">{errors.cpf.message}</p> : null}</div>
      <div className="space-y-2"><Label htmlFor="register-password">Senha</Label><Input id="register-password" type="password" autoComplete="new-password" placeholder="Mínimo 8 caracteres" aria-invalid={Boolean(errors.password)} {...register("password")} />{errors.password ? <p className="text-sm text-destructive">{errors.password.message}</p> : null}</div>
      <div><label className="flex items-start gap-2 text-sm leading-5"><Checkbox aria-label="Aceito os Termos de Uso e a Política de Privacidade" checked={Boolean(watch("acceptedTerms"))} onCheckedChange={(checked) => setValue("acceptedTerms", checked === true, { shouldDirty: true, shouldValidate: true })} /><span>Aceito os <Link className="font-semibold text-primary hover:underline" href={publicRoutes.terms}>Termos de Uso</Link> e a <Link className="font-semibold text-primary hover:underline" href={publicRoutes.privacy}>Política de Privacidade</Link>, incluindo o tratamento de dados sensíveis conforme a LGPD.</span></label>{errors.acceptedTerms ? <p className="mt-2 text-sm text-destructive">{errors.acceptedTerms.message}</p> : null}</div>
      <Button type="submit" className="w-full" disabled={isSubmitting}>Criar conta</Button>
      {formError ? <Alert variant="destructive"><AlertTitle>Não foi possível criar a conta</AlertTitle><AlertDescription>{formError}</AlertDescription></Alert> : null}
    </form>
  );
}
