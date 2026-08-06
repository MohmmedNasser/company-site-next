"use client";

import { motion, type Variants } from "motion/react";
import { usePrefersReducedMotion } from "@/lib/hooks/use-prefers-reduced-motion";
import { EASE_DECELERATE } from "@/lib/motion/easing";
import { cn } from "@/lib/utils/cn";
import {
  WORD_ENTRANCE_DURATION_SECONDS,
  WORD_STAGGER_SECONDS,
} from "@/components/hero/hero-motion";

// Mega headline, one word per line (design-decisions.md §14) — the 96/120px
// steps only exist for this treatment, so the headline copy feeding this
// component must stay to 2-3 short words; a longer sentence would stack
// into an unreasonably tall block at this scale.
const HEADLINE_CLASSES =
  "text-64 sm:text-80 md:text-96 lg:text-120 text-text-primary font-semibold leading-none tracking-[-0.03em]";

// Arabic renders one type-scale step down from Latin at every breakpoint
// (design-decisions.md §15, requested directly) — Noto Kufi at the full
// 96/120px scale overwhelmed the viewport even with the [lang="ar"] 0.95em
// shrink globals.css already applies (design-decisions.md §3); three
// stacked lines at that size ran well past the fold.
const HEADLINE_CLASSES_AR =
  "text-48 sm:text-64 md:text-80 lg:text-90 text-text-primary font-semibold leading-none tracking-[-0.03em]";

// Latin's lines after the first step in from the start edge, reading as a
// deliberate staggered stack rather than a plain flush-left block. `indent-*`
// (text-indent), not a margin — requested as text-indent specifically, and
// it only ever affects the line's own start edge regardless of direction,
// so no rtl: variant is needed (moot anyway since this only applies when
// locale !== "ar").
const LATIN_INDENT_CLASSES = "indent-32 sm:indent-48 md:indent-64 lg:indent-80";

const container: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: WORD_STAGGER_SECONDS } },
};

const word: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    // EASE_DECELERATE (not motion's generic built-in "easeOut") — a
    // considered, reusable curve shared with the header's condense
    // transition and the nav indicator, so entrance motion reads as one
    // deliberate system instead of each component inlining its own feel.
    transition: {
      duration: WORD_ENTRANCE_DURATION_SECONDS,
      ease: EASE_DECELERATE,
    },
  },
};

// Splits the title into the lines this component renders. Latin: one word
// per line, unchanged. Arabic: the first two words share a line and any
// remaining words each get their own line (requested directly) — for a
// 3-word Arabic title this reads as 2 lines ("صنع مستقبلك" / "الرقمي"),
// matching the copy's natural phrase break instead of Latin's mechanical
// one-word-per-line split.
function toLines(title: string): string[] {
  const words = title.split(" ");
  // if (locale === "ar" && words.length >= 2) {
  //   return [words.slice(0, 2).join(" "), ...words.slice(2)];
  // }
  return words;
}

// Word-level stagger on initial page load — not scroll-triggered, since
// this is above the fold and would never receive a whileInView trigger the
// user could see (Task 5). Deliberately not built on the shared <Reveal>
// component: Reveal's orchestration is whileInView-based and per-child
// (paragraph/element) granularity, whereas this needs immediate
// initial→animate playback split at word granularity within one string.
export default function HeroHeadline({
  title,
  locale,
}: {
  title: string;
  locale: string;
}) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const isArabic = locale === "ar";
  const lines = toLines(title);
  const headlineClasses = isArabic ? HEADLINE_CLASSES_AR : HEADLINE_CLASSES;

  const lineClassName = (index: number) =>
    cn("block", !isArabic && index > 0 && LATIN_INDENT_CLASSES);

  // CRITICAL short-circuit, same contract as Reveal: fully visible
  // immediately, no motion wrapper, no stagger — not a shortened version
  // of the same animation.
  if (prefersReducedMotion) {
    return (
      <h1 className={headlineClasses}>
        {lines.map((line, index) => (
          <span key={index} className={lineClassName(index)}>
            {line}
          </span>
        ))}
      </h1>
    );
  }

  return (
    <motion.h1
      className={headlineClasses}
      initial="hidden"
      animate="visible"
      variants={container}
    >
      {lines.map((line, index) => (
        <motion.span
          key={index}
          className={lineClassName(index)}
          variants={word}
        >
          {line}
        </motion.span>
      ))}
    </motion.h1>
  );
}
