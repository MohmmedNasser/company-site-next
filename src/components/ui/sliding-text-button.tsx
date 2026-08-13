"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils/cn";

type SlidingTextButtonSize = "default" | "compact";

interface SlidingTextButtonProps extends Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  "children"
> {
  children: ReactNode;
  /** @default "default" */
  size?: SlidingTextButtonSize;
}

const SIZE_CLASSES: Record<SlidingTextButtonSize, string> = {
  default: "text-14 px-24 py-12 gap-12",
  compact: "text-13 px-16 py-8 gap-8",
};

const BADGE_SIZE_CLASSES: Record<SlidingTextButtonSize, string> = {
  default: "size-32",
  compact: "size-24",
};

const ARROW_SIZE_CLASSES: Record<SlidingTextButtonSize, string> = {
  default: "size-16",
  compact: "size-14",
};

/**
 * Reference: framer.com/community/marketplace/components/sliding-text-button
 * (visual/interaction reference only — no code borrowed, no dependency
 * installed; this is a from-scratch Tailwind implementation).
 *
 * Two synced layers, both riding the same duration-micro/ease-decelerate
 * transition:
 *  - a fill parked past the inline-end edge (`start-full`) that sweeps to
 *    `start-0` on hover, covering start->end in reading order — done with
 *    the logical `start-*` utility (not `-left-full`/`translate-x`) so the
 *    sweep direction mirrors correctly under `dir="rtl"` automatically.
 *  - a two-row text clip: the real (accessible) label rolls up and out
 *    while an aria-hidden duplicate, tinted for the post-sweep background,
 *    rolls up into its place from below.
 *
 * The trailing arrow badge is deliberately inverted relative to the
 * button's own bg/text: bg-text-primary / text-card cross-wires two
 * tokens that already flip per theme, so the badge lands on the exact
 * dark-mode-white / light-mode-dark pairing that was asked for without
 * adding a new "always dark" or "always white" token (there is no such
 * token today — see design-system skill, "no raw hex ever").
 */
export default function SlidingTextButton({
  children,
  size = "default",
  className,
  type = "button",
  ...rest
}: SlidingTextButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        "group border-border bg-surface rounded-control relative isolate inline-flex items-center justify-center overflow-hidden border font-medium",
        "disabled:pointer-events-none disabled:opacity-50",
        SIZE_CLASSES[size],
        className,
      )}
      {...rest}
    >
      <span
        aria-hidden="true"
        className="bg-primary duration-micro ease-decelerate absolute inset-y-0 start-full -z-10 w-full transition-[inset-inline-start] group-hover:start-0 group-focus-visible:start-0 motion-reduce:transition-none"
      />
      <span className="relative inline-block overflow-hidden">
        <span className="text-text-primary duration-micro ease-decelerate block transition-transform group-hover:-translate-y-full group-focus-visible:-translate-y-full motion-reduce:transition-none">
          {children}
        </span>
        <span
          aria-hidden="true"
          className="text-on-primary duration-micro ease-decelerate absolute start-0 top-0 block translate-y-full transition-transform group-hover:translate-y-0 group-focus-visible:translate-y-0 motion-reduce:transition-none"
        >
          {children}
        </span>
      </span>
      <span
        aria-hidden="true"
        className={cn(
          "bg-text-primary text-card duration-micro ease-decelerate inline-flex shrink-0 items-center justify-center rounded-full transition-transform group-hover:translate-x-4 motion-reduce:transition-none rtl:group-hover:-translate-x-4",
          BADGE_SIZE_CLASSES[size],
        )}
      >
        {/* rtl:-scale-x-100, matching this same icon's treatment in
            mobile-nav.tsx — an up-right arrow is directional and must
            mirror under RTL like every other ArrowRight/ChevronRight in
            this project. */}
        <ArrowUpRight
          className={cn(ARROW_SIZE_CLASSES[size], "rtl:-scale-x-100")}
        />
      </span>
    </button>
  );
}
