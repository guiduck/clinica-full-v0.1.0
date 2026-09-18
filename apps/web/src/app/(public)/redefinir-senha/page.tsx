import type { Metadata } from "next";
import Link from "next/link";
import { PasswordResetForm } from "@/components/auth/password-reset-form";
import { Card } from "@/components/ui/card";
import { buildPageMetadata, pageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildPageMetadata({ ...pageMetadata.placeholder, title: "Redefinir senha", description: "Crie uma nova senha de acesso à clinica-full." });

export default async function ResetPasswordPage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const { token = "" } = await searchParams;
  return <main className="flex min-h-screen items-center justify-center bg-background p-4"><Card className="w-full max-w-md p-8 shadow-lg"><h1 className="text-2xl font-bold">Criar nova senha</h1><p className="mt-1 text-sm text-muted-foreground">O link pode ser usado apenas uma vez.</p><div className="mt-6"><PasswordResetForm token={token} /></div><p className="mt-6 text-center text-sm"><Link className="text-primary hover:underline" href="/login">Voltar para o login</Link></p></Card></main>;
}
