import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { content, pick } from "@/lib/content";
import { localeAlternates } from "@/lib/metadata";
import { breadcrumbJsonLd } from "@/lib/structured-data";
import { JsonLd } from "@/components/seo/json-ld";
import PageIntro from "@/components/ui/page-intro";
import ServicesList from "@/components/services/services-list";

const ROUTE = "/services";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const settings = await content.getSettings();
  const intro = settings.pages.services.intro;

  return {
    title: pick(intro.heading, locale),
    description: pick(intro.description, locale),
    alternates: localeAlternates(ROUTE, locale),
  };
}

export default async function ServicesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const [settings, services, tNav] = await Promise.all([
    content.getSettings(),
    content.getServices(),
    getTranslations({ locale, namespace: "common.nav" }),
  ]);

  const intro = settings.pages.services.intro;

  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd(
          [
            { name: tNav("home"), path: "" },
            { name: tNav("services"), path: ROUTE },
          ],
          locale,
        )}
      />

      <PageIntro
        label={tNav("services")}
        heading={pick(intro.heading, locale)}
        description={pick(intro.description, locale)}
      />

      {/* No second SectionLabel: the list IS this page's content, not a
          section within it, so numbering it [02] would imply a sibling
          section that doesn't exist. */}
      <ServicesList
        services={services.map((service) => ({
          id: service.id,
          slug: service.slug,
          icon: service.icon,
          image: service.image,
          title: pick(service.title, locale),
          excerpt: pick(service.excerpt, locale),
          categories: service.categories,
        }))}
      />
    </>
  );
}
