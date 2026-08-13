import { getTranslations } from "next-intl/server";
import Container from "@/components/ui/container";
import SectionLabel from "@/components/ui/section-label";
import Reveal from "@/components/motion/reveal";
import TimelineList, {
  type TimelineEntryDisplay,
} from "@/components/about/timeline-list";

export type { TimelineEntryDisplay };

interface TimelineSectionProps {
  heading: string;
  description: string;
  entries: TimelineEntryDisplay[];
}

export default async function TimelineSection({
  heading,
  description,
  entries,
}: TimelineSectionProps) {
  const t = await getTranslations("about.timeline");

  return (
    <Container as="section" className="py-80 md:py-96">
      <SectionLabel number={5}>{t("sectionLabel")}</SectionLabel>

      <Reveal className="mt-32 mb-48 flex max-w-640 flex-col gap-16 md:mt-48 md:mb-64">
        <h2 className="text-48 md:text-64 text-text-primary leading-tight font-semibold tracking-[-0.03em] text-balance">
          {heading}
        </h2>
        <p className="text-14 md:text-16 text-text-secondary text-balance">
          {description}
        </p>
      </Reveal>

      {/* The list owns its own motion — it has to be a client component so
          each row can be a motion.li without a wrapper <div> breaking the
          <ol>/<li> relationship. See timeline-list.tsx. */}
      <TimelineList entries={entries} />
    </Container>
  );
}
