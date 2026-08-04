"use client";

import dynamic from "next/dynamic";
import { useRef } from "react";
import { usePrefersReducedMotion } from "@/lib/hooks/use-prefers-reduced-motion";
import { useMinWidth } from "@/lib/hooks/use-min-width";
import { useInViewport } from "@/lib/hooks/use-in-viewport";

// Never render the WebGL canvas on the server — this is a real GPU
// context, not just a hydration-mismatch risk like the rest of this
// project's client-only UI.
const MoltenMetalBackground = dynamic(
  () => import("./molten-metal-background"),
  { ssr: false },
);

const DESKTOP_BREAKPOINT_PX = 768;

// Generous margin so a deep link that lands mid-scroll (past the hero)
// still mounts the canvas once the user scrolls back up near it, instead
// of only ever intersecting exactly at the viewport edge. Module-level so
// its identity is stable across renders — see useInViewport's contract.
const OBSERVER_OPTIONS: IntersectionObserverInit = { rootMargin: "200px 0px" };

/**
 * Decides WHETHER the real Molten Metal canvas renders at all, before it
 * ever mounts. All three gates must pass:
 *   1. Viewport width >= 768px (matchMedia, live-updating)
 *   2. prefers-reduced-motion is off (matchMedia, live-updating)
 *   3. This layer is in or near the viewport (IntersectionObserver)
 *
 * Any gate failing renders the static gradient fallback instead. Because
 * the canvas is mounted/unmounted (not just hidden) based on gate #3,
 * scrolling the hero off-screen actually cancels its rAF loop — see
 * molten-metal-background.tsx's effect cleanup — rather than leaving a
 * still-running animation hidden behind the fallback.
 */
export default function HeroBackground() {
  const containerRef = useRef<HTMLDivElement>(null);
  const isDesktop = useMinWidth(DESKTOP_BREAKPOINT_PX);
  const prefersReducedMotion = usePrefersReducedMotion();
  const isNearViewport = useInViewport(containerRef, OBSERVER_OPTIONS);

  const shouldRenderCanvas =
    isDesktop && !prefersReducedMotion && isNearViewport;

  return (
    <div ref={containerRef} className="absolute inset-0">
      {shouldRenderCanvas ? (
        <MoltenMetalBackground />
      ) : (
        <StaticGradientFallback />
      )}
    </div>
  );
}

// Never a black rectangle — a designed, token-driven gradient that reads
// intentionally in both themes (design-decisions.md §4). Two soft radial
// blobs in the brand hues echo the canvas's own colour without any JS/GPU
// work, so mobile and reduced-motion visitors still get something that
// feels authored rather than a placeholder.
function StaticGradientFallback() {
  return (
    <div
      className="absolute inset-0"
      style={{
        backgroundImage: [
          "radial-gradient(60% 55% at 20% 25%, color-mix(in srgb, var(--color-primary) 22%, transparent), transparent 70%)",
          "radial-gradient(55% 60% at 85% 80%, color-mix(in srgb, var(--color-secondary) 16%, transparent), transparent 70%)",
        ].join(", "),
        backgroundColor: "var(--color-bg)",
      }}
    />
  );
}
