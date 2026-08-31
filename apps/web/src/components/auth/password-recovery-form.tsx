"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CapabilityNotice } from "@/components/feedback/capability-notice";
import { CAPABILITIES } from "@/components/feedback/capabilities";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const schema = z.object({ email: z.string().trim().min(1, "Informe seu e-mail.").email("Digite um e-mail válido.") });
type Values = z.input<typeof schema>;

export function PasswordRecoveryForm() {
  const [noticeOpen, setNoticeOpen] = React.useState(false);
  const submitButtonRef = React.useRef<HTMLButtonElement>(null);
  const { register, handleSubmit, watch, formState: { errors } } = useForm<Values>({ resolver: zodResolver(schema), defaultValues: { email: "" } });
  const handleNoticeOpenChange = (open: boolean) => {
    setNoticeOpen(open);
    if (!open) window.setTimeout(() => submitButtonRef.current?.focus(), 0);
  };
  return (
    <><form className="space-y-5" noValidate onSubmit={handleSubmit(() => setNoticeOpen(true))}><div className="space-y-2"><Label htmlFor="recovery-email">E-mail</Label><Input id="recovery-email" type="email" autoComplete="email" aria-invalid={Boolean(errors.email)} {...register("email")} />{errors.email ? <p className="text-sm text-destructive">{errors.email.message}</p> : null}</div><Button ref={submitButtonRef} type="submit" className="w-full" onClick={() => { if (schema.safeParse({ email: watch("email") }).success) setNoticeOpen(true); }}>Enviar link</Button></form><CapabilityNotice descriptor={CAPABILITIES.passwordRecovery} open={noticeOpen} onOpenChange={handleNoticeOpenChange} /></>
  );
}
