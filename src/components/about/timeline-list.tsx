"use client";

import { motion, useReducedMotion, type Variants } from "motion/react";
import { EASE_DECELERATE } from "@/lib/motion/easing";
import { readDurationSeconds } from "@/lib/motion/read-duration-seconds";
import StatusCircle, {
  type StatusCircleState,
} from "@/components/ui/status-circle";

export interface TimelineEntryDisplay {
  id: string;
  year: string;
  status: Extract<StatusCircleState, "done" | "in-progress" | "todo">;
  title: string;
  description: string;
  /** Translated name of the state, for StatusCircle's accessible label. */
  statusLabel: string;
}

interface TimelineListProps {
  entries: TimelineEntryDisplay[];
}

// Wider than Reveal's 0.08 on purpose: the reader is meant to read these in
// order, and a gap you can feel between rows is what turns a list that
// happens to be dated into one that reads as a sequence.
const ROW_STAGGER = 0.12;

// Everything below the marker in one row. Shared by both render paths so
// the reduced-motion version can never drift from the animated one.
function RowContent({ entry }: { entry: TimelineEntryDisplay }) {
  return (
    <>
      <StatusCircle
        state={entry.status}
        size="md"
        // Marketing page: the monochrome tone, not the issue-tracker
        // colours. The shape still distinguishes the three states.
        tone="mono"
        label={entry.statusLabel}
      />

      <div className="flex flex-col gap-8">
        <span className="text-12 text-text-secondary font-medium tabular-nums">
          {entry.year}
        </span>
        <h3 className="text-20 md:text-24 text-text-primary font-semibold text-balance">
          {entry.title}
        </h3>
        <p className="text-14 text-text-secondary max-w-640">
          {entry.description}
        </p>
      </div>
    </>
  );
}

const ROW_CLASSES = "relative flex gap-16 pb-32 last:pb-0 md:gap-24";
// `inset-s-12` + `border-s`, never left/right — the rail moves to the other
// edge under dir="rtl" on its own. `origin-top` is direction-agnostic, so
// the draw direction needs no RTL variant either.
const RAIL_CLASSES =
  "border-border absolute inset-s-12 top-24 bottom-0 border-s";

/**
 * The /about timeline, as a real <ol> that reveals row by row.
 *
 * This is a client component specifically so each row can be a `motion.li`.
 * The earlier server-rendered version had to wrap the whole list in one
 * <Reveal> — per-row would have put Reveal's own <div> between <ol> and
 * <li>, which is invalid and strips the list semantics — so the list
 * arrived as a single block. `motion.li` IS the <li>, so the rows can
 * stagger with the markup intact.
 *
 * The rail segment between two markers draws downward as its row arrives,
 * which is the one place on these pages where the motion carries meaning
 * rather than decorating: the line literally advances through the sequence
 * the content describes. Variant labels propagate from the <ol> down
 * through each row to its rail, so the whole thing is one orchestration,
 * not N independently-scheduled animations.
 */
export default function TimelineList({ entries }: TimelineListProps) {
  const shouldReduceMotion = useReducedMotion();

  // CRITICAL short-circuit, same contract as Reveal and Entrance: the list
  // renders fully visible, with no motion components, no viewport
  // subscription, and rails at their full height — not a faster draw.
  if (shouldReduceMotion) {
    return (
      <ol className="flex max-w-640 flex-col">
        {entries.map((entry, index) => (
          <li key={entry.id} className={ROW_CLASSES}>
            {index < entries.length - 1 && (
              <span aria-hidden="true" className={RAIL_CLASSES} />
            )}
            <RowContent entry={entry} />
          </li>
        ))}
      </ol>
    );
  }

  const duration = readDurationSeconds("--duration-reveal", 500);
  const railDuration = readDurationSeconds("--duration-reveal-slow", 700);

  const list: Variants = {
    hidden: {},
    visible: { transition: { staggerChildren: ROW_STAGGER } },
  };

  const row: Variants = {
    hidden: { opacity: 0, y: 24 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration, ease: EASE_DECELERATE },
    },
  };

  // Slower than the row it belongs to, so the line is still travelling
  // when the next row starts arriving — that overlap is what reads as the
  // timeline advancing rather than as five separate line segments.
  const rail: Variants = {
    hidden: { scaleY: 0 },
    visible: {
      scaleY: 1,
      transition: { duration: railDuration, ease: EASE_DECELERATE },
    },
  };

  return (
    <motion.ol
      className="flex max-w-640 flex-col"
      initial="hidden"
      whileInView="visible"
      // Same margin Reveal uses: start while the block is still just below
      // the viewport edge, so the first row isn't already fully on screen
      // before it begins.
      viewport={{ once: true, margin: "0px 0px 100px 0px" }}
      variants={list}
    >
      {entries.map((entry, index) => (
        <motion.li key={entry.id} variants={row} className={ROW_CLASSES}>
          {index < entries.length - 1 && (
            <motion.span
              aria-hidden="true"
              variants={rail}
              className={`${RAIL_CLASSES} origin-top`}
            />
          )}
          <RowContent entry={entry} />
        </motion.li>
      ))}
    </motion.ol>
  );
}
