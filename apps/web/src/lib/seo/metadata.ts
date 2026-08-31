import type { Metadata } from "next";
import { landingContent, seoKeywordPhrases } from "@/lib/seo/landing-content";
import { publicRoutes } from "@/lib/seo/public-routes";

export const siteConfig = {
  name: "Clinica Agil",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://clinicaagil.com.br",
  description:
    "Clinica Agil e um software para psicologos, terapeutas e psiquiatras autonomos organizarem pacientes, agenda, prontuario, financeiro, documentos e recibos."
};

type PageMetadata = {
  title: string;
  description: string;
  canonicalPath: string;
  keywords: readonly string[];
  indexable: boolean;
};

export const pageMetadata = {
  landing: {
    title: "Software para psicologos e terapeutas autonomos",
    description:
      "Software para psicologos e terapeutas: organize pacientes, agenda para terapeutas, prontuario psicologico, financeiro para clinica, documentos, recibos e lembretes.",
    canonicalPath: publicRoutes.landing,
    keywords: seoKeywordPhrases,
    indexable: true
  },
  login: {
    title: "Login profissional",
    description:
      "Acesse a entrada profissional da Clinica Agil com e-mail, senha e sessao segura server-side.",
    canonicalPath: publicRoutes.login,
    keywords: ["login Clinica Agil", "acesso profissional", ...seoKeywordPhrases],
    indexable: true
  },
  placeholder: {
    title: "Pagina em preparacao",
    description: "Esta area da Clinica Agil esta em preparacao e ainda nao executa servicos reais.",
    canonicalPath: publicRoutes.landing,
    keywords: [],
    indexable: false
  }
} satisfies Record<string, PageMetadata>;

export function buildPageMetadata(page: PageMetadata): Metadata {
  const canonical = new URL(page.canonicalPath, siteConfig.url).toString();

  return {
    title: page.title,
    description: page.description,
    keywords: [...page.keywords],
    alternates: {
      canonical
    },
    robots: page.indexable ? { index: true, follow: true } : { index: false, follow: false },
    openGraph: {
      type: "website",
      locale: "pt_BR",
      siteName: siteConfig.name,
      title: `${page.title} | ${siteConfig.name}`,
      description: page.description,
      url: canonical
    },
    twitter: {
      card: "summary_large_image",
      title: `${page.title} | ${siteConfig.name}`,
      description: page.description
    }
  };
}

export const landingStructuredSummary = [
  landingContent.heroSubtitle,
  ...landingContent.modules.map((module) => `${module.title}: ${module.description}`),
  ...landingContent.trustStatements
].join(" ");
