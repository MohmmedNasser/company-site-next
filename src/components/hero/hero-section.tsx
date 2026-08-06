"use client";

import { type Variants, useTransform } from "motion/react";
import { Link } from "@/i18n/navigation";
import { usePrefersReducedMotion } from "@/lib/hooks/use-prefers-reduced-motion";
import { lenisScrollY } from "@/lib/motion/lenis-scroll";
import { EASE_DECELERATE } from "@/lib/motion/easing";
import { buttonClassNames } from "@/components/ui/button";
import Container from "@/components/ui/container";
import MotionLayer from "@/components/motion/motion-layer";
import MotionItem from "@/components/motion/motion-item";
import HeroScrim from "@/components/hero/hero-scrim";
import HeroHeadline from "@/components/hero/hero-headline";
import HeroTrustBadge from "@/components/hero/hero-trust-badge";
import { getHeadlineSettleDelay } from "@/components/hero/hero-motion";
import Silk from "@/components/Silk";

interface HeroSectionProps {
  locale: string;
  title: string;
  subtitle: string;
  ctaPrimaryLabel: string;
  ctaSecondaryLabel: string;
  trustRating: string;
  trustRatingScale: string;
  trustClientsCount: string;
  trustClientsLabel: string;
}

// Task 4: the background layer and the content layer move at different
// rates as the user scrolls past the hero — actual depth, not a fade — and
// the content additionally fades out, reading as an exit into the next
// section. Both ranges are in Lenis-synced scroll pixels (lenisScrollY),
// not viewport-relative fractions, matching header.tsx's existing
// convention for scroll-linked motion in this project.
const BACKGROUND_PARALLAX_RANGE: [number, number] = [0, 900];
const BACKGROUND_PARALLAX_Y: [number, number] = [0, -90];
const CONTENT_PARALLAX_RANGE: [number, number] = [0, 500];
const CONTENT_PARALLAX_Y: [number, number] = [0, -120];
const CONTENT_PARALLAX_OPACITY: [number, number] = [1, 0];

export default function HeroSection({
  locale,
  title,
  subtitle,
  ctaPrimaryLabel,
  ctaSecondaryLabel,
  trustRating,
  trustRatingScale,
  trustClientsCount,
  trustClientsLabel,
}: HeroSectionProps) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const dir = locale === "ar" ? "rtl" : "ltr";

  // Reads the same Lenis-synced MotionValue Header already reads (see
  // lib/motion/lenis-scroll.ts) — not motion's own useScroll(), which
  // subscribes to the native `scroll` event and would desync from what
  // Lenis is actually rendering (see that file's comment). Both transforms
  // are created unconditionally (rules of hooks), same as header.tsx —
  // under reduced motion SmoothScrollProvider never mounts Lenis, so
  // lenisScrollY stays frozen at 0 and these are simply never read below.
  const backgroundY = useTransform(
    lenisScrollY,
    BACKGROUND_PARALLAX_RANGE,
    BACKGROUND_PARALLAX_Y,
    { clamp: true },
  );
  const contentY = useTransform(
    lenisScrollY,
    CONTENT_PARALLAX_RANGE,
    CONTENT_PARALLAX_Y,
    { clamp: true },
  );
  const contentOpacity = useTransform(
    lenisScrollY,
    CONTENT_PARALLAX_RANGE,
    CONTENT_PARALLAX_OPACITY,
    { clamp: true },
  );

  // Task 2 revision: subhead + CTA stagger in AFTER the headline's own
  // word-stagger settles, not simultaneously with it — computed from the
  // actual word count of whatever copy is rendered (via hero-motion.ts),
  // so a longer/shorter translation in either locale still sequences
  // correctly instead of racing or leaving a dead gap.
  const followOnDelay = getHeadlineSettleDelay(title);
  const followOnContainer: Variants = {
    hidden: {},
    visible: {
      transition: { delayChildren: followOnDelay, staggerChildren: 0.12 },
    },
  };
  const followOnItem: Variants = {
    hidden: { opacity: 0, y: 16 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: EASE_DECELERATE },
    },
  };

  const content = (
    <Container className="flex min-h-screen flex-col justify-center gap-48 py-96">
      {/* Headline row: the trust badge sits in the empty inline-end space
          beside the headline (requested directly), not stacked under the
          subtitle. `items-start` keeps it level with the headline's first
          line rather than centering it against the full three-line block;
          `justify-between` pushes it to the far inline-end edge, since the
          headline is a block element that only sizes to its own content
          width as a flex item. Hidden below lg: there is no empty space
          beside the headline once it wraps to the full column width. */}
      <div className="flex items-center justify-between gap-24">
        <HeroHeadline title={title} locale={locale} />
        <MotionLayer
          reduced={prefersReducedMotion}
          className="hidden lg:block"
          initial="hidden"
          animate="visible"
          variants={followOnContainer}
        >
          <MotionItem reduced={prefersReducedMotion} variants={followOnItem}>
            <HeroTrustBadge
              rating={trustRating}
              ratingScale={trustRatingScale}
              clientsCount={trustClientsCount}
              clientsLabel={trustClientsLabel}
            />
          </MotionItem>
        </MotionLayer>
      </div>
      {/* Subtitle + CTA group pushed to the inline-end edge (self-end,
          text-end) rather than stacked under the headline in the same
          column — the headline is the dominant full-width element, this
          group is a secondary block anchored opposite it. max-w-lg keeps
          it from spanning the full width now that it's not confined to a
          narrower headline column. */}
      <MotionLayer
        reduced={prefersReducedMotion}
        className="flex max-w-lg flex-col items-end gap-24 self-end text-end"
        initial="hidden"
        animate="visible"
        variants={followOnContainer}
      >
        <MotionItem
          as="p"
          reduced={prefersReducedMotion}
          variants={followOnItem}
          className="text-16 md:text-14 text-text-secondary text-balance"
        >
          {subtitle}
        </MotionItem>
        <MotionItem
          reduced={prefersReducedMotion}
          variants={followOnItem}
          className="flex flex-wrap items-center justify-end gap-16"
        >
          <Link
            href="/contact"
            className={buttonClassNames({ variant: "primary" })}
          >
            {ctaPrimaryLabel}
          </Link>
          <Link
            href="/portfolio"
            className={buttonClassNames({ variant: "secondary" })}
          >
            {ctaSecondaryLabel}
          </Link>
        </MotionItem>
      </MotionLayer>
    </Container>
  );

  return (
    <section className="relative overflow-hidden">
      {/* Background layer: token-driven CSS gradient (hero-background.tsx),
          parallaxed independently of the content layer below (Task 4). Not
          `relative`/`z-*` — as a position:absolute element it already paints
          above normal-flow siblings by default; adding z-index here would
          only invite the content layer needing to out-rank it too. */}
      <MotionLayer
        reduced={prefersReducedMotion}
        className="absolute inset-0"
        motionStyle={{ y: backgroundY }}
      >
        {/* <HeroBackground /> */}
        <div style={{ width: "100%", height: "100%", position: "relative" }}>
          <Silk
            speed={5}
            scale={1}
            color="#7B7481"
            noiseIntensity={1.5}
            rotation={0}
          />
        </div>
      </MotionLayer>

      {/* Contrast scrim (Task 3, Phase 4) — static, never parallaxed, so
          text protection can't drift out of alignment with the text as the
          background and content layers move at their own independent
          rates. */}
      <HeroScrim dir={dir} />

      {/* Content layer — `relative` is load-bearing: without an explicit
          position, this normal-flow block would still paint underneath
          the absolutely-positioned layers above, regardless of DOM order. */}
      <MotionLayer
        reduced={prefersReducedMotion}
        className="relative"
        motionStyle={{ y: contentY, opacity: contentOpacity }}
      >
        {content}
      </MotionLayer>

      {/* <Reveal
        delay={0.7}
        className="absolute inset-s-32 bottom-32 z-10 md:bottom-48"
      >
        <div
          className={cn(
            "text-text-secondary flex flex-col items-center gap-8",
            !prefersReducedMotion && "animate-bounce",
          )}
        >
          <span className="text-11 font-medium overline">{t("scrollCue")}</span>
          <ChevronDown className="size-16" aria-hidden="true" />
        </div>
      </Reveal> */}
    </section>
  );
}
