import { getTranslations } from "next-intl/server";
import Container from "@/components/ui/container";
import SectionLabel from "@/components/ui/section-label";
import Reveal from "@/components/motion/reveal";

interface CaseStudySectionProps {
  /** Already split by `toParagraphs()` — this component never parses content. */
  paragraphs: string[];
  clientName: string;
  categoryLabel: string;
  statusLabel: string;
}

/**
 * The case study body, with the project's facts in the short column.
 *
 * Same two-column split as the /services overview and /about's story: the
 * short column first in DOM order, the long one second, so a plain logical
 * flex-row reorders itself under dir="rtl" with no rtl: classes.
 */
export default async function CaseStudySection({
  paragraphs,
  clientName,
  categoryLabel,
  statusLabel,
}: CaseStudySectionProps) {
  const t = await getTranslations("portfolio.detail");

  const facts = [
    { key: "client", label: t("clientLabel"), value: clientName },
    { key: "category", label: t("categoryLabel"), value: categoryLabel },
    { key: "status", label: t("statusLabel"), value: statusLabel },
  ];

  return (
    <Container as="section" className="py-80 md:py-96">
      <SectionLabel number={2}>{t("overviewLabel")}</SectionLabel>

      <div className="mt-32 flex flex-col gap-48 md:mt-48 md:flex-row md:gap-64">
        {/* <dl>, not a stack of divs: these are genuinely term/value pairs,
            and the pairing is what a screen reader needs to convey. */}
        <dl className="border-border flex flex-col gap-16 border-t pt-24 md:w-320 md:shrink-0">
          {facts.map((fact) => (
            <div key={fact.key} className="flex flex-col gap-4">
              <dt className="text-12 text-text-secondary font-medium">
                {fact.label}
              </dt>
              <dd className="text-16 text-text-primary font-medium">
                {fact.value}
              </dd>
            </div>
          ))}
        </dl>

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
