import { describe, expect, it } from "vitest";
import robots from "../../app/robots";
import sitemap from "../../app/sitemap";
import { pageMetadata, siteConfig } from "../../lib/seo/metadata";
import { indexableRoutes, nonIndexableRoutes } from "../../lib/seo/public-routes";

describe("public SEO boundary", () => {
  it("includes only landing and login in the sitemap", () => {
    const entries = sitemap();
    const paths = entries.map((entry) => new URL(entry.url).pathname);

    expect(paths).toEqual([...indexableRoutes]);
    expect(paths).not.toEqual(expect.arrayContaining([...nonIndexableRoutes]));
  });

  it("allows indexable routes and disallows non-indexable routes in robots", () => {
    const rules = robots().rules;
    const firstRule = Array.isArray(rules) ? rules[0] : rules;

    expect(firstRule.allow).toEqual([...indexableRoutes]);
    expect(firstRule.disallow).toEqual(expect.arrayContaining([...nonIndexableRoutes]));
  });

  it("defines meaningful metadata for landing and login", () => {
    expect(pageMetadata.landing.indexable).toBe(true);
    expect(pageMetadata.login.indexable).toBe(true);
    expect(pageMetadata.landing.description.toLowerCase()).toContain("software para psicólogos");
    expect(pageMetadata.login.description).toContain("clinica-full");
    expect(siteConfig.description).toContain("prontuário");
    expect(siteConfig.name).toBe("clinica-full");
    expect(siteConfig.url).toBe("https://clinica-full.gfig.space");
  });
});
