import type { LucideIcon } from "lucide-react";
import {
  Compass,
  KeyRound,
  MessageSquare,
  Rocket,
  Users,
  Wrench,
} from "lucide-react";
import { getTranslations } from "next-intl/server";
import Container from "@/components/ui/container";
import Card from "@/components/ui/card";
import SectionLabel from "@/components/ui/section-label";
import Reveal from "@/components/motion/reveal";

export interface ValueDisplay {
  id: string;
  icon: string;
  title: string;
  description: string;
}

interface ValuesSectionProps {
  heading: string;
  description: string;
  values: ValueDisplay[];
}

// lucide-react icon names come from content (mock/values.json), same
// render-time lookup map ProcessSection and ServicesScroller already use —
// an explicit map rather than a dynamic import, so the bundle only ever
// carries the icons this section can actually render.
const ICONS: Record<string, LucideIcon> = {
  Rocket,
  Users,
  KeyRound,
  MessageSquare,
  Wrench,
  Compass,
};

export default async function ValuesSection({
  heading,
  description,
  values,
}: ValuesSectionProps) {
  const t = await getTranslations("about.values");

  return (
    <Container as="section" className="py-80 md:py-96">
      <SectionLabel number={3}>{t("sectionLabel")}</SectionLabel>

      <Reveal className="mt-32 mb-48 flex max-w-640 flex-col gap-16 md:mt-48 md:mb-64">
        <h2 className="text-48 md:text-64 text-text-primary leading-tight font-semibold tracking-[-0.03em] text-balance">
          {heading}
        </h2>
        <p className="text-14 md:text-16 text-text-secondary text-balance">
          {description}
        </p>
      </Reveal>

      {/* Plain grid of <Reveal>s, one per card — same structure
          PortfolioSection uses. Not <ul>/<li>: Reveal renders its own
          <div> wrapper, so a list here would produce <ul><div><li>, which
          is invalid and strips the list semantics it was added for. */}
      <div className="grid grid-cols-1 gap-24 sm:grid-cols-2 lg:grid-cols-3">
        {values.map((value, index) => {
          const Icon = ICONS[value.icon];
          return (
            // h-full twice: once on Reveal's own wrapper (the grid item)
            // and once, via the child selector, on the motion wrapper it
            // renders inside that — otherwise the Card's h-full has an
            // auto-height parent to fill and the row's cards end ragged.
            <Reveal
              key={value.id}
              delay={(index % 3) * 0.08}
              className="h-full *:h-full"
            >
              <Card className="flex h-full flex-col gap-16">
                {Icon && (
                  <Icon
                    aria-hidden="true"
                    className="text-text-primary size-24 shrink-0"
                  />
                )}
                <h3 className="text-20 text-text-primary leading-snug font-semibold text-balance">
                  {value.title}
                </h3>
                <p className="text-14 text-text-secondary">
                  {value.description}
                </p>
              </Card>
            </Reveal>
          );
        })}
      </div>
    </Container>
  );
}
