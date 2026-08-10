import type { LucideIcon } from "lucide-react";
import { ArrowRight, Rocket, Sparkles, Wand2 } from "lucide-react";
import { getLocale, getTranslations } from "next-intl/server";
import { cn } from "@/lib/utils/cn";
import Container from "@/components/ui/container";
import Button from "@/components/ui/button";
import Reveal from "@/components/motion/reveal";
import ProcessCardReveal from "@/components/sections/process-card-reveal";
import ProcessCursor from "@/components/sections/process-cursor";

interface ProcessStepDisplay {
  id: string;
  icon: string;
  title: string;
  description: string;
}

interface ProcessSectionProps {
  heading: string;
  description: string;
  ctaLabel: string;
  steps: ProcessStepDisplay[];
}

// lucide-react icon names come from content (mock/process-steps.json), same
// pattern Service already uses — this map is the render-time lookup, not a
// new content shape.
const ICONS: Record<string, LucideIcon> = {
  Sparkles,
  Wand2,
  Rocket,
};

// Splits off the heading's last word so it can render in
// --color-text-secondary. Noto Kufi Arabic has no italic style and the
// design-system skill bans text-transform tricks on Arabic, so italic only
// applies to the Latin (non-Arabic) heading — the colour treatment alone
// carries the emphasis for Arabic.
function splitLastWord(heading: string): { lead: string; last: string } {
  const words = heading.split(" ");
  return {
    lead: words.slice(0, -1).join(" "),
    last: words[words.length - 1] ?? "",
  };
}

export default async function ProcessSection({
  heading,
  description,
  ctaLabel,
  steps,
}: ProcessSectionProps) {
  const t = await getTranslations("home.process");
  const locale = await getLocale();
  const isArabic = locale === "ar";
  const [first, second, third] = steps;
  const { lead, last } = splitLastWord(heading);

  return (
    <Container as="section" className="py-128 md:py-160">
      <Reveal className="mx-auto flex max-w-640 flex-col items-center gap-16 text-center">
        <h2 className="text-32 md:text-48 text-text-primary leading-tight font-semibold tracking-[-0.03em] text-balance">
          {lead}{" "}
          <span className={cn("text-text-secondary", !isArabic && "italic")}>
            {last}
          </span>
        </h2>
        <p className="text-14 md:text-16 text-text-secondary text-balance">
          {description}
        </p>
      </Reveal>

      {/* Three separate card-reveal wrappers, not one wrapping the grid:
          each wrapper's OWN outer element (the one that takes `className`,
          including the col-span) must be the direct grid child — a motion
          wrapper in between would break `col-span-2` on the first card.
          Manual `delay` steps reproduce a stagger by hand. */}
      <div className="mt-48 grid grid-cols-1 gap-24 md:mt-64 md:grid-cols-4">
        {first && (
          <ProcessCardReveal className="md:col-span-2">
            <StepCard step={first} className="flex h-full flex-col">
              {/* The warm red/orange/yellow corner glow this card used to
                  carry was retired with the monochrome identity reset —
                  see docs/design-decisions.md, "Explicitly retired". Colour
                  now exists nowhere on the site except the logo mark, and
                  a one-off warm gradient had no equivalent to convert to
                  that wouldn't be an arbitrary, unexplained visual outlier
                  next to the other two (colourless) cards. */}
              <div className="mt-auto flex justify-start">
                <Button>
                  {ctaLabel}
                  <ArrowRight
                    className="size-16 rtl:-scale-x-100"
                    aria-hidden="true"
                  />
                </Button>
              </div>
            </StepCard>
          </ProcessCardReveal>
        )}

        {second && (
          <ProcessCardReveal delay={0.12}>
            <StepCard step={second} className="flex h-full flex-col">
              <div
                aria-hidden="true"
                className="bg-surface-raised border-border rounded-control mt-auto flex flex-col gap-8 border p-16"
              >
                <span className="bg-border block h-8 w-3/4 rounded-full" />
                <span className="bg-border block h-8 w-1/2 rounded-full" />
              </div>
            </StepCard>
          </ProcessCardReveal>
        )}

        {third && (
          <ProcessCardReveal delay={0.24}>
            <StepCard step={third} className="flex h-full flex-col">
              <ProcessCursor label={t("mockups.launchLabel")} />
            </StepCard>
          </ProcessCardReveal>
        )}
      </div>
    </Container>
  );
}

function StepCard({
  step,
  className,
  children,
}: {
  step: ProcessStepDisplay;
  className: string;
  children: React.ReactNode;
}) {
  const Icon = ICONS[step.icon];

  return (
    <div
      className={cn(
        "rounded-card border-border bg-card gap-24 border p-24",
        className,
      )}
    >
      <div className="flex flex-col gap-16">
        <div className="bg-surface-raised border-border rounded-control inline-flex size-40 shrink-0 items-center justify-center border">
          {Icon && (
            <Icon className="text-text-primary size-20" strokeWidth={1.5} />
          )}
        </div>
        <div className="flex flex-col gap-8">
          <h3 className="text-16 text-text-primary font-semibold">
            {step.title}
          </h3>
          <p className="text-13 text-text-secondary">{step.description}</p>
        </div>
      </div>
      {children}
    </div>
  );
}
