"use client";

import { Fragment, useRef } from "react";
import { motion, useTransform, type MotionValue } from "motion/react";
import { usePrefersReducedMotion } from "@/lib/hooks/use-prefers-reduced-motion";
import { useScrollRevealProgress } from "@/lib/hooks/use-scroll-reveal-progress";
import { cn } from "@/lib/utils/cn";
import Container from "@/components/ui/container";
import Reveal from "@/components/motion/reveal";

interface ApproachSectionProps {
  /** The large statement, revealed word by word as the reader scrolls. */
  statement: string;
  /** Smaller supporting line under the statement. */
  detail: string;
}

// Scroll window the reveal is scrubbed across, as fractions of viewport
// height (see use-scroll-reveal-progress.ts). The statement starts lighting
// up once its top has risen past 85% of the viewport — just after it enters
// from the bottom — and finishes when its bottom reaches 55%, so the last
// word lands while the whole block is still comfortably on screen.
// Deliberately NOT finishing at the top edge: the payoff has to arrive
// while the reader is still looking at it, not as it leaves.
const REVEAL_START_VIEWPORT_FRACTION = 0.85;
const REVEAL_END_VIEWPORT_FRACTION = 0.55;

// How many word slots each individual word's fade spans. 1 would light
// words up one at a time in hard steps; a wider window keeps ~3 words
// mid-fade at once, which is what reads as a sweep rather than a counter.
const WORD_FADE_SPAN = 3;

// 48px is the sanctioned marketing subsection headline step (design
// tokens' --text-48), stepping down to 24px on small screens. Base colour
// is text-secondary — that is the UNREVEALED state, and it's a real token
// pairing that clears AA on its own, so a reader who stops scrolling
// mid-sweep is never left with sub-legible text.
const STATEMENT_CLASSES =
  "text-24 sm:text-32 md:text-40 lg:text-48 text-text-secondary text-start font-semibold leading-tight tracking-[-0.03em]";

/**
 * One word of the statement, as two stacked copies: the dim one in normal
 * flow is the real text (the only copy a screen reader announces), and the
 * primary-coloured copy above it fades in on scroll.
 *
 * Two copies rather than interpolating `color` directly, because both ends
 * of the fade have to stay design tokens — motion can only interpolate
 * literal colour values, and this project forbids hex in components (and a
 * literal would freeze on one theme anyway). Overlaying per word, rather
 * than one overlay for the whole paragraph, keeps both copies inside a
 * single line box so they can never wrap differently and drift apart.
 */
function StatementWord({
  word,
  start,
  end,
  progress,
}: {
  word: string;
  start: number;
  end: number;
  progress: MotionValue<number>;
}) {
  const opacity = useTransform(progress, [start, end], [0, 1], {
    clamp: true,
  });

  return (
    <span className="relative inline-block">
      {word}
      <motion.span
        aria-hidden="true"
        className="text-text-primary absolute inset-0"
        style={{ opacity }}
      >
        {word}
      </motion.span>
    </span>
  );
}

export default function ApproachSection({
  statement,
  detail,
}: ApproachSectionProps) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const statementRef = useRef<HTMLHeadingElement>(null);
  const progress = useScrollRevealProgress(
    statementRef,
    REVEAL_START_VIEWPORT_FRACTION,
    REVEAL_END_VIEWPORT_FRACTION,
  );

  const words = statement.split(" ");
  // Normalised so the LAST word's fade ends exactly at progress 1. With a
  // plain index/length split, every word's window would be shifted early
  // and the tail would still be mid-fade when the scroll range ran out.
  const slots = words.length + WORD_FADE_SPAN - 1;

  return (
    <Container as="section" className="py-128 md:py-160">
      <div className="mx-auto flex max-w-4xl flex-col gap-32 md:gap-48">
        {/* CRITICAL short-circuit, same contract as Reveal and HeroHeadline:
            fully revealed immediately, no split, no motion wrapper, no
            scroll subscription — not a faster version of the same sweep.
            Load-bearing here beyond the usual reason: under reduced motion
            SmoothScrollProvider never mounts Lenis, so `progress` would sit
            at 0 forever and the statement would stay permanently dim. */}
        {prefersReducedMotion ? (
          <h2 className={cn(STATEMENT_CLASSES, "text-text-primary")}>
            {statement}
          </h2>
        ) : (
          <h2 ref={statementRef} className={STATEMENT_CLASSES}>
            {words.map((word, index) => (
              <Fragment key={index}>
                <StatementWord
                  word={word}
                  start={index / slots}
                  end={(index + WORD_FADE_SPAN) / slots}
                  progress={progress}
                />
                {/* Rendered outside the word span so the overlay copy is
                    never offset by a trailing space, while normal wrapping
                    between words is preserved. */}
                {index < words.length - 1 ? " " : null}
              </Fragment>
            ))}
          </h2>
        )}

        <Reveal className="max-w-lg">
          <p className="text-14 md:text-16 text-text-secondary text-start">
            {detail}
          </p>
        </Reveal>
      </div>
    </Container>
  );
}
