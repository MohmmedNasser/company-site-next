// src/lib/structured-data.ts
//
// Plain JSON-LD object builders — rendered via
// src/components/seo/json-ld.tsx. Kept separate from src/lib/metadata.ts
// (which builds Next's own <head> Metadata object) because JSON-LD is a
// <script> tag in the body, not part of the Metadata API.
import type { SiteSettings } from "./content/types";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

// Brand name, not translated content — same hardcoded "Codexa" the header
// logo lockup and OG image wordmark already use (src/components/layout/
// header.tsx, src/lib/og/template.tsx).
const SITE_NAME = "Codexa";

export function absoluteUrl(locale: string, path = ""): string {
  return `${SITE_URL}/${locale}${path}`;
}

export function organizationJsonLd(settings: SiteSettings, locale: string) {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: absoluteUrl(locale),
    logo: `${SITE_URL}/brand/codexa-mark.svg`,
    sameAs: settings.social.map((entry) => entry.url),
  };
}

export function websiteJsonLd(locale: string) {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: absoluteUrl(locale),
  };
}

export interface BreadcrumbItem {
  /** Already-translated label, not a translation key. */
  name: string;
  /** Locale-less path, leading slash, no trailing slash — "" for the home entry. */
  path: string;
}

export function breadcrumbJsonLd(items: BreadcrumbItem[], locale: string) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(locale, item.path),
    })),
  };
}

export function articleJsonLd({
  headline,
  datePublished,
  author,
  url,
  image,
}: {
  headline: string;
  datePublished: string;
  author: string;
  url: string;
  image?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline,
    datePublished,
    author: { "@type": "Person", name: author },
    mainEntityOfPage: url,
    ...(image ? { image } : {}),
  };
}
