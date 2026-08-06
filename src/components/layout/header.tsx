"use client";

import { useState } from "react";
import { Moon, Sun } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useTheme } from "next-themes";
import { motion, useMotionValueEvent } from "motion/react";
import { Link, usePathname, useRouter } from "@/i18n/navigation";
import { useIsMounted } from "@/lib/hooks/use-is-mounted";
import { usePrefersReducedMotion } from "@/lib/hooks/use-prefers-reduced-motion";
import { lenisScrollY } from "@/lib/motion/lenis-scroll";
import { EASE_DECELERATE } from "@/lib/motion/easing";
import { NAV_ITEMS, isNavItemActive } from "@/lib/nav";
import { cn } from "@/lib/utils/cn";
import { buttonClassNames } from "@/components/ui/button";
import MobileNav from "@/components/layout/mobile-nav";
import Image from "next/image";

const CTA_HREF = "/contact";

// Small enough that "condensed" arrives as soon as scrolling genuinely
// begins (Task 1: "only after scroll begins"), not after some larger travel
// distance.
const CONDENSE_THRESHOLD_PX = 8;

const NAV_INDICATOR_LAYOUT_ID = "header-active-nav-indicator";

function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const t = useTranslations("common");
  const mounted = useIsMounted();
  const isDark = mounted ? resolvedTheme === "dark" : undefined;

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={t("a11y.toggleTheme")}
      className="text-text-primary hover:bg-surface duration-micro inline-flex size-40 shrink-0 items-center justify-center rounded-full transition-colors"
    >
      {isDark === undefined ? null : isDark ? (
        <Sun aria-hidden="true" className="size-20" />
      ) : (
        <Moon aria-hidden="true" className="size-20" />
      )}
    </button>
  );
}

function LocaleSwitcher() {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const t = useTranslations("common.locale");
  const target = locale === "ar" ? "en" : "ar";
  const label = locale === "ar" ? t("switchToEnglish") : t("switchToArabic");

  return (
    <button
      type="button"
      onClick={() => router.replace(pathname, { locale: target })}
      aria-label={label}
      // text-primary + opacity, not a text-secondary/text-primary colour
      // swap — see header's contrast comment: text-secondary fails AA
      // against the condensed glass surface's worst-case backdrop even at
      // high opacity, so nothing in this header relies on it any more.
      className="text-13 text-text-primary hover:bg-surface duration-micro rounded-full px-12 py-8 font-medium opacity-70 transition-opacity hover:opacity-100"
    >
      {target === "ar" ? "AR" : "EN"}
    </button>
  );
}

function NavLinks() {
  const pathname = usePathname();
  const t = useTranslations("common");

  return (
    <nav
      aria-label={t("a11y.primaryNav")}
      className="hidden items-center gap-32 md:flex"
    >
      {NAV_ITEMS.map((item) => {
        const isActive = isNavItemActive(pathname, item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              // Always text-primary — active/inactive state is signalled by
              // the sliding indicator + letter-spacing below, not colour
              // alone (also sidesteps the contrast problem text-secondary
              // has against the condensed glass surface's worst case).
              "text-14 text-text-primary rounded-control duration-micro relative inline-flex flex-col items-center gap-8 font-medium transition-opacity",
              isActive
                ? "tracking-[0.01em] opacity-100"
                : "opacity-70 hover:opacity-100",
            )}
          >
            {t(`nav.${item.key}`)}
            {isActive && (
              <motion.span
                layoutId={NAV_INDICATOR_LAYOUT_ID}
                className="bg-primary absolute inset-x-0 -bottom-4 h-2 rounded-full"
                transition={{ duration: 0.15, ease: EASE_DECELERATE }}
              />
            )}
          </Link>
        );
      })}
    </nav>
  );
}

function HeaderContent({ ctaLabel }: { ctaLabel: string }) {
  const t = useTranslations("common");

  return (
    <div className="flex h-full items-center justify-between gap-24 ps-8 pe-8">
      <Link
        href="/"
        aria-label={t("nav.home")}
        className="duration-micro inline-flex shrink-0 items-center gap-8 py-4 ps-4 pe-12"
      >
        <Image
          src="/brand/white/codexa-mark-white.svg"
          loading="eager"
          alt="logo"
          width={40}
          height={40}
        />
        <span
          lang="en"
          style={{ fontFamily: "var(--font-sans-latin), sans-serif" }}
          className="text-text-primary text-16 leading-none font-semibold tracking-[-0.03em]"
        >
          Codexa
        </span>
      </Link>

      <NavLinks />

      <div className="flex shrink-0 items-center gap-4">
        <LocaleSwitcher />
        <ThemeToggle />
        <Link
          href={CTA_HREF}
          className={cn(
            buttonClassNames({ variant: "primary", size: "compact" }),
            "hidden lg:inline-flex",
          )}
        >
          {ctaLabel}
        </Link>
        <MobileNav ctaHref={CTA_HREF} ctaLabel={ctaLabel} />
      </div>
    </div>
  );
}

// Shared with both the animated and reduced-motion render paths so the
// glass treatment (design-decisions.md §9) can't drift between them.
const GLASS_TRANSITION_CLASSES =
  "transition-[height,background-color,backdrop-filter,border-color] duration-micro ease-decelerate";

export default function Header() {
  const t = useTranslations("common");
  const prefersReducedMotion = usePrefersReducedMotion();
  const ctaLabel = t("actions.startProject");

  // Lazy initializer reads the MotionValue's current value at mount, so a
  // page load that lands mid-scroll (refresh, deep link) starts condensed
  // immediately instead of flashing an incorrect "at top" state for one
  // frame. useMotionValueEvent then keeps it in sync with every Lenis
  // scroll tick — this IS reading the Lenis-synced value (not a second,
  // native scroll listener), just consumed as a discrete threshold instead
  // of a continuously-scrubbed one: a value that scrubs 1:1 with scroll
  // position has no independent "easing" to give it, and this wants a real
  // eased *transition* between two states.
  const [isCondensed, setIsCondensed] = useState(
    () => lenisScrollY.get() > CONDENSE_THRESHOLD_PX,
  );
  useMotionValueEvent(lenisScrollY, "change", (latest) => {
    setIsCondensed(latest > CONDENSE_THRESHOLD_PX);
  });

  // CRITICAL: under reduced motion, SmoothScrollProvider never mounts
  // Lenis (see that file), so lenisScrollY stays frozen at 0 forever even
  // though the user can still scroll the real page natively — there is no
  // reliable signal here to distinguish "at top" from "scrolled". Rather
  // than silently misreport "always at top", this keeps the pre-existing
  // reduced-motion contract (header always renders its settled state):
  // showGlass is unconditionally true whenever reduced motion is on,
  // regardless of isCondensed, since scroll-gating is unavailable here by
  // construction.
  const showGlass = prefersReducedMotion || isCondensed;

  return (
    <header
      style={{
        backgroundColor: showGlass
          ? "color-mix(in srgb, var(--color-surface-raised) var(--overlay-surface-opacity), transparent)"
          : "transparent",
        // Both states use the `blur()` function (0px vs the token value)
        // rather than toggling to/from `none`, so the browser has a
        // matching function to interpolate between — swapping filter
        // *functions* doesn't reliably transition smoothly.
        backdropFilter: showGlass ? "blur(var(--blur-overlay))" : "blur(0px)",
        borderColor: showGlass ? "var(--color-border)" : "transparent",
      }}
      className={cn(
        // Floating pill, not a full-width bar: fixed (removed from normal
        // flow — this project's other pages don't yet exist to need
        // compensating top clearance; the home page's hero is a full-bleed
        // background specifically designed to sit behind a floating header,
        // see hero-section.tsx) with equal inset margins on mobile, capped
        // and centered on wider viewports so it doesn't stretch edge to
        // edge. `overflow-hidden` keeps the glass/blur inside the pill's
        // own rounded shape instead of bleeding past its corners.
        "fixed inset-x-16 top-16 z-40 mx-auto max-w-5xl overflow-hidden rounded-full border",
        showGlass ? "h-52" : "h-64",
        // No transition at all under reduced motion — a static, permanently
        // settled header has nothing to ease between.
        !prefersReducedMotion && GLASS_TRANSITION_CLASSES,
      )}
    >
      <HeaderContent ctaLabel={ctaLabel} />
    </header>
  );
}
