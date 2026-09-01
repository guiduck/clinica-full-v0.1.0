import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { AuthBrandPanel } from "@/components/auth/auth-brand-panel";
import { LoginForm } from "@/components/auth/login-form";
import { Card } from "@/components/ui/card";
import { SITE_LOGO_TEXT, SITE_NAME } from "@/constants/site";
import { buildPageMetadata, pageMetadata } from "@/lib/seo/metadata";
import { publicRoutes } from "@/lib/seo/public-routes";

export const metadata: Metadata = buildPageMetadata(pageMetadata.login);

export default function LoginPage() {
  return <main className="grid min-h-screen bg-background lg:grid-cols-2"><AuthBrandPanel /><section className="flex items-center justify-center p-6 lg:p-12"><Card className="w-full max-w-md p-8 shadow-lg"><div className="mb-6 flex items-center gap-2 lg:hidden"><span className="grid size-9 place-items-center rounded-xl bg-primary font-bold text-primary-foreground">{SITE_LOGO_TEXT}</span><span className="font-semibold">{SITE_NAME}</span></div><h2 className="text-2xl font-bold">Entrar na sua conta</h2><p className="mt-1 text-sm text-muted-foreground">Acesse seu consultório digital</p><Suspense fallback={null}><div className="mt-6"><LoginForm /></div></Suspense><p className="mt-6 text-center text-sm text-muted-foreground">Não tem conta? <Link className="font-medium text-primary hover:underline" href={publicRoutes.createAccount}>Criar conta</Link></p></Card></section></main>;
}
