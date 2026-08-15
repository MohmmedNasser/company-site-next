import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { content, pick, toParagraphs } from "@/lib/content";
import { localeAlternates } from "@/lib/metadata";
import { breadcrumbJsonLd } from "@/lib/structured-data";
import { JsonLd } from "@/components/seo/json-ld";
import Container from "@/components/ui/container";
import PageIntro from "@/components/ui/page-intro";
import HeroImage from "@/components/motion/hero-image";
import ServiceOverviewSection from "@/components/services/service-overview-section";
import OtherServicesSection from "@/components/services/other-services-section";

type RouteParams = { locale: string; slug: string };

/**
 * Only the `slug` segment. Next.js calls this once per parent param, and
 * the [locale] layout above already enumerates every locale — returning
 * locales here too would multiply them against themselves.
 */
export async function generateStaticParams() {
  const services = await content.getServices();
  return services.map((service) => ({ slug: service.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<RouteParams>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const service = await content.getService(slug);

  // A slug outside generateStaticParams' list: return bare metadata rather
  // than throwing, and let the page component below call notFound().
  if (!service) return {};

  return {
    title: pick(service.title, locale),
    description: pick(service.excerpt, locale),
    alternates: localeAlternates(`/services/${slug}`, locale),
  };
}

export default async function ServiceDetailPage({
  params,
}: {
  params: Promise<RouteParams>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const [service, allServices, tNav] = await Promise.all([
    content.getService(slug),
    content.getServices(),
    getTranslations({ locale, namespace: "common.nav" }),
  ]);

  if (!service) {
    notFound();
  }

  const otherServices = allServices.filter((item) => item.id !== service.id);

  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd(
          [
            { name: tNav("home"), path: "" },
            { name: tNav("services"), path: "/services" },
            { name: pick(service.title, locale), path: `/services/${slug}` },
          ],
          locale,
        )}
      />

      {/* The label is the section this page belongs to, not the page's own
          title — the <h1> already carries that. It tells a visitor who
          arrived from search where in the site they've landed. */}
      <PageIntro
        label={tNav("services")}
        heading={pick(service.title, locale)}
        description={pick(service.excerpt, locale)}
      />

      <Container className="pb-80 md:pb-96">
        <HeroImage src={service.image} />
      </Container>

      <ServiceOverviewSection
        paragraphs={toParagraphs(pick(service.body, locale))}
        categories={service.categories}
      />

      <OtherServicesSection
        services={otherServices.map((item) => ({
          id: item.id,
          slug: item.slug,
          icon: item.icon,
          title: pick(item.title, locale),
        }))}
      />
    </>
  );
}
