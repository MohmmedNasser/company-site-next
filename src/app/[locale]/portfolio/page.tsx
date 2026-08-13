import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { content, pick } from "@/lib/content";
import { localeAlternates } from "@/lib/metadata";
import Container from "@/components/ui/container";
import PageIntro from "@/components/ui/page-intro";
import PortfolioGrid from "@/components/portfolio/portfolio-grid";

const ROUTE = "/portfolio";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const settings = await content.getSettings();
  const intro = settings.pages.portfolio.intro;

  return {
    title: pick(intro.heading, locale),
    description: pick(intro.description, locale),
    alternates: localeAlternates(ROUTE, locale),
  };
}

export default async function PortfolioPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const [settings, projects, clients, tNav] = await Promise.all([
    content.getSettings(),
    content.getProjects(),
    content.getClients(),
    getTranslations({ locale, namespace: "common.nav" }),
  ]);

  const intro = settings.pages.portfolio.intro;
  const clientNameById = new Map(
    clients.map((client) => [client.id, pick(client.name, locale)]),
  );

  // Distinct categories in content order (projects arrive sorted by
  // `order`), so the filter row matches the order the work is presented in
  // rather than an alphabetical one that means nothing to a reader.
  const categories = [...new Set(projects.map((project) => project.category))];

  return (
    <>
      <PageIntro
        label={tNav("portfolio")}
        heading={pick(intro.heading, locale)}
        description={pick(intro.description, locale)}
      />

      {/* No second SectionLabel: the filtered grid IS this page's content,
          not a section within it — same call as /services. */}
      <Container as="section" className="pb-80 md:pb-96">
        <PortfolioGrid
          categories={categories}
          projects={projects.map((project) => ({
            id: project.id,
            slug: project.slug,
            category: project.category,
            status: project.status,
            coverImage: project.coverImage,
            title: pick(project.title, locale),
            summary: pick(project.summary, locale),
            clientName: clientNameById.get(project.client) ?? "",
          }))}
        />
      </Container>
    </>
  );
}
