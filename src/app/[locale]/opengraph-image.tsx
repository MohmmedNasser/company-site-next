// src/app/[locale]/opengraph-image.tsx
//
// Default OG image for the [locale] segment — this covers the homepage
// (src/app/[locale]/page.tsx, which has no opengraph-image.tsx of its own)
// and falls back for every other non-dynamic route (about, services list,
// portfolio list, blog list, contact) that doesn't need a per-record image.
// The three dynamic detail routes each override this with their own
// opengraph-image.tsx: services/[slug], portfolio/[slug], blog/[slug].
//
// Unlike page.tsx/about's non-image routes, an image route does NOT
// inherit generateStaticParams from the [locale] layout — without its own
// copy here this route builds as server-rendered-on-demand instead of
// prerendered, confirmed by `pnpm build`'s route listing.
import { ImageResponse } from "next/og";
import { getTranslations } from "next-intl/server";
import { content, pick } from "@/lib/content";
import { routing } from "@/i18n/routing";
import { loadOgFonts } from "@/lib/og/fonts";
import { OG_SIZE, ogTemplate } from "@/lib/og/template";

export const runtime = "nodejs";
export const alt = "Codexa";
export const size = OG_SIZE;
export const contentType = "image/png";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function Image({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const [settings, tNav, fonts] = await Promise.all([
    content.getSettings(),
    getTranslations({ locale, namespace: "common.nav" }),
    loadOgFonts(),
  ]);

  return new ImageResponse(
    ogTemplate({
      eyebrow: tNav("home"),
      title: pick(settings.hero.title, locale),
      locale,
    }),
    { ...OG_SIZE, fonts },
  );
}
