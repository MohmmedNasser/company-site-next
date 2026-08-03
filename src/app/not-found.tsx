// Reached only when app/[locale]/layout.tsx calls notFound() for an
// unrecognized locale segment (e.g. a request for "/fr") — at that point
// no layout in the tree has rendered <html> yet, so this file must supply
// its own complete document. This mirrors Next.js's documented pattern for
// a root layout under a dynamic segment (docs/app/api-reference/
// file-conventions/not-found.md — "the root app/not-found.js ... handle[s]
// any unmatched URLs for your whole application").
//
// This file cannot call useTranslations()/getTranslations(): it renders
// precisely when locale resolution has failed, before
// NextIntlClientProvider or any request-locale context exists — there is
// no "current locale" to translate into. Do not "fix" this into a
// translation-key call; it will throw at runtime with no locale in scope.
// Both languages are hardcoded side by side instead, since a real visitor
// landing here (a mistyped locale prefix) may read only Arabic.
import Link from "next/link";
import "./globals.css";
import { inter, jetbrainsMono, notoKufi } from "./fonts";

export default function RootNotFound() {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${notoKufi.variable} ${jetbrainsMono.variable}`}
    >
      <body className="bg-bg text-text-primary flex min-h-screen flex-col items-center justify-center gap-16 px-24 text-center">
        <p className="text-primary text-14 font-mono">404</p>
        <h1 className="text-32 font-semibold">
          <span lang="en">Page not found</span>
          {" / "}
          <span lang="ar" dir="rtl">
            الصفحة غير موجودة
          </span>
        </h1>
        <p className="text-text-secondary text-16 max-w-[480px]" lang="en">
          The page you&rsquo;re looking for doesn&rsquo;t exist.
        </p>
        <p
          className="text-text-secondary text-16 max-w-[480px]"
          lang="ar"
          dir="rtl"
        >
          الصفحة التي تبحث عنها غير موجودة.
        </p>
        <Link
          href="/ar"
          className="rounded-control border-border text-14 text-text-primary hover:bg-surface border px-16 py-8"
        >
          <span lang="en">Back home</span>
          {" / "}
          <span lang="ar" dir="rtl">
            العودة للرئيسية
          </span>
        </Link>
      </body>
    </html>
  );
}
