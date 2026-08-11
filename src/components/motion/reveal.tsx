"use client";

import { Children, type ReactNode } from "react";
import { motion, useReducedMotion, type Variants } from "motion/react";
import { readDurationSeconds } from "@/lib/motion/read-duration-seconds";

interface RevealProps {
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

export default function Reveal({
  children,
  delay = 0,
  stagger = DEFAULT_STAGGER,
  y = DEFAULT_Y,
  className,
}: RevealProps) {
  // motion's own hook, per Task 3 — not a manual matchMedia check. It
  // already subscribes to the media query change event internally and
  // re-renders this component when it flips.
  const shouldReduceMotion = useReducedMotion();

  // CRITICAL short-circuit: children render fully visible, with no motion
  // wrapper, no opacity/transform, and no whileInView subscription at all —
  // not a shortened version of the same animation. This is the reduced-
  // motion code path; the animated code path is everything below it.
  if (shouldReduceMotion) {
    return <div className={className}>{children}</div>;
  }

  const items = Children.toArray(children);
  const isMultiple = items.length > 1;
  const duration = readDurationSeconds("--duration-reveal", 500);

  // Orchestration lives on the container; each child gets its own `item`
  // variant so staggering an array of children is `staggerChildren`, not N
  // separately-delayed <Reveal> instances (which would each re-run their own
  // viewport observer and duration lookup for no benefit).
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
    visible: { opacity: 1, y: 0, transition: { duration, ease: "easeOut" } },
  };

  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      // Positive bottom margin grows the intersection root downward, so the
      // element is treated as "in view" while still below the visible
      // viewport edge — it starts revealing slightly before it's actually
      // fully visible, per Task 3, instead of only once fully on-screen.
      viewport={{ once: true, margin: "0px 0px 100px 0px" }}
      variants={container}
    >
      {isMultiple ? (
        items.map((child, index) => (
          <motion.div key={index} variants={item}>
            {child}
          </motion.div>
        ))
      ) : (
        <motion.div variants={item}>{items[0]}</motion.div>
      )}
    </motion.div>
  );
}
