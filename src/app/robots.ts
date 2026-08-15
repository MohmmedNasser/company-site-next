// src/app/robots.ts
import type { MetadataRoute } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // /styleguide already 404s in production (src/app/[locale]/
      // styleguide/page.tsx calls notFound() when NODE_ENV === "production")
      // — disallowed here too as defense in depth, so a crawler never
      // indexes it even if that check is ever weakened.
      disallow: "/styleguide",
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
