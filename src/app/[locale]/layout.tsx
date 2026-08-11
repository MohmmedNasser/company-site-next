import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { content, pick } from "@/lib/content";
import { SmoothScrollProvider } from "@/components/providers/smooth-scroll-provider";
import { ThemeProvider } from "@/components/providers/theme-provider";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { sansLatin, jetbrainsMono, notoKufi } from "../fonts";
import "../globals.css";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const settings = await content.getSettings();
  const title = pick(settings.hero.title, locale);
  const description = pick(settings.hero.subtitle, locale);

  return {
    metadataBase: new URL(
      process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
    ),
    title: { default: title, template: `%s · ${title}` },
    description,
    alternates: {
      languages: {
        ar: "/ar",
        en: "/en",
        "x-default": "/ar",
      },
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    // Thrown before <html> renders below — src/app/not-found.tsx (the root
    // fallback, outside this segment) supplies the <html>/<body> for this
    // case, since no layout above this one exists to do it.
    notFound();
  }

  setRequestLocale(locale);

  // Fetched here, not inside Header/Footer: src/lib/content is server-only
  // (commit 40aa665), and Header/MobileNav are client components — passing
  // settings down as a prop is the only way they can use this data without
  // importing the content repository directly. Footer is a Server
  // Component itself but takes the same prop for one fetch shared by both,
  // rather than each doing its own.
  const [settings, t] = await Promise.all([
    content.getSettings(),
    getTranslations({ locale, namespace: "common" }),
  ]);

  return (
    <html
      lang={locale}
      dir={locale === "ar" ? "rtl" : "ltr"}
      className={`${sansLatin.variable} ${notoKufi.variable} ${jetbrainsMono.variable}`}
      suppressHydrationWarning
    >
      {/* suppressHydrationWarning here for the same reason as <html> above:
          browser extensions (e.g. ColorZilla's cz-shortcut-listen) inject
          attributes onto <body> before React hydrates. That's noise from
          the client environment, not a real server/client markup mismatch,
          so it gets the same one-level-deep suppression instead of being
          left to fail this warning on every load. */}
      <body suppressHydrationWarning>
        {/* First focusable element in the document — invisible until it
            receives keyboard focus, then pinned to the top of the viewport.
            Bypasses Header's nav entirely for keyboard users. */}
        <a
          href="#main-content"
          // top-96, not top-16: Header is now a floating pill fixed at
          // top-16 (up to 64px tall) — top-16 here would land the skip
          // link directly under/over it. 96px clears the pill plus a
          // margin regardless of its condensed (52px) or expanded (64px)
          // height.
          className="bg-primary text-on-primary rounded-control sr-only px-16 py-8 focus:not-sr-only focus:fixed focus:inset-s-16 focus:top-96 focus:z-60"
        >
          {t("a11y.skipToContent")}
        </a>
        <SmoothScrollProvider>
          <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
            <NextIntlClientProvider>
              <Header />
              <main id="main-content">{children}</main>
              <Footer settings={settings} />
            </NextIntlClientProvider>
          </ThemeProvider>
        </SmoothScrollProvider>
      </body>
    </html>
  );
}
