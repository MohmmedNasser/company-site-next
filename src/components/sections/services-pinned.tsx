"use client";

import { useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useTransform,
} from "motion/react";
import Image from "next/image";
import { useScrollRevealProgress } from "@/lib/hooks/use-scroll-reveal-progress";
import { EASE_DECELERATE } from "@/lib/motion/easing";
import { cn } from "@/lib/utils/cn";
import type { ServiceDisplay } from "@/components/sections/services-section";

interface ServicesPinnedProps {
  services: ServiceDisplay[];
  categoriesLabel: string;
}

// vh of scroll room dedicated to each service while the section is pinned
// — tunable. 70vh over 6 services is a ~420vh pin range: long enough for a
// real dwell per service, short enough not to feel like a scroll trap.
const STEP_VIEWPORT_HEIGHT_VH = 70;

// Continuous parallax range (px) applied to the active image across its
// own slice of the pin's scroll progress — see subProgress below for why
// this resets every service change instead of accumulating drift.
const PARALLAX_RANGE: [number, number] = [-14, 14];

const CROSSFADE_TRANSITION = { duration: 0.5, ease: EASE_DECELERATE };

/**
 * The interactive Services widget: a tall wrapper (N services x
 * STEP_VIEWPORT_HEIGHT_VH) whose inner content is `sticky top-0`, so it
 * visually pins in the viewport for the whole wrapper's scroll range —
 * `useScrollRevealProgress(wrapperRef, 0, 1)` produces exactly that same
 * 0->1 timeline for free (progress 0 = wrapper top hits viewport top =
 * pin engages; progress 1 = wrapper bottom meets viewport bottom = the
 * sticky child's release point). Only ever mounted on desktop clients
 * without prefers-reduced-motion — see services-scroller.tsx.
 */
export default function ServicesPinned({
  services,
  categoriesLabel,
}: ServicesPinnedProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const count = services.length;

  const progress = useScrollRevealProgress(wrapperRef, 0, 1);

  useMotionValueEvent(progress, "change", (value) => {
    const next = Math.min(count - 1, Math.max(0, Math.floor(value * count)));
    setActiveIndex((prev) => (prev === next ? prev : next));
  });

  // Fractional position within the CURRENT service's own slice (0->1), not
  // the whole pin range — this is what makes the image parallax reset
  // cleanly on every service change instead of drifting further each time.
  const subProgress = useTransform(progress, (value) => {
    const scaled = Math.min(count, Math.max(0, value * count));
    return scaled - Math.floor(scaled);
  });
  const imageY = useTransform(subProgress, [0, 1], PARALLAX_RANGE);

  const active = services[activeIndex];
  const activeNumber = String(activeIndex + 1).padStart(2, "0");

  return (
    <div
      ref={wrapperRef}
      style={{ height: `${count * STEP_VIEWPORT_HEIGHT_VH}vh` }}
    >
      <div className="sticky top-0 flex h-screen items-center">
        {/* First DOM child = image+description card, second = the service
            list — same row. A plain logical flex-row reorders itself
            under dir="rtl" with no rtl: classes needed: the card lands on
            the physical start side and the list on the end side in both
            locales — left/right for en, right/left for ar. */}
        <div className="flex w-full flex-col gap-32 md:flex-row md:items-start md:gap-64">
          <div className="flex flex-1 flex-col gap-24">
            {/* Landscape banner (wider than tall). All N images stay
                mounted and crossfade by opacity rather than an
                AnimatePresence mount/unmount per active service — the
                latter meant every swap kicked off a brand-new network
                fetch for a remote photo, which briefly showed the empty
                card background mid-crossfade on anything slower than an
                instant cache hit. */}
            <div className="border-border bg-card rounded-card relative aspect-video w-full overflow-hidden border">
              {services.map((service, index) => {
                const isActive = index === activeIndex;
                return (
                  <motion.div
                    key={service.id}
                    className="absolute inset-0"
                    style={{ y: isActive ? imageY : 0 }}
                    animate={{ opacity: isActive ? 1 : 0 }}
                    transition={CROSSFADE_TRANSITION}
                  >
                    <Image
                      src={service.image}
                      alt=""
                      fill
                      sizes="(min-width: 768px) 50vw, 100vw"
                      className="object-cover"
                      priority={index === 0}
                    />
                  </motion.div>
                );
              })}
            </div>

            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={active.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={CROSSFADE_TRANSITION}
                className="flex flex-col gap-16"
              >
                <div className="flex items-center gap-16">
                  <span className="text-12 text-text-secondary shrink-0 font-medium tabular-nums">
                    [{activeNumber}]
                  </span>
                  <h3 className="text-20 text-text-primary font-semibold">
                    {active.title}
                  </h3>
                </div>
                <p className="text-14 text-text-secondary">{active.excerpt}</p>
                <div className="mt-8 flex flex-col gap-8">
                  <span className="text-12 text-text-secondary font-medium">
                    {categoriesLabel}
                  </span>
                  <div className="flex flex-wrap gap-8">
                    {active.categories.map((category) => (
                      <span
                        key={category}
                        className="border-border text-text-primary text-13 rounded-full border px-16 py-8"
                      >
                        {category}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          <ul className="flex-1">
            {services.map((service, index) => (
              <li
                key={service.id}
                className={cn(
                  // Smaller than the earlier headline-scale treatment — this
                  // is a navigational list, not a display heading. Arabic
                  // (Noto Kufi) renders visually heavier/larger than Latin
                  // at an identical size, so it steps down one notch
                  // further via the rtl: variant rather than sharing the
                  // en size, matching the rtl:-scale-x-100 pattern already
                  // used elsewhere in this project for locale-specific
                  // adjustments.
                  "text-16 md:text-20 rtl:text-14 md:rtl:text-18 duration-micro border-border border-t py-16 font-semibold tracking-[-0.02em] transition-colors first:border-t-0 first:pt-0",
                  index === activeIndex
                    ? "text-text-primary"
                    : "text-text-secondary",
                )}
              >
                {service.title}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
