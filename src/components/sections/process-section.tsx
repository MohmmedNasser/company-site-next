import type { LucideIcon } from "lucide-react";
import {
  ArrowRight,
  MousePointer2,
  Rocket,
  Sparkles,
  Wand2,
} from "lucide-react";
import { getLocale, getTranslations } from "next-intl/server";
import { cn } from "@/lib/utils/cn";
import Container from "@/components/ui/container";
import Button from "@/components/ui/button";
import Reveal from "@/components/motion/reveal";

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

// Ambient background wordmark for the card row — "Codexa" is a Latin-script
// proper noun kept identical in both locales (same call as Logo's wordmark),
// not localized content, so it's a plain repeated string rather than an
// i18n key. Repeated well past viewport width so the drifting track never
// runs out of text mid-loop.
const MARQUEE_TEXT = "CODEXA — ".repeat(6);

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

      {/* Three separate <Reveal>s, not one wrapping the grid: Reveal always
          wraps each of ITS children in its own motion.div for the stagger
          animation, which would sit between this grid and the cards —
          col-span-2 on a card only works on a direct grid child, and a
          motion.div in between breaks that. Wrapping each card in its own
          Reveal instead means each card's OWN outer element (the one that
          takes `className`, including the col-span) is the direct grid
          child. Manual `delay` steps reproduce the stagger that a single
          Reveal's `stagger` prop would otherwise have given for free. */}
      <div className="relative mt-48 grid grid-cols-1 gap-24 md:mt-64 md:grid-cols-4">
        {/* Ambient background marquee — pure CSS translateX loop (no Framer
            Motion instance for a decorative, non-interactive effect). Sits
            behind all three cards: `-z-10` inside this `relative` grid
            paints it in the negative-z-index layer, which the CSS painting
            order puts below the cards' own static (non-positioned) boxes
            without touching the cards themselves. The opaque `bg-card`
            backgrounds occlude most of it; only the `gap-24` gutters
            between cards let slivers show through, same as the reference.
            Reuses the site's existing `animate-marquee` keyframes/tokens
            (globals.css) — same seamless-duplicate-track technique already
            used for the client-logo marquee, just two text copies instead
            of N logos. `[dir="rtl"]` already flips `--marquee-direction`
            for that keyframe, so this drifts the mirrored way on the
            Arabic page for free — confirmed via screenshot, not just
            inherited-and-assumed. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10 flex items-center overflow-hidden select-none"
        >
          <div className="animate-marquee flex w-max shrink-0 items-center gap-(--gap) [--duration:50s] [--gap:64px] motion-reduce:[animation-play-state:paused]">
            {[0, 1].map((i) => (
              <span
                key={i}
                lang="en"
                style={{ fontFamily: "var(--font-sans-latin), sans-serif" }}
                className="text-text-primary/8 text-64 md:text-80 shrink-0 leading-none font-semibold tracking-[-0.03em] whitespace-nowrap"
              >
                {MARQUEE_TEXT}
              </span>
            ))}
          </div>
        </div>

        {first && (
          <Reveal className="md:col-span-2">
            <StepCard step={first} className="flex min-h-320 flex-col">
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
          </Reveal>
        )}

        {second && (
          <Reveal delay={0.12}>
            <StepCard step={second} className="flex flex-col">
              <div
                aria-hidden="true"
                className="bg-surface-raised border-border rounded-control mt-auto flex flex-col gap-8 border p-16"
              >
                <span className="bg-border block h-8 w-3/4 rounded-full" />
                <span className="bg-border block h-8 w-1/2 rounded-full" />
              </div>
            </StepCard>
          </Reveal>
        )}

        {third && (
          <Reveal delay={0.24}>
            <StepCard step={third} className="flex flex-col">
              <div
                aria-hidden="true"
                className="mt-auto flex items-center justify-end gap-8"
              >
                <MousePointer2
                  className="text-text-secondary size-16"
                  strokeWidth={1.5}
                />
                <span className="bg-surface-raised border-border text-13 text-text-primary rounded-full border px-16 py-8 font-medium">
                  {t("mockups.launchLabel")}
                </span>
              </div>
            </StepCard>
          </Reveal>
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
