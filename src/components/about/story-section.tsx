import { getTranslations } from "next-intl/server";
import Container from "@/components/ui/container";
import SectionLabel from "@/components/ui/section-label";
import Reveal from "@/components/motion/reveal";

interface StorySectionProps {
  heading: string;
  description: string;
  /** Already split by `toParagraphs()` — this component doesn't parse content. */
  paragraphs: string[];
}

export default async function StorySection({
  heading,
  description,
  paragraphs,
}: StorySectionProps) {
  const t = await getTranslations("about.story");

  return (
    <Container as="section" className="py-80 md:py-96">
      <SectionLabel number={2}>{t("sectionLabel")}</SectionLabel>

      {/* Same two-column split as FaqSection: first DOM child is the
          heading, second is the long content. A plain logical flex-row
          reorders itself under dir="rtl" with no rtl: classes. */}
      <div className="mt-32 flex flex-col gap-48 md:mt-48 md:flex-row md:gap-64">
        <div className="flex flex-col gap-16 md:w-320 md:shrink-0">
          <h2 className="text-48 md:text-64 text-text-primary leading-tight font-semibold tracking-[-0.03em] text-balance">
            {heading}
          </h2>
          <p className="text-14 md:text-16 text-text-secondary text-balance">
            {description}
          </p>
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
