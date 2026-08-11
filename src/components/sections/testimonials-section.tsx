import { getTranslations } from "next-intl/server";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import Container from "@/components/ui/container";
import SectionLabel from "@/components/ui/section-label";
import { buttonClassNames } from "@/lib/utils/button-classes";
import Reveal from "@/components/motion/reveal";
import TestimonialsSlider from "@/components/sections/testimonials-slider";

export interface TestimonialDisplay {
  id: string;
  avatar: string;
  rating: number;
  author: string;
  role: string;
  quote: string;
}

interface TestimonialsSectionProps {
  heading: string;
  description: string;
  testimonials: TestimonialDisplay[];
}

// Decorative only — not tied to any single testimonial or client, so it
// stays a local constant rather than a new settings.json field. Widening
// SiteSettings.sections.testimonials for one decorative image would break
// the "every other section's SectionCopy stays uniform on purpose" rule
// already documented on ProcessSectionCopy in src/lib/content/types.ts.
const HEADING_IMAGE =
  "https://picsum.photos/seed/testimonials-heading/1200/800";

export default async function TestimonialsSection({
  heading,
  description,
  testimonials,
}: TestimonialsSectionProps) {
  const t = await getTranslations("home.testimonials");

  return (
    <Container as="section" className="py-128 md:py-160">
      <SectionLabel number={5}>{t("sectionLabel")}</SectionLabel>

      {/* First DOM child = photo, second = heading/copy/CTAs — a plain
          logical flex-row reorders itself under dir="rtl" with no rtl:
          classes needed, same technique used across the other sections.
          Each side gets its own single-child Reveal: Reveal only skips its
          multi-child stagger wrapper (an unstyled motion.div — see
          reveal.tsx) when it has exactly one child, and that wrapper
          collapses to 0 width around the image div below since a `fill`
          Image contributes no intrinsic size for it to shrink-wrap. */}
      <div className="mt-32 flex flex-col items-center gap-32 md:mt-48 md:flex-row md:items-center md:gap-64">
        <Reveal className="border-border bg-card rounded-card relative aspect-3/2 w-full max-w-560 overflow-hidden border md:max-w-560">
          <Image
            src={HEADING_IMAGE}
            alt=""
            fill
            sizes="(min-width: 768px) 560px, 100vw"
            className="object-cover"
          />
        </Reveal>

        <Reveal className="flex flex-col items-start gap-16">
          <h2 className="text-48 md:text-64 text-text-primary leading-tight font-semibold tracking-[-0.03em] text-balance">
            {heading}
          </h2>
          <p className="text-14 md:text-16 text-text-secondary max-w-480 text-balance">
            {description}
          </p>
          <div className="mt-8 flex flex-wrap gap-16">
            <Link
              href="/contact"
              className={buttonClassNames({ variant: "secondary" })}
            >
              {t("ctaPrimaryLabel")}
            </Link>
            <Link
              href="/services"
              className={buttonClassNames({ variant: "secondary" })}
            >
              {t("ctaSecondaryLabel")}
            </Link>
          </div>
        </Reveal>
      </div>

      <div className="mt-64 md:mt-96">
        <TestimonialsSlider
          testimonials={testimonials}
          previousLabel={t("previousLabel")}
          nextLabel={t("nextLabel")}
        />
      </div>
    </Container>
  );
}
