// src/lib/motion/read-duration-seconds.ts

// Reads a duration CSS custom property (e.g. --duration-reveal,
// --duration-micro) from the document root and converts it from
// milliseconds to seconds — motion's transition.duration takes a plain
// number of seconds with no way to hand it a CSS var() directly. Falls
// back to `fallbackMs` during SSR (no `window`) or if the token is
// missing/invalid, so tokens.css stays the single source of truth without
// a runtime crash if it's ever unset. Duration tokens are static across
// the light/dark toggle (unlike color tokens), so a plain read is enough —
// no useSyncExternalStore subscription needed, this isn't mount/hydration
// state.
export function readDurationSeconds(
  cssVar: string,
  fallbackMs: number,
): number {
  if (typeof window === "undefined") return fallbackMs / 1000;
  const raw = getComputedStyle(document.documentElement)
    .getPropertyValue(cssVar)
    .trim();
  const ms = Number.parseFloat(raw);
  return (Number.isFinite(ms) && ms > 0 ? ms : fallbackMs) / 1000;
}
