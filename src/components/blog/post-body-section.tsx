import Container from "@/components/ui/container";
import Reveal from "@/components/motion/reveal";

interface PostBodySectionProps {
  /** Already split by `toParagraphs()` — this component never parses content. */
  paragraphs: string[];
}

/**
 * The article itself.
 *
 * No SectionLabel, unlike the /services and /portfolio detail pages. Their
 * bodies sit beside a second column (capabilities, project facts), which
 * makes each a distinct section worth numbering. An article has no such
 * sibling — it IS what `[01] Blog` announced — so labelling it would be
 * chrome describing the obvious. A single measured column instead, which is
 * also the right line length for sustained reading.
 */
export default function PostBodySection({ paragraphs }: PostBodySectionProps) {
  return (
    <Container as="section" className="pb-80 md:pb-96">
      <Reveal className="flex max-w-720 flex-col gap-24">
        {paragraphs.map((paragraph, index) => (
          <p key={index} className="text-16 text-text-secondary text-start">
            {paragraph}
          </p>
        ))}
      </Reveal>
    </Container>
  );
}
