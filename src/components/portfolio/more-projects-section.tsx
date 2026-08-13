import { ArrowRight } from "lucide-react";
import { getTranslations } from "next-intl/server";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import Container from "@/components/ui/container";
import SectionLabel from "@/components/ui/section-label";
import Reveal from "@/components/motion/reveal";

export interface MoreProjectItem {
  id: string;
  slug: string;
  coverImage: string;
  title: string;
  categoryLabel: string;
}

interface MoreProjectsSectionProps {
  projects: MoreProjectItem[];
}

/**
 * The tail of a case study: a few other projects, so the page ends on a
 * route onward rather than a dead stop. Capped by the caller rather than
 * here — this renders what it's given.
 */
export default async function MoreProjectsSection({
  projects,
}: MoreProjectsSectionProps) {
  const t = await getTranslations("portfolio.detail");
  const tCommon = await getTranslations("common");

  return (
    <Container as="section" className="py-80 md:py-96">
      <SectionLabel number={3}>{t("moreLabel")}</SectionLabel>

      <div className="mt-32 grid grid-cols-1 gap-32 md:mt-48 md:grid-cols-3">
        {projects.map((project, index) => (
          <Reveal key={project.id} delay={(index % 3) * 0.08}>
            <Link
              href={`/portfolio/${project.slug}`}
              className="group flex flex-col gap-16"
            >
              <div className="border-border bg-card rounded-card relative aspect-video w-full overflow-hidden border">
                <Image
                  src={project.coverImage}
                  alt=""
                  fill
                  sizes="(min-width: 768px) 33vw, 100vw"
                  className="ease-decelerate object-cover grayscale transition-transform duration-700 group-hover:scale-105"
                />
              </div>

              <div className="flex flex-col gap-8">
                <span className="text-12 text-text-secondary font-medium">
                  {project.categoryLabel}
                </span>
                <h3 className="text-20 text-text-primary font-semibold">
                  {project.title}
                </h3>
                <span className="text-13 text-text-primary inline-flex items-center gap-8 font-medium">
                  {tCommon("actions.viewProject")}
                  <ArrowRight
                    aria-hidden="true"
                    className="size-14 rtl:-scale-x-100"
                  />
                </span>
              </div>
            </Link>
          </Reveal>
        ))}
      </div>
    </Container>
  );
}
