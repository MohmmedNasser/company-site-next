// src/lib/motion/read-duration-seconds.ts

// Reads a duration CSS custom property (e.g. --duration-reveal,
// --duration-micro) from the document root and returns it in SECONDS —
// motion's transition.duration takes a plain number of seconds with no way
// to hand it a CSS var() directly. Falls back to `fallbackMs` during SSR
// (no `window`) or if the token is missing/invalid, so tokens.css stays the
// single source of truth without a runtime crash if it's ever unset.
// Duration tokens are static across the light/dark toggle (unlike color
// tokens), so a plain read is enough — no useSyncExternalStore subscription
// needed, this isn't mount/hydration state.
//
// THE UNIT MUST BE READ, NOT ASSUMED. tokens.css authors these in
// milliseconds (`--duration-reveal-slow: 700ms`), but Tailwind v4's @theme
// normalises CSS <time> values on the way out, and the emitted stylesheet
// actually contains `--duration-reveal-slow: .7s`. An earlier version of
// this function assumed the value was always in milliseconds and divided by
// 1000 unconditionally, which turned `.7s` into 0.0007 seconds — every
// motion animation on the site ran in under a millisecond and read as no
// animation at all. Parse the unit; never infer it from how the token was
// written.
export function readDurationSeconds(
  cssVar: string,
  fallbackMs: number,
): number {
  if (typeof window === "undefined") return fallbackMs / 1000;

  const raw = getComputedStyle(document.documentElement)
    .getPropertyValue(cssVar)
    .trim();
  const value = Number.parseFloat(raw);

  if (!Number.isFinite(value) || value <= 0) return fallbackMs / 1000;

  // "ms" is tested first because it also ends in "s" — order matters here.
  // A unitless value is treated as milliseconds, matching how tokens.css
  // authors them and how `fallbackMs` is expressed.
  if (raw.endsWith("ms")) return value / 1000;
  if (raw.endsWith("s")) return value;
  return value / 1000;
}
