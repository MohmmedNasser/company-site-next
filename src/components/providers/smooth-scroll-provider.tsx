"use client";

import { useEffect, type ReactNode } from "react";
import { ReactLenis, useLenis } from "lenis/react";
// next/navigation's usePathname, NOT the locale-aware one from
// @/i18n/navigation: this provider is mounted OUTSIDE
// <NextIntlClientProvider> (see the locale layout — Lenis has to wrap
// everything, including the provider tree), so next-intl's hooks have no
// context here and throw "No intl context found". The locale prefix is
// stripped below instead, which needs no context at all.
import { usePathname } from "next/navigation";
import { routing } from "@/i18n/routing";
import { useIsMounted } from "@/lib/hooks/use-is-mounted";
import { usePrefersReducedMotion } from "@/lib/hooks/use-prefers-reduced-motion";
import { lenisScrollProgress, lenisScrollY } from "@/lib/motion/lenis-scroll";

// Rendered as a child of <ReactLenis root>, so useLenis() below resolves the
// LenisContext that component provides. Renders nothing — it exists purely
// to write every Lenis scroll tick into the shared MotionValues from
// lenis-scroll.ts, which is what keeps motion's scroll-linked animations in
// later phases synced to what Lenis is actually rendering (see that file's
// comment for why useScroll() alone isn't enough).
function LenisMotionSync() {
  useLenis((lenis) => {
    lenisScrollY.set(lenis.scroll);
    lenisScrollProgress.set(lenis.progress);
  });
  return null;
}

// `routing.locales` is a readonly tuple of literal types, so its .includes()
// only accepts those literals — widening to readonly string[] is what lets
// an arbitrary path segment be tested against it.
const LOCALE_SEGMENTS: readonly string[] = routing.locales;

/**
 * "/en/services/web-development" → "/services/web-development".
 * A path with no locale prefix (or none we recognise) is returned as-is.
 */
function routeWithoutLocale(pathname: string): string {
  const [, first, ...rest] = pathname.split("/");
  if (!LOCALE_SEGMENTS.includes(first)) return pathname;
  return `/${rest.join("/")}`;
}

/**
 * Resets the scroll position to the top of the document on every route
 * change. Renders nothing.
 *
 * WHY THIS IS NEEDED AT ALL: the App Router already scrolls to the top on
 * navigation — it calls `window.scrollTo(0, 0)` itself — but Lenis doesn't
 * observe the window's scroll position, it OWNS it. Lenis keeps its own
 * `animatedScroll` value and writes it back through `window.scrollTo` on
 * every animation frame, so the router's reset is overwritten on the very
 * next frame and the new page renders at whatever offset the previous page
 * was left at. That's the "navigate from mid-page and land mid-page" bug.
 * Telling Lenis to scroll resets its internal value too, which is the only
 * reset that survives the next frame.
 *
 * WHY `immediate`, NOT AN ANIMATED SCROLL: by the time this effect runs the
 * new page's DOM is already mounted, so an animated scroll would smoothly
 * travel up through content the visitor has never seen — it reads as the
 * page scrolling itself, not as arriving at a new page. The smoothness
 * belongs to the arrival instead: the new page's opener plays its entrance
 * from the top (see components/motion/entrance.tsx).
 *
 * SCOPE: only rendered inside the <ReactLenis> branch. Under reduced motion
 * Lenis never mounts, the router's native reset is never overwritten, and
 * duplicating it here would only override the browser's own back/forward
 * scroll restoration for no benefit.
 *
 * KNOWN TRADE-OFF: `usePathname` fires for back/forward navigation too, so
 * returning to a page lands at its top rather than where it was left. That
 * is the same behaviour every Lenis + App Router site ships with, and it is
 * strictly better than the current bug; restoring a remembered offset would
 * mean tracking positions per history entry ourselves, since Lenis has
 * already broken the browser's own restoration by owning the scroll.
 */
function LenisScrollReset() {
  const pathname = usePathname();
  const lenis = useLenis();
  // The route WITHOUT its locale prefix, so switching AR↔EN (a
  // router.replace to the same route under a different locale) doesn't
  // read as a route change and doesn't throw the reader back to the top of
  // the page they were already reading. Reproduces what next-intl's own
  // usePathname would return, without needing its context.
  const route = routeWithoutLocale(pathname);

  useEffect(() => {
    lenis?.scrollTo(0, { immediate: true });
  }, [route, lenis]);

  return null;
}

export function SmoothScrollProvider({ children }: { children: ReactNode }) {
  // useSyncExternalStore's hydration contract forces BOTH of these hooks to
  // report their hydration-safe server-snapshot value ("not mounted" /
  // "motion is fine") on the very first client render, even though the
  // real browser value is already known — verified empirically: without
  // the `mounted` gate below, `window.lenis` (a flag Lenis's constructor
  // sets and never clears) was still present after a full reduced-motion
  // test run, proving <ReactLenis> had briefly mounted — a real Lenis
  // instance constructed for one render — before this component corrected
  // itself. Mounting Lenis is a genuine side effect (unlike this
  // codebase's other useSyncExternalStore reads, which are purely visual),
  // so it must not run during that transient window. Gating on `mounted`
  // (useIsMounted, reused per Task 1) defers Lenis construction to the
  // corrected render, where prefersReducedMotion is also guaranteed
  // accurate by then.
  const mounted = useIsMounted();
  const prefersReducedMotion = usePrefersReducedMotion();

  // CRITICAL: under prefers-reduced-motion, Lenis is not instantiated at
  // all — not "instantiated with a shorter duration." <ReactLenis root>
  // renders `children` directly with no wrapper DOM when root is true (see
  // lenis/react's source), so this branch produces the exact same markup
  // wrapped in a fragment instead, and scrolling falls back entirely to
  // native browser scroll.
  if (!mounted || prefersReducedMotion) {
    return <>{children}</>;
  }

  return (
    <ReactLenis
      root
      options={{
        lerp: 0.1,
        wheelMultiplier: 1,
        // Lenis's touch smoothing fights native momentum scroll on phones —
        // orientation/gestureOrientation default to "vertical" already, so
        // this site (which never scrolls horizontally) needs no extra
        // config for that; syncTouch is the one flag worth being explicit
        // about, since leaving it on is the most common cause of janky
        // mobile scrolling with Lenis.
        syncTouch: false,
      }}
    >
      <LenisMotionSync />
      <LenisScrollReset />
      {children}
    </ReactLenis>
  );
}
