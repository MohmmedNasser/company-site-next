// src/lib/metadata.ts
import type { Metadata } from "next";
import { routing } from "@/i18n/routing";

/**
 * Builds the `alternates` block for a page, extending the pattern the
 * locale layout already established (`{ ar: "/ar", en: "/en", "x-default":
 * "/ar" }`) to any route instead of just the site root.
 *
 * Every inner page needs the same three hreflang entries plus a canonical
 * that points at the locale actually being rendered, and getting one of
 * them subtly wrong (a missing x-default, a canonical without the locale
 * prefix) is invisible until a search console flags it — so it's derived
 * here once, from `routing.locales`, rather than retyped per page.
 *
 * @param path Locale-less route, leading slash, no trailing slash: "/about",
 *   "/services/web-development". Pass "" for a locale root.
 */
export function localeAlternates(
  path: string,
  locale: string,
): Metadata["alternates"] {
  const languages = Object.fromEntries(
    routing.locales.map((code) => [code, `/${code}${path}`]),
  );

  return {
    canonical: `/${locale}${path}`,
    languages: {
      ...languages,
      // Matches routing.defaultLocale rather than a hardcoded "ar", so
      // changing the default locale doesn't silently leave x-default
      // pointing at the old one.
      "x-default": `/${routing.defaultLocale}${path}`,
    },
  };
}
