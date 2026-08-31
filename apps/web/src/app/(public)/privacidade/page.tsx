import type { Metadata } from "next";
import { PlaceholderPage } from "@/components/marketing/placeholder-page";
import { buildPageMetadata, pageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildPageMetadata({
  ...pageMetadata.placeholder,
  title: "Privacidade em preparacao",
  description: "Politica de privacidade da Clinica Agil em preparacao para uma versao futura."
});

export default function PrivacyPage() {
  return (
    <PlaceholderPage
      title="Politica de privacidade em preparacao"
      description="A politica completa sera definida antes de qualquer uso real de dados clinicos, financeiros ou credenciais. Este placeholder nao coleta informacoes."
      backHref="/"
      backLabel="Voltar para a landing"
    />
  );
}
