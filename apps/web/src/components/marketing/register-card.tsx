"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { HeartPulse } from "lucide-react";
import { useForm } from "react-hook-form";
import { registerAndLogin } from "@/actions/auth";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordField } from "@/components/marketing/password-field";
import { publicRoutes } from "@/lib/seo/public-routes";
import { registerResolver, type RegisterInput } from "@/utils/validators/register";

export function RegisterCard() {
  const router = useRouter();
  const [formError, setFormError] = React.useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<RegisterInput>({
    resolver: registerResolver,
    defaultValues: {
      name: "",
      email: "",
      password: ""
    }
  });

  async function onSubmit(values: RegisterInput) {
    setFormError(null);
    const result = await registerAndLogin(values);

    if (result.error) {
      setFormError(result.errorUserMessage);
      return;
    }

    router.push(publicRoutes.dashboard);
    router.refresh();
  }

  return (
    <Card className="w-full">
      <CardHeader className="text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-md bg-primary text-primary-foreground">
          <HeartPulse className="h-6 w-6" aria-hidden="true" />
        </div>
        <CardTitle>Criar conta profissional</CardTitle>
        <CardDescription>Comece com uma conta individual para terapeuta autonomo.</CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-5" onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="space-y-2">
            <Label htmlFor="name">Nome</Label>
            <Input
              id="name"
              autoComplete="name"
              placeholder="Seu nome profissional"
              aria-invalid={Boolean(errors.name)}
              aria-describedby={errors.name ? "name-error" : undefined}
              {...register("name")}
            />
            {errors.name ? (
              <p id="name-error" className="text-sm text-destructive">
                {errors.name.message}
              </p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="register-email">E-mail</Label>
            <Input
              id="register-email"
              type="email"
              autoComplete="email"
              placeholder="voce@clinica.com"
              aria-invalid={Boolean(errors.email)}
              aria-describedby={errors.email ? "register-email-error" : undefined}
              {...register("email")}
            />
            {errors.email ? (
              <p id="register-email-error" className="text-sm text-destructive">
                {errors.email.message}
              </p>
            ) : null}
          </div>

          <PasswordField
            id="register-password"
            autoComplete="new-password"
            error={errors.password?.message}
            register={register("password")}
          />

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            Criar conta e entrar
          </Button>

          {formError ? (
            <Alert variant="destructive">
              <AlertTitle>Não foi possível criar a conta</AlertTitle>
              <AlertDescription>{formError}</AlertDescription>
            </Alert>
          ) : null}
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Ja tem conta?{" "}
          <Link className="font-semibold text-primary hover:underline" href={publicRoutes.login}>
            Entrar
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
