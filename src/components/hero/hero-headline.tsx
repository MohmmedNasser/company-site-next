"use client";

import { motion, type Variants } from "motion/react";
import { usePrefersReducedMotion } from "@/lib/hooks/use-prefers-reduced-motion";
import { EASE_DECELERATE } from "@/lib/motion/easing";
import {
  WORD_ENTRANCE_DURATION_SECONDS,
  WORD_STAGGER_SECONDS,
} from "@/components/hero/hero-motion";

const HEADLINE_CLASSES =
  "text-40 md:text-64 text-text-primary font-semibold tracking-[-0.03em]";

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

// Word-level stagger on initial page load — not scroll-triggered, since
// this is above the fold and would never receive a whileInView trigger the
// user could see (Task 5). Deliberately not built on the shared <Reveal>
// component: Reveal's orchestration is whileInView-based and per-child
// (paragraph/element) granularity, whereas this needs immediate
// initial→animate playback split at word granularity within one string.
export default function HeroHeadline({ title }: { title: string }) {
  const prefersReducedMotion = usePrefersReducedMotion();

  // CRITICAL short-circuit, same contract as Reveal: fully visible
  // immediately, no motion wrapper, no stagger — not a shortened version
  // of the same animation.
  if (prefersReducedMotion) {
    return <h1 className={HEADLINE_CLASSES}>{title}</h1>;
  }

  const words = title.split(" ");

  return (
    <motion.h1
      className={HEADLINE_CLASSES}
      initial="hidden"
      animate="visible"
      variants={container}
    >
      {words.map((word_, index) => (
        <motion.span key={index} className="inline-block" variants={word}>
          {word_}
          {index < words.length - 1 ? " " : ""}
        </motion.span>
      ))}
    </motion.h1>
  );
}
