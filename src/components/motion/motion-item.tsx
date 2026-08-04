"use client";

import type { ReactNode } from "react";
import { motion, type Variants } from "motion/react";

interface MotionItemProps {
  /** @default "div" */
  as?: "div" | "p";
  reduced: boolean;
  variants: Variants;
  className?: string;
  children: ReactNode;
}

/**
 * The inner half of `MotionLayer`'s fork — a single staggered child inside
 * an animated container. Reduced motion renders the plain tag with no
 * `variants` at all; otherwise the matching `motion.<tag>` plays its
 * `variants` entry, driven by the parent `MotionLayer`'s `initial`/`animate`.
 */
export default function MotionItem({
  as = "div",
  reduced,
  variants,
  className,
  children,
}: MotionItemProps) {
  if (reduced) {
    const Tag = as;
    return <Tag className={className}>{children}</Tag>;
  }

  const MotionTag = motion[as];
  return (
    <MotionTag className={className} variants={variants}>
      {children}
    </MotionTag>
  );
}
