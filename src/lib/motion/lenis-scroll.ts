import { motionValue, type MotionValue } from "motion/react";

/**
 * Shared scroll state, written to directly from Lenis's own `scroll` event
 * (see SmoothScrollProvider's LenisMotionSync) instead of relying on
 * motion's useScroll(), which subscribes to the native `scroll` event.
 *
 * That's the desync this pairing is notorious for: Lenis interpolates the
 * scroll position on every animation frame and calls `window.scrollTo`, but
 * the native `scroll` event it triggers is dispatched asynchronously and can
 * be throttled by the browser (Safari in particular coalesces it), so a
 * component reading useScroll() can render a frame or more behind what the
 * user is actually seeing Lenis paint. Lenis's own `scroll` callback fires
 * synchronously with the exact value it just rendered, so every scroll-
 * linked animation in this project reads these MotionValues instead of
 * calling useScroll() directly — see header.tsx for the consumer side.
 *
 * `motionValue()` (re-exported from motion-dom via "motion/react") creates a
 * MotionValue outside of any component, so it can be a module-level
 * singleton shared by the provider (writer) and any component (reader)
 * without prop-drilling or context.
 */
export const lenisScrollY: MotionValue<number> = motionValue(0);
export const lenisScrollProgress: MotionValue<number> = motionValue(0);
