import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { content, pick } from "@/lib/content";
import { localeAlternates } from "@/lib/metadata";
import { breadcrumbJsonLd } from "@/lib/structured-data";
import { JsonLd } from "@/components/seo/json-ld";
import BlogIndex from "@/components/blog/blog-index";

const ROUTE = "/blog";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const settings = await content.getSettings();
  const intro = settings.pages.blog.intro;

  return {
    title: pick(intro.heading, locale),
    description: pick(intro.description, locale),
    alternates: localeAlternates(ROUTE, locale),
  };
}

export default async function BlogPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const tNav = await getTranslations({ locale, namespace: "common.nav" });

  // Page 1 is served from the bare /blog path, not /blog/page/1, so the
  // index has one canonical address rather than two serving identical
  // content. See blogPageHref in components/blog/blog-pagination.tsx.
  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd(
          [
            { name: tNav("home"), path: "" },
            { name: tNav("blog"), path: ROUTE },
          ],
          locale,
        )}
      />
      <BlogIndex locale={locale} page={1} />
    </>
  );
}
