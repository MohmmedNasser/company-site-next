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
import CaseStudySection from "@/components/portfolio/case-study-section";
import MoreProjectsSection from "@/components/portfolio/more-projects-section";

type RouteParams = { locale: string; slug: string };

// How many other projects the tail shows. Three fills the grid row exactly;
// showing all five would turn the tail into a second index page.
const MORE_PROJECTS_COUNT = 3;

/**
 * Only the `slug` segment. Next.js calls this once per parent param, and
 * the [locale] layout above already enumerates every locale — returning
 * locales here too would multiply them against themselves.
 */
export async function generateStaticParams() {
  const projects = await content.getProjects();
  return projects.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<RouteParams>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const project = await content.getProject(slug);

  // A slug outside generateStaticParams' list: return bare metadata rather
  // than throwing, and let the page component below call notFound().
  if (!project) return {};

  return {
    title: pick(project.title, locale),
    description: pick(project.summary, locale),
    alternates: localeAlternates(`/portfolio/${slug}`, locale),
  };
}

export default async function CaseStudyPage({
  params,
}: {
  params: Promise<RouteParams>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const [project, allProjects, clients, tNav, tCommon] = await Promise.all([
    content.getProject(slug),
    content.getProjects(),
    content.getClients(),
    getTranslations({ locale, namespace: "common.nav" }),
    getTranslations({ locale, namespace: "common" }),
  ]);

  if (!project) {
    notFound();
  }

  const clientNameById = new Map(
    clients.map((client) => [client.id, pick(client.name, locale)]),
  );
  const categoryLabel = (category: string) =>
    tCommon(`projectCategories.${category}`);

  const moreProjects = allProjects
    .filter((item) => item.id !== project.id)
    .slice(0, MORE_PROJECTS_COUNT);

  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd(
          [
            { name: tNav("home"), path: "" },
            { name: tNav("portfolio"), path: "/portfolio" },
            { name: pick(project.title, locale), path: `/portfolio/${slug}` },
          ],
          locale,
        )}
      />

      {/* The label is the section this page belongs to, not the page's own
          title — the <h1> already carries that. It tells a visitor who
          arrived from search where in the site they've landed. */}
      <PageIntro
        label={tNav("portfolio")}
        heading={pick(project.title, locale)}
        description={pick(project.summary, locale)}
      />

      <Container className="pb-80 md:pb-96">
        <HeroImage src={project.coverImage} />
      </Container>

      <CaseStudySection
        paragraphs={toParagraphs(pick(project.description, locale))}
        clientName={clientNameById.get(project.client) ?? ""}
        categoryLabel={categoryLabel(project.category)}
        statusLabel={tCommon(
          project.status === "shipped"
            ? "projectStatus.shipped"
            : "projectStatus.inDevelopment",
        )}
      />

      <MoreProjectsSection
        projects={moreProjects.map((item) => ({
          id: item.id,
          slug: item.slug,
          coverImage: item.coverImage,
          title: pick(item.title, locale),
          categoryLabel: categoryLabel(item.category),
        }))}
      />
    </>
  );
}
