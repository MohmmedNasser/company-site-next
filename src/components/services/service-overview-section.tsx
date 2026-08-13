import { getTranslations } from "next-intl/server";
import Container from "@/components/ui/container";
import Chip from "@/components/ui/chip";
import SectionLabel from "@/components/ui/section-label";
import Reveal from "@/components/motion/reveal";

interface ServiceOverviewSectionProps {
  /** Already split by `toParagraphs()` — this component never parses content. */
  paragraphs: string[];
  categories: string[];
}

export default async function ServiceOverviewSection({
  paragraphs,
  categories,
}: ServiceOverviewSectionProps) {
  const t = await getTranslations("services.detail");

  return (
    <Container as="section" className="py-80 md:py-96">
      <SectionLabel number={2}>{t("overviewLabel")}</SectionLabel>

      {/* Same two-column split as FaqSection and the /about story: first
          DOM child is the short column, second is the long one, and a plain
          logical flex-row reorders itself under dir="rtl". */}
      <div className="mt-32 flex flex-col gap-48 md:mt-48 md:flex-row md:gap-64">
        <div className="border-border flex flex-col gap-16 border-t pt-24 md:w-320 md:shrink-0">
          <h2 className="text-16 text-text-primary font-semibold">
            {t("capabilitiesLabel")}
          </h2>
          <ul className="flex flex-wrap gap-8">
            {categories.map((category) => (
              <li key={category}>
                <Chip lang="en">{category}</Chip>
              </li>
            ))}
          </ul>
        </div>

        <Reveal className="flex max-w-640 flex-1 flex-col gap-24">
          {paragraphs.map((paragraph, index) => (
            <p key={index} className="text-16 text-text-secondary text-start">
              {paragraph}
            </p>
          ))}
        </Reveal>
      </div>
    </Container>
  );
}
