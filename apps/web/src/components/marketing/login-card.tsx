"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { HeartPulse } from "lucide-react";
import { useForm } from "react-hook-form";
import { loginAndSetSession } from "@/actions/login";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LegalLinks } from "@/components/marketing/legal-links";
import { PasswordField } from "@/components/marketing/password-field";
import { SITE_NAME } from "@/constants/site";
import { publicRoutes } from "@/lib/seo/public-routes";
import { loginResolver, type LoginInput } from "@/utils/validators/login";

export function LoginCard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [formMessage, setFormMessage] = React.useState<string | null>(null);
  const [formError, setFormError] = React.useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<LoginInput>({
    resolver: loginResolver,
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false
    }
  });

  async function onSubmit(values: LoginInput) {
    setFormError(null);
    setFormMessage(null);

    const result = await loginAndSetSession(values);

    if (result.error) {
      setFormError(result.errorUserMessage);
      return;
    }

    setFormMessage("Login realizado com sucesso.");
    router.push(searchParams.get("next") || publicRoutes.dashboard);
    router.refresh();
  }

  return (
    <Card className="w-full">
      <CardHeader className="text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-md bg-primary text-primary-foreground">
          <HeartPulse className="h-6 w-6" aria-hidden="true" />
        </div>
        <CardTitle>Entrar na {SITE_NAME}</CardTitle>
        <CardDescription>
          Acesse sua area profissional com e-mail e senha cadastrados.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-5" onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="space-y-2">
            <Label htmlFor="email">E-mail</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="voce@clinica.com"
              aria-invalid={Boolean(errors.email)}
              aria-describedby={errors.email ? "email-error" : undefined}
              {...register("email")}
            />
            {errors.email ? (
              <p id="email-error" className="text-sm text-destructive">
                {errors.email.message}
              </p>
            ) : null}
          </div>

          <PasswordField id="password" error={errors.password?.message} register={register("password")} />

          <div className="flex flex-col gap-3 text-sm sm:flex-row sm:items-center sm:justify-between">
            <label className="flex items-center gap-2 text-muted-foreground">
              <Checkbox {...register("rememberMe")} />
              Lembrar deste acesso
            </label>
            <Link className="font-medium text-primary hover:underline" href={publicRoutes.recoverPassword}>
              Esqueci minha senha
            </Link>
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            Entrar
          </Button>

          {formError ? (
            <Alert variant="destructive">
              <AlertTitle>Não foi possível entrar</AlertTitle>
              <AlertDescription>{formError}</AlertDescription>
            </Alert>
          ) : null}

          {formMessage ? (
            <Alert variant="success">
              <AlertTitle>Acesso confirmado</AlertTitle>
              <AlertDescription>{formMessage}</AlertDescription>
            </Alert>
          ) : null}
        </form>

        <div className="mt-6 space-y-5 text-center">
          <p className="text-sm text-muted-foreground">
            Ainda não tem acesso?{" "}
            <Link className="font-semibold text-primary hover:underline" href={publicRoutes.createAccount}>
              Criar conta
            </Link>
          </p>
          <LegalLinks compact />
        </div>
      </CardContent>
    </Card>
  );
}
