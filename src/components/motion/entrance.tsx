"use client";

import { Children, type ReactNode } from "react";
import { motion, useReducedMotion, type Variants } from "motion/react";
import { EASE_DECELERATE } from "@/lib/motion/easing";
import { readDurationSeconds } from "@/lib/motion/read-duration-seconds";

interface EntranceProps {
  children: ReactNode;
  /** Seconds before the (first) child starts animating in. @default 0 */
  delay?: number;
  /** Seconds between each child's start, when `children` is an array. @default 0.08 */
  stagger?: number;
  /** Initial vertical offset in px. @default 24 */
  y?: number;
  className?: string;
}

const DEFAULT_STAGGER = 0.08;
const DEFAULT_Y = 24;

/**
 * Reveal's sibling for content that is on screen the moment the page opens.
 *
 * Same API, same reduced-motion contract, one difference that is the whole
 * point: this animates on MOUNT (`animate`), not on viewport intersection
 * (`whileInView`). A page opener sits above the fold, so a viewport-
 * triggered reveal has to wait a frame for the IntersectionObserver to
 * report what was never in doubt — which is exactly the window where the
 * content pops in unanimated. `animate` starts on the first committed
 * frame instead, so an inner page arrives with a deliberate entrance rather
 * than appearing fully-formed and then being animated at.
 *
 * Use Reveal for anything below the fold; use this only for the opener.
 *
 * Timing differs too: `--duration-reveal-slow` (700ms) and the project's
 * shared deceleration curve, matching what easing.ts already reserves for
 * hero entrances. Scroll reveals stay on the faster 500ms step, so the
 * page's arrival reads as a distinct, slower gesture than the reveals that
 * follow it.
 */
export default function Entrance({
  children,
  delay = 0,
  stagger = DEFAULT_STAGGER,
  y = DEFAULT_Y,
  className,
}: EntranceProps) {
  const shouldReduceMotion = useReducedMotion();

  // CRITICAL short-circuit, identical contract to Reveal: children render
  // fully visible with no motion wrapper, no opacity/transform, and no
  // animation scheduled at all — not a shortened version of the same
  // entrance.
  if (shouldReduceMotion) {
    return <div className={className}>{children}</div>;
  }

  const items = Children.toArray(children);
  const isMultiple = items.length > 1;
  const duration = readDurationSeconds("--duration-reveal-slow", 700);

  const container: Variants = {
    hidden: {},
    visible: {
      transition: {
        delayChildren: delay,
        staggerChildren: isMultiple ? stagger : 0,
      },
    },
  };

  const item: Variants = {
    hidden: { opacity: 0, y },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration, ease: EASE_DECELERATE },
    },
  };

  return (
    <motion.div
      className={className}
      initial="hidden"
      animate="visible"
      variants={container}
    >
      {/* data-entrance is the hook for the `scripting: none` fallback in
          globals.css — motion serialises `initial` into the SSR HTML, and
          this content is above the fold, so it must not stay at opacity 0
          on a page where scripts never run. */}
      {isMultiple ? (
        items.map((child, index) => (
          <motion.div key={index} data-entrance variants={item}>
            {child}
          </motion.div>
        ))
      ) : (
        <motion.div data-entrance variants={item}>
          {items[0]}
        </motion.div>
      )}
    </motion.div>
  );
}
