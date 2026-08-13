// src/lib/format-date.ts

/**
 * Formats a `Post.publishedAt` ISO date (YYYY-MM-DD) for display.
 *
 * TWO THINGS HERE ARE LOAD-BEARING, both of them bugs if left to defaults:
 *
 * 1. `-u-nu-latn` on the Arabic locale. Intl defaults Arabic to Eastern
 *    Arabic numerals (١٢٣). This project's numeral decision is Western
 *    digits in both locales — the same rule SiteSettings.hero.trust and
 *    TimelineEntry.year already follow by storing plain strings — so the
 *    numbering system is pinned explicitly rather than inherited.
 *
 * 2. `timeZone: "UTC"`. "2026-06-15" parses as UTC midnight, so formatting
 *    it in a local zone behind UTC renders the 14th. That would also differ
 *    between the server (UTC) and a visitor's browser, producing a
 *    hydration mismatch on every post — pinning the zone makes the output
 *    identical everywhere.
 */
export function formatPostDate(isoDate: string, locale: string): string {
  const tag = locale === "ar" ? "ar-EG-u-nu-latn" : "en-GB";

  return new Intl.DateTimeFormat(tag, {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${isoDate}T00:00:00Z`));
}
