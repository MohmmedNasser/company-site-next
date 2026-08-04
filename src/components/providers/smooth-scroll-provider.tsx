"use client";

import type { ReactNode } from "react";
import { ReactLenis, useLenis } from "lenis/react";
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
      {children}
    </ReactLenis>
  );
}
