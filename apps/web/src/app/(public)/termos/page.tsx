import type { Metadata } from "next";
import { PlaceholderPage } from "@/components/marketing/placeholder-page";
import { buildPageMetadata, pageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildPageMetadata({
  ...pageMetadata.placeholder,
  title: "Termos de uso em preparacao",
  description: "Termos de uso da Clinica Agil em preparacao para uma versao futura."
});

export default function TermsPage() {
  return (
    <PlaceholderPage
      title="Termos de uso em preparacao"
      description="Este conteudo juridico ainda nao esta finalizado. Por enquanto, a Clinica Agil apresenta apenas o ponto de entrada para revisao futura dos termos."
      backHref="/"
      backLabel="Voltar para a landing"
    />
  );
}
