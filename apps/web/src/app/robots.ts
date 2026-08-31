import type { MetadataRoute } from "next";
import { indexableRoutes, nonIndexableRoutes } from "@/lib/seo/public-routes";
import { siteConfig } from "@/lib/seo/metadata";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: [...indexableRoutes],
        disallow: [...nonIndexableRoutes, "/dashboard", "/app", "/api"]
      }
    ],
    sitemap: `${siteConfig.url}/sitemap.xml`,
    host: siteConfig.url
  };
}
