"use client";

import type { CSSProperties, ReactNode } from "react";
import {
  motion,
  type MotionProps,
  type MotionStyle,
  type Variants,
} from "motion/react";

interface MotionLayerProps {
  /** When true, renders a plain, fully static `<div>` — no transform, no
   *  animation, no subscription — not a shortened version of the same
   *  motion, per this project's established reduced-motion contract. */
  reduced: boolean;
  className?: string;
  /** Applied in both branches — layout-affecting values reduced motion
   *  still needs (sizing, positioning), as opposed to `motionStyle`. */
  style?: CSSProperties;
  /** Merged in only on the animated branch — MotionValues (scroll-linked
   *  `y`/`scale`/`opacity` etc.) that have no meaning on a plain element. */
  motionStyle?: MotionStyle;
  initial?: MotionProps["initial"];
  animate?: MotionProps["animate"];
  variants?: Variants;
  children: ReactNode;
}

/**
 * The outer half of this project's repeated reduced-motion fork —
 * "plain element when reduced motion, motion.div otherwise, same
 * children either way." Previously duplicated (children written twice)
 * across the hero's background/content layers and the brand mark's
 * scroll-parallax wrapper; this collapses all three call sites to one
 * children block each. Pair with `MotionItem` for staggered children
 * inside an animated container.
 */
export default function MotionLayer({
  reduced,
  className,
  style,
  motionStyle,
  initial,
  animate,
  variants,
  children,
}: MotionLayerProps) {
  if (reduced) {
    return (
      <div className={className} style={style}>
        {children}
      </div>
    );
  }

  return (
    <motion.div
      className={className}
      style={{ ...style, ...motionStyle }}
      initial={initial}
      animate={animate}
      variants={variants}
    >
      {children}
    </motion.div>
  );
}
