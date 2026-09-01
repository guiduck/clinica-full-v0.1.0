import type { Metadata } from "next";
import { PlaceholderPage } from "@/components/marketing/placeholder-page";
import { SITE_NAME } from "@/constants/site";
import { buildPageMetadata, pageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildPageMetadata({
  ...pageMetadata.placeholder,
  title: "Termos de uso em preparação",
  description: `Termos de uso da ${SITE_NAME} em preparação para uma versão futura.`
});

export default function TermsPage() {
  return (
    <PlaceholderPage
      title="Termos de uso em preparação"
      description={`Este conteúdo jurídico ainda não está finalizado. Por enquanto, a ${SITE_NAME} apresenta apenas o ponto de entrada para revisão futura dos termos.`}
      backHref="/"
      backLabel="Voltar para a landing"
    />
  );
}
