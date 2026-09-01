import type { Metadata } from "next";
import { PlaceholderPage } from "@/components/marketing/placeholder-page";
import { buildPageMetadata, pageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildPageMetadata({
  ...pageMetadata.placeholder,
  title: "Privacidade em preparação",
  description: "Política de privacidade da Clínica Ágil em preparação para uma versão futura."
});

export default function PrivacyPage() {
  return (
    <PlaceholderPage
      title="Política de privacidade em preparação"
      description="A política completa será definida antes de qualquer uso real de dados clínicos, financeiros ou credenciais. Este placeholder não coleta informações."
      backHref="/"
      backLabel="Voltar para a landing"
    />
  );
}
