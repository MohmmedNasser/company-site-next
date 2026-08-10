"use client";

import type { ReactNode } from "react";
import { motion } from "motion/react";
import { usePrefersReducedMotion } from "@/lib/hooks/use-prefers-reduced-motion";
import { EASE_DECELERATE } from "@/lib/motion/easing";
import { cn } from "@/lib/utils/cn";

interface ProcessCardRevealProps {
  /** Seconds before this card starts animating in. @default 0 */
  delay?: number;
  className?: string;
  children: ReactNode;
}

// Section-local sibling of the shared <Reveal> — deliberately not built on
// Reveal itself (which is used site-wide) because this needs two things
// Reveal doesn't offer: a scale-in on top of the fade/slide, and a `flex`
// base class on the wrapper it actually renders. That `flex` is load-
// bearing, not styling: it's what lets each StepCard's `h-full` resolve to
// a real, stretched height that matches the grid row (Reveal's own inner
// wrapper has no className slot to carry that class through).
const DURATION_SECONDS = 0.7; // mirrors --duration-reveal-slow (tokens.css)

export default function ProcessCardReveal({
  delay = 0,
  className,
  children,
}: ProcessCardRevealProps) {
  const prefersReducedMotion = usePrefersReducedMotion();

  if (prefersReducedMotion) {
    return <div className={cn("flex", className)}>{children}</div>;
  }

  return (
    <motion.div
      className={cn("flex", className)}
      initial={{ opacity: 0, y: 24, scale: 0.97 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: "0px 0px 100px 0px" }}
      transition={{ duration: DURATION_SECONDS, delay, ease: EASE_DECELERATE }}
    >
      {children}
    </motion.div>
  );
}
