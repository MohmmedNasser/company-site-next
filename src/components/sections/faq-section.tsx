import { getTranslations } from "next-intl/server";
import Container from "@/components/ui/container";
import SectionLabel from "@/components/ui/section-label";
import FaqAccordion, {
  type FaqItemDisplay,
} from "@/components/sections/faq-accordion";

interface FaqSectionProps {
  heading: string;
  description: string;
  items: FaqItemDisplay[];
}

export default async function FaqSection({
  heading,
  description,
  items,
}: FaqSectionProps) {
  const t = await getTranslations("home.faq");

  return (
    <Container as="section" className="py-128 md:py-160">
      <SectionLabel number={6}>{t("sectionLabel")}</SectionLabel>

      {/* First DOM child = heading/help text, second = accordion — plain
          logical flex-row reorders itself under dir="rtl" with no rtl:
          classes needed, same technique used in testimonials-section.tsx. */}
      <div className="mt-32 flex flex-col gap-48 md:mt-48 md:flex-row md:gap-64">
        <div className="flex flex-col gap-32 md:w-320 md:shrink-0">
          <div className="flex flex-col gap-16">
            <h2 className="text-48 md:text-64 text-text-primary leading-tight font-semibold tracking-[-0.03em] text-balance">
              {heading}
            </h2>
            <p className="text-14 md:text-16 text-text-secondary text-balance">
              {description}
            </p>
          </div>

          <div className="border-border flex flex-col gap-8 border-t pt-32">
            <h3 className="text-16 text-text-primary font-semibold">
              {t("helpHeading")}
            </h3>
            <p className="text-14 text-text-secondary">
              {t("helpDescription")}
            </p>
          </div>
        </div>

        <div className="flex-1">
          <FaqAccordion items={items} />
        </div>
      </div>
    </Container>
  );
}
