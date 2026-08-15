// src/app/[locale]/error.tsx
//
// Next.js requires error boundaries to be Client Components (they receive
// a `reset` callback and mount in place of whatever segment threw) — this
// still renders inside [locale]/layout.tsx, so NextIntlClientProvider and
// every token/class below are available exactly as on any other page.
"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import Button from "@/components/ui/button";

export default function LocaleError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations("error");

  useEffect(() => {
    // Next.js's own error-reporting hook — kept here rather than swallowed,
    // since this is the only place a render-time error is guaranteed to
    // surface once the boundary catches it.
    console.error(error);
  }, [error]);

  return (
    <main className="mx-auto flex min-h-screen max-w-[1280px] flex-col items-center justify-center gap-16 px-24 text-center">
      <p className="text-primary text-14 font-mono">ERR</p>
      <h1 className="text-32 text-text-primary font-semibold">{t("title")}</h1>
      <p className="text-16 text-text-secondary max-w-[480px]">
        {t("description")}
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-16">
        <Button onClick={reset} size="default">
          {t("retry")}
        </Button>
        <Link
          href="/"
          className="rounded-control border-border text-14 text-text-primary hover:bg-surface duration-micro border px-16 py-8 transition-colors"
        >
          {t("backHome")}
        </Link>
      </div>
    </main>
  );
}
