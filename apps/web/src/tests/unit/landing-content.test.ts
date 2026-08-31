import { describe, expect, it } from "vitest";
import { landingContent, seoKeywordPhrases } from "../../lib/seo/landing-content";

describe("landingContent", () => {
  it("contains the required audience and module language", () => {
    const visibleCopy = [
      landingContent.heroSubtitle,
      ...landingContent.modules.map((module) => `${module.title} ${module.description}`)
    ].join(" ");

    expect(visibleCopy).toMatch(/psicologos/i);
    expect(visibleCopy).toMatch(/terapeutas/i);
    expect(visibleCopy).toMatch(/psiquiatras/i);
    expect(visibleCopy).toMatch(/pacientes/i);
    expect(visibleCopy).toMatch(/agenda/i);
    expect(visibleCopy).toMatch(/prontuario/i);
    expect(visibleCopy).toMatch(/financeiro/i);
    expect(visibleCopy).toMatch(/documentos/i);
    expect(visibleCopy).toMatch(/lembretes/i);
  });

  it("keeps at least six organic SEO phrases available", () => {
    expect(seoKeywordPhrases).toHaveLength(6);
    expect(seoKeywordPhrases).toEqual(
      expect.arrayContaining([
        "software para psicologos",
        "agenda para terapeutas",
        "prontuario psicologico",
        "gestao de pacientes",
        "financeiro para clinica",
        "recibos para terapeutas"
      ])
    );
  });

  it("routes the primary call to action to login", () => {
    expect(landingContent.primaryCtaHref).toBe("/login");
  });
});
