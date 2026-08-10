import { ArrowRight } from "lucide-react";
import { getTranslations } from "next-intl/server";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import Container from "@/components/ui/container";
import SectionLabel from "@/components/ui/section-label";
import Reveal from "@/components/motion/reveal";

export interface ProjectDisplay {
  id: string;
  slug: string;
  category: string;
  status: "shipped" | "in-development";
  coverImage: string;
  title: string;
  summary: string;
  clientName: string;
}

interface PortfolioSectionProps {
  heading: string;
  description: string;
  projects: ProjectDisplay[];
}

export default async function PortfolioSection({
  heading,
  description,
  projects,
}: PortfolioSectionProps) {
  const tNav = await getTranslations("common.nav");
  const tPortfolio = await getTranslations("home.portfolio");

  return (
    <Container as="section" className="py-128 md:py-160">
      <SectionLabel number={4}>{tNav("portfolio")}</SectionLabel>

      <Reveal className="mx-auto mt-32 mb-64 flex max-w-640 flex-col items-center gap-16 text-center md:mt-48 md:mb-96">
        <h2 className="text-48 md:text-64 lg:text-80 text-text-primary leading-tight font-semibold tracking-[-0.03em] text-balance">
          {heading}
        </h2>
        <p className="text-14 md:text-16 text-text-secondary mx-auto max-w-480 text-balance">
          {description}
        </p>
      </Reveal>

      <div className="grid grid-cols-1 gap-32 md:grid-cols-2">
        {projects.map((project, index) => (
          <Reveal key={project.id} delay={(index % 2) * 0.08}>
            <PortfolioCard
              project={project}
              categoryLabel={tPortfolio(`categories.${project.category}`)}
              statusLabel={tPortfolio(
                project.status === "shipped"
                  ? "status.shipped"
                  : "status.inDevelopment",
              )}
              viewProjectLabel={tPortfolio("viewProjectLabel")}
            />
          </Reveal>
        ))}
      </div>
    </Container>
  );
}

function PortfolioCard({
  project,
  categoryLabel,
  statusLabel,
  viewProjectLabel,
}: {
  project: ProjectDisplay;
  categoryLabel: string;
  statusLabel: string;
  viewProjectLabel: string;
}) {
  return (
    <Link
      href={`/portfolio/${project.slug}`}
      className="group flex flex-col gap-16"
    >
      <div className="border-border bg-card rounded-card relative aspect-video w-full overflow-hidden border">
        <Image
          src={project.coverImage}
          alt=""
          fill
          sizes="(min-width: 768px) 50vw, 100vw"
          className="ease-decelerate object-cover transition-transform duration-700 group-hover:scale-105"
        />
        {/* Solid, not translucent/blurred — --blur-overlay is scoped to
            floating overlay chrome (header, dropdowns, modals), never
            content cards, per the design-system skill. */}
        <span className="bg-card border-border text-text-primary text-13 absolute inset-s-16 top-16 rounded-full border px-16 py-8 font-medium">
          {statusLabel}
        </span>
      </div>

      <div className="flex flex-col gap-8">
        <span className="text-12 text-text-secondary font-medium">
          {categoryLabel} — {project.clientName}
        </span>
        <h3 className="text-20 md:text-24 text-text-primary font-semibold">
          {project.title}
        </h3>
        <p className="text-14 text-text-secondary">{project.summary}</p>
        <span className="text-13 text-text-primary mt-8 inline-flex items-center gap-8 font-medium">
          {viewProjectLabel}
          <ArrowRight className="size-14 rtl:-scale-x-100" aria-hidden="true" />
        </span>
      </div>
    </Link>
  );
}
