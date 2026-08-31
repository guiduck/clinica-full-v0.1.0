import type { MetadataRoute } from "next";
import { indexableRoutes } from "@/lib/seo/public-routes";
import { siteConfig } from "@/lib/seo/metadata";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  return indexableRoutes.map((route) => ({
    url: new URL(route, siteConfig.url).toString(),
    lastModified: now,
    changeFrequency: route === "/" ? "weekly" : "monthly",
    priority: route === "/" ? 1 : 0.7
  }));
}
