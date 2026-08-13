"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "motion/react";
import { EASE_DECELERATE } from "@/lib/motion/easing";
import { readDurationSeconds } from "@/lib/motion/read-duration-seconds";

interface HeroImageProps {
  src: string;
  /**
   * Left empty by default: on every page that uses this, the image sits
   * directly under an <h1> that already names the subject, so alt text
   * would be a duplicate announcement. Pass a string only when the image
   * carries information the surrounding copy doesn't.
   * @default ""
   */
  alt?: string;
  /** @default "(min-width: 1280px) 1216px, 100vw" */
  sizes?: string;
}

const FRAME_CLASSES =
  "border-border bg-card rounded-card relative aspect-video w-full overflow-hidden border";
// Grayscale: the full-colour photography exception is scoped to the HOME
// services section (see Service.image in lib/content/types.ts), so every
// other photograph on the site is desaturated — see the inner-pages section
// of docs/design-decisions.md.
const IMAGE_CLASSES = "object-cover grayscale";
const DEFAULT_SIZES = "(min-width: 1280px) 1216px, 100vw";

// How far past its frame the photograph starts. Small on purpose: enough to
// read as settling, not enough to look like a zoom.
const START_SCALE = 1.06;

/**
 * The lead image on a detail page, settling into its frame on load.
 *
 * The frame doesn't move — only the photograph inside it scales down behind
 * `overflow-hidden`, so the page's layout is stable from the first frame and
 * the border never shifts. Scaling the frame itself would move everything
 * below it, which is a layout-shift problem as well as an uglier effect.
 *
 * A `motion.div` rather than <Entrance>: this needs `scale` on the image and
 * nothing on the wrapper, which Entrance's opacity+y contract doesn't
 * express. Same duration token and easing curve as Entrance, so the opener
 * and the image read as one arrival rather than two effects.
 *
 * `priority` is unconditional — wherever this is used it's the page's LCP
 * element, and animating it must not cost it its preload.
 */
export default function HeroImage({
  src,
  alt = "",
  sizes = DEFAULT_SIZES,
}: HeroImageProps) {
  const shouldReduceMotion = useReducedMotion();

  // CRITICAL short-circuit, same contract as Reveal and Entrance: the plain
  // image, no motion wrapper, no transform scheduled — not a shorter scale.
  if (shouldReduceMotion) {
    return (
      <div className={FRAME_CLASSES}>
        <Image
          src={src}
          alt={alt}
          fill
          priority
          sizes={sizes}
          className={IMAGE_CLASSES}
        />
      </div>
    );
  }

  const duration = readDurationSeconds("--duration-reveal-slow", 700);

  return (
    <div className={FRAME_CLASSES}>
      <motion.div
        className="absolute inset-0"
        initial={{ scale: START_SCALE, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration, ease: EASE_DECELERATE }}
      >
        <Image
          src={src}
          alt={alt}
          fill
          priority
          sizes={sizes}
          className={IMAGE_CLASSES}
        />
      </motion.div>
    </div>
  );
}
