// src/app/[locale]/services/[slug]/opengraph-image.tsx
import { ImageResponse } from "next/og";
import { getTranslations } from "next-intl/server";
import { content, pick } from "@/lib/content";
import { loadOgFonts } from "@/lib/og/fonts";
import { OG_SIZE, ogTemplate } from "@/lib/og/template";

export const runtime = "nodejs";
export const alt = "Codexa";
export const size = OG_SIZE;
export const contentType = "image/png";

// Mirrors the page's own generateStaticParams (services/[slug]/page.tsx) —
// an image route under a dynamic segment needs its own params generator to
// be prerendered per record; it doesn't inherit the page's.
export async function generateStaticParams() {
  const services = await content.getServices();
  return services.map((service) => ({ slug: service.slug }));
}

export default async function Image({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const [service, tNav, fonts] = await Promise.all([
    content.getService(slug),
    getTranslations({ locale, namespace: "common.nav" }),
    loadOgFonts(),
  ]);

  return new ImageResponse(
    ogTemplate({
      eyebrow: tNav("services"),
      // A slug outside generateStaticParams' list falls through to the
      // brand name rather than throwing — the page component itself is
      // what calls notFound() for that case (see page.tsx in this folder).
      title: service ? pick(service.title, locale) : "Codexa",
      locale,
    }),
    { ...OG_SIZE, fonts },
  );
}
