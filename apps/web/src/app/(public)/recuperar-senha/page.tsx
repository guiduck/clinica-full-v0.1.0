import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PasswordRecoveryForm } from "@/components/auth/password-recovery-form";
import { Card } from "@/components/ui/card";
import { buildPageMetadata, pageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildPageMetadata({ ...pageMetadata.placeholder, title: "Recuperar senha", description: "Valide seu e-mail para consultar a disponibilidade da recuperação de senha." });

export default function RecoverPasswordPage() {
  return <main className="flex min-h-screen items-center justify-center bg-background p-4"><Card className="w-full max-w-md p-8 shadow-lg"><Link href="/login" className="mb-4 inline-flex min-h-11 items-center gap-1 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft aria-hidden="true" className="size-3.5" />Voltar para o login</Link><h1 className="text-2xl font-bold">Recuperar senha</h1><p className="mt-1 text-sm text-muted-foreground">Informe seu e-mail para verificar a disponibilidade da redefinição.</p><div className="mt-6"><PasswordRecoveryForm /></div></Card></main>;
}
