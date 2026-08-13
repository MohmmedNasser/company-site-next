import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";

/**
 * Catch-all for any path under a valid locale that matches no real page —
 * a plain mistyped URL, not a record lookup failure (those call
 * `notFound()` from inside their own `[slug]` page, e.g.
 * `services/[slug]/page.tsx`).
 *
 * WHY THIS FILE HAS TO EXIST: without it, an unmatched sub-path (anything
 * from a typo like `/en/servces` to a stray `/en/foo/bar`) has no `page.tsx`
 * for Next.js to match, and the framework has no segment boundary to hang
 * the 404 on — confirmed live (curl against `pnpm start`) to escalate past
 * the nearer `[locale]/not-found.tsx` all the way to the ROOT
 * `app/not-found.tsx`, which supplies its OWN `<html>/<body>` because it
 * has to be able to render standalone (see that file's comment) for the
 * one case it was actually built for: an unrecognized LOCALE segment,
 * before `[locale]/layout.tsx` has run at all. But `[locale]/layout.tsx`
 * HAD already run here (the locale itself was valid) and already rendered
 * its own `<html>/<body>` — so the root file's document tags landed nested
 * inside the layout's, live-verified as two `<html>` and two `<body>` tags
 * in the actual served HTML for a plain `/en/typo` request. Every ordinary
 * mistyped URL was serving invalid markup and the wrong (bilingual,
 * locale-ignoring) not-found page instead of the correctly translated one.
 *
 * This file gives Next.js an actual matched segment — a real `page.tsx` —
 * for any such sub-path, which resolves the 404 to the nearest boundary
 * instead: `[locale]/not-found.tsx`, already rendered inside the layout's
 * existing document. `notFound()` is called immediately; this component
 * never returns real markup of its own.
 */
export default async function CatchAll({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  // Matches every other page's pattern (see e.g. about/page.tsx) — without
  // this, next-intl falls back to dynamic rendering for the translations
  // `[locale]/not-found.tsx` reads once notFound() hands off to it.
  setRequestLocale(locale);
  notFound();
}
