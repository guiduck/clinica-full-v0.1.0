import type { Metadata } from "next";
import { SITE_DEFAULT_URL, SITE_NAME } from "@/constants/site";
import { landingContent, seoKeywordPhrases } from "@/lib/seo/landing-content";
import { publicRoutes } from "@/lib/seo/public-routes";

export const siteConfig = {
  name: SITE_NAME,
  url: process.env.NEXT_PUBLIC_SITE_URL ?? SITE_DEFAULT_URL,
  description:
    `${SITE_NAME} é um software para psicólogos, terapeutas e psiquiatras autônomos organizarem pacientes, agenda, prontuário, financeiro, documentos e recibos.`
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
    title: "Software para psicólogos e terapeutas autônomos",
    description:
      "Software para psicólogos e terapeutas: organize pacientes, agenda, prontuário psicológico, financeiro da clínica, documentos, recibos e lembretes.",
    canonicalPath: publicRoutes.landing,
    keywords: seoKeywordPhrases,
    indexable: true
  },
  login: {
    title: "Login profissional",
    description:
      `Acesse a entrada profissional da ${SITE_NAME} com e-mail, senha e sessão segura server-side.`,
    canonicalPath: publicRoutes.login,
    keywords: [`login ${SITE_NAME}`, "acesso profissional", ...seoKeywordPhrases],
    indexable: true
  },
  placeholder: {
    title: "Página em preparação",
    description: `Esta área da ${SITE_NAME} está em preparação e ainda não executa serviços reais.`,
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
