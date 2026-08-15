// src/app/[locale]/portfolio/[slug]/opengraph-image.tsx
import { ImageResponse } from "next/og";
import { getTranslations } from "next-intl/server";
import { content, pick } from "@/lib/content";
import { loadOgFonts } from "@/lib/og/fonts";
import { OG_SIZE, ogTemplate } from "@/lib/og/template";

export const runtime = "nodejs";
export const alt = "Codexa";
export const size = OG_SIZE;
export const contentType = "image/png";

// Mirrors the page's own generateStaticParams (portfolio/[slug]/page.tsx).
export async function generateStaticParams() {
  const projects = await content.getProjects();
  return projects.map((project) => ({ slug: project.slug }));
}

export default async function Image({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const [project, tNav, fonts] = await Promise.all([
    content.getProject(slug),
    getTranslations({ locale, namespace: "common.nav" }),
    loadOgFonts(),
  ]);

  return new ImageResponse(
    ogTemplate({
      eyebrow: tNav("portfolio"),
      // A slug outside generateStaticParams' list falls through to the
      // brand name rather than throwing — the page component itself is
      // what calls notFound() for that case (see page.tsx in this folder).
      title: project ? pick(project.title, locale) : "Codexa",
      locale,
    }),
    { ...OG_SIZE, fonts },
  );
}
