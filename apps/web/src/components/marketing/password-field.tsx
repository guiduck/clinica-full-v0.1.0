"use client";

import * as React from "react";
import { Eye, EyeOff } from "lucide-react";
import type { UseFormRegisterReturn } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type PasswordFieldProps = {
  id: string;
  error?: string;
  autoComplete?: string;
  register: UseFormRegisterReturn;
};

export function PasswordField({ id, error, autoComplete = "current-password", register }: PasswordFieldProps) {
  const [visible, setVisible] = React.useState(false);
  const Icon = visible ? EyeOff : Eye;

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>Senha</Label>
      <div className="flex gap-2">
        <Input
          id={id}
          type={visible ? "text" : "password"}
          autoComplete={autoComplete}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-error` : undefined}
          {...register}
        />
        <Button
          type="button"
          variant="outline"
          size="icon"
          aria-label={visible ? "Ocultar senha" : "Mostrar senha"}
          onClick={() => setVisible((current) => !current)}
        >
          <Icon className="h-4 w-4" aria-hidden="true" />
        </Button>
      </div>
      {error ? (
        <p id={`${id}-error`} className="text-sm text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  );
}
