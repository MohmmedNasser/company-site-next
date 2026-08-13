import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";
import Container from "@/components/ui/container";
import SectionLabel from "@/components/ui/section-label";
import Entrance from "@/components/motion/entrance";

interface PageIntroProps {
  /** Section-label text — the page's own name, already translated. */
  label: ReactNode;
  /** Section-label index. A page opener is the page's first section. @default 1 */
  number?: number | string;
  heading: ReactNode;
  /** Supporting line under the heading. */
  description?: ReactNode;
  className?: string;
}

/**
 * The opener every inner page starts with. Deliberately NOT a new "page
 * header" style: it's the exact section opener the home page's sections
 * already use — SectionLabel, then the same heading/description block at
 * the same type steps — with two differences that follow from being a page
 * rather than a section:
 *
 * - The heading is an <h1>, since it's the page's document title, not a
 *   heading inside one.
 * - It carries top padding that clears the fixed header. Header is a
 *   floating pill at `top-16` up to 64px tall (see header.tsx, which notes
 *   it's removed from normal flow because "this project's other pages don't
 *   yet exist to need compensating top clearance" — this is that
 *   clearance). 128px is the first marketing-extension spacing step that
 *   clears 16 + 64 with real breathing room.
 *
 * Start-aligned rather than centered, following the FAQ section's heading
 * treatment: a centered block reads as a section inside a longer page,
 * while a page opener is the top of the reading order.
 */
export default function PageIntro({
  label,
  number = 1,
  heading,
  description,
  className,
}: PageIntroProps) {
  return (
    <Container
      as="header"
      className={cn("pt-128 pb-64 md:pt-160 md:pb-80", className)}
    >
      {/* Two Entrance groups rather than one, so the label lands first and
          the heading block follows as a separate beat — a single group
          would have to share one flex `gap` between label→heading and
          heading→lede, which want different spacing. Entrance, not Reveal:
          this is above the fold on every page, see entrance.tsx. */}
      <Entrance>
        <SectionLabel number={number}>{label}</SectionLabel>
      </Entrance>

      <Entrance
        delay={0.12}
        className="mt-32 flex max-w-4xl flex-col gap-16 md:mt-48"
      >
        <h1 className="text-48 md:text-64 lg:text-80 text-text-primary leading-tight font-semibold tracking-[-0.03em] text-balance">
          {heading}
        </h1>
        {description && (
          <p className="text-14 md:text-16 text-text-secondary max-w-640 text-balance">
            {description}
          </p>
        )}
      </Entrance>
    </Container>
  );
}
