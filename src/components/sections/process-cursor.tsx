"use client";

import { useEffect, useRef, useState } from "react";
import { MousePointer2 } from "lucide-react";
import { motion } from "motion/react";
import { usePrefersReducedMotion } from "@/lib/hooks/use-prefers-reduced-motion";
import { EASE_DECELERATE } from "@/lib/motion/easing";

interface ProcessCursorProps {
  label: string;
}

// Bespoke idle-loop timing, not one of tokens.css's entrance/micro-
// interaction durations (those cover scroll-reveals and hover/focus, not an
// ambient looping demo) — same reasoning as hero-headline's own local
// WORD_ENTRANCE_DURATION_SECONDS constant.
const LOOP_DURATION_SECONDS = 2.4;
// Arrive by 40%, hold on the button through 75%, return to rest by 100%
// (which is also next loop's 0%, so the repeat wraps with no visible jump).
const TIMES = [0, 0.4, 0.55, 0.75, 1];

export default function ProcessCursor({ label }: ProcessCursorProps) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const cursorRef = useRef<HTMLDivElement>(null);
  const pillRef = useRef<HTMLSpanElement>(null);
  // Distance (px) from the cursor's own resting spot to the pill's centre.
  // Measured from real layout rects rather than a guessed offset — pill
  // width differs between "Launch" and "إطلاق", and rect-based deltas are
  // already correct under RTL (no separate mirroring logic needed), so the
  // cursor lands in the middle of the button in both locales.
  const [target, setTarget] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (prefersReducedMotion) return;

    function measure() {
      const cursorEl = cursorRef.current;
      const pillEl = pillRef.current;
      if (!cursorEl || !pillEl) return;
      const cursorRect = cursorEl.getBoundingClientRect();
      const pillRect = pillEl.getBoundingClientRect();
      setTarget({
        x:
          pillRect.left +
          pillRect.width / 2 -
          (cursorRect.left + cursorRect.width / 2),
        y:
          pillRect.top +
          pillRect.height / 2 -
          (cursorRect.top + cursorRect.height / 2),
      });
    }

    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [prefersReducedMotion]);

  if (prefersReducedMotion) {
    return (
      <div
        aria-hidden="true"
        className="mt-auto flex items-center justify-end gap-8"
      >
        <MousePointer2
          className="text-text-secondary size-16"
          strokeWidth={1.5}
        />
        <span className="bg-surface-raised border-border text-13 text-text-primary rounded-full border px-16 py-8 font-medium">
          {label}
        </span>
      </div>
    );
  }

  return (
    <div
      aria-hidden="true"
      className="mt-auto flex items-center justify-end gap-8"
    >
      {/* Animate the wrapping div, not the lucide <svg> itself. */}
      <motion.div
        ref={cursorRef}
        className="flex shrink-0"
        whileInView={{
          x: [0, target.x, target.x, target.x, 0],
          y: [0, target.y, target.y, target.y, 0],
        }}
        viewport={{ once: false, amount: 0.5 }}
        transition={{
          duration: LOOP_DURATION_SECONDS,
          times: TIMES,
          ease: EASE_DECELERATE,
          repeat: Infinity,
        }}
      >
        <MousePointer2
          className="text-text-secondary size-16"
          strokeWidth={1.5}
        />
      </motion.div>
      <motion.span
        ref={pillRef}
        className="bg-surface-raised border-border text-13 text-text-primary rounded-full border px-16 py-8 font-medium"
        whileInView={{ scale: [1, 1, 0.94, 1.03, 1] }}
        viewport={{ once: false, amount: 0.5 }}
        transition={{
          duration: LOOP_DURATION_SECONDS,
          times: TIMES,
          ease: EASE_DECELERATE,
          repeat: Infinity,
        }}
      >
        {label}
      </motion.span>
    </div>
  );
}
