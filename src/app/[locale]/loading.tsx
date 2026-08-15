// src/app/[locale]/loading.tsx
//
// Segment-level Suspense fallback — shown while a route's data is being
// fetched. A Server Component like any page.tsx, not a Client one: no
// interactivity needed, just a translated label for screen readers.
import { getLocale, getTranslations } from "next-intl/server";
import { Loader2 } from "lucide-react";

export default async function Loading() {
  const locale = await getLocale();
  const t = await getTranslations({ locale, namespace: "common.a11y" });

  return (
    <div
      role="status"
      className="flex min-h-screen flex-col items-center justify-center gap-16"
    >
      {/* motion-reduce: strips the spin instead of hiding the indicator
          outright — prefers-reduced-motion still gets a visible loading
          state, just a static one, same rule every other animation on the
          site follows (CLAUDE.md). */}
      <Loader2
        className="text-text-secondary size-32 animate-spin motion-reduce:animate-none"
        aria-hidden="true"
      />
      <span className="sr-only">{t("loading")}</span>
    </div>
  );
}
