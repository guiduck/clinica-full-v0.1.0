import type { Metadata } from "next";
import Link from "next/link";
import { RegisterForm } from "@/components/auth/register-form";
import { Card } from "@/components/ui/card";
import { SITE_LOGO_TEXT, SITE_NAME } from "@/constants/site";
import { buildPageMetadata, pageMetadata } from "@/lib/seo/metadata";
import { publicRoutes } from "@/lib/seo/public-routes";

export const metadata: Metadata = buildPageMetadata({ ...pageMetadata.placeholder, title: "Criar conta profissional", description: `Crie sua conta profissional na ${SITE_NAME}.` });

export default function CreateAccountPage() {
  return <main className="flex min-h-screen items-center justify-center bg-background p-4"><Card className="w-full max-w-md p-8 shadow-lg"><div className="mb-6 flex items-center gap-2"><span className="grid size-9 place-items-center rounded-xl bg-primary font-bold text-primary-foreground">{SITE_LOGO_TEXT}</span><span className="font-semibold">{SITE_NAME}</span></div><h1 className="text-2xl font-bold">Criar sua conta</h1><p className="mt-1 text-sm text-muted-foreground">Comece a organizar seu consultório em minutos</p><div className="mt-6"><RegisterForm /></div><p className="mt-6 text-center text-sm text-muted-foreground">Já tem conta? <Link className="font-medium text-primary hover:underline" href={publicRoutes.login}>Entrar</Link></p></Card></main>;
}
