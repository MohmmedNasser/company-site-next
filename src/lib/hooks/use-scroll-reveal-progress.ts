import {
  useCallback,
  useRef,
  useSyncExternalStore,
  type RefObject,
} from "react";
import { useTransform, type MotionValue } from "motion/react";
import { lenisScrollY } from "@/lib/motion/lenis-scroll";

// Not [0, 0]: a zero-width input range makes useTransform's interpolation
// divide by zero. Only ever read for the render before the first measure.
const UNMEASURED_RANGE: [number, number] = [0, 1];

/**
 * A 0→1 MotionValue scrubbed by the element's own travel through the
 * viewport — the generic "how far has the reader scrolled through THIS
 * block" primitive that scroll-scrubbed section effects need.
 *
 * Reads lenisScrollY, not motion's useScroll(), for the reason spelled out
 * in lib/motion/lenis-scroll.ts: useScroll() subscribes to the native
 * `scroll` event, which Lenis triggers asynchronously and browsers may
 * coalesce, so it renders a frame or more behind what Lenis is painting.
 * The same choice header.tsx and hero-section.tsx already made.
 *
 * CONSEQUENCE FOR REDUCED MOTION: under prefers-reduced-motion
 * SmoothScrollProvider never instantiates Lenis at all, so lenisScrollY
 * stays frozen at 0 and this value stays frozen at 0 with it. Callers MUST
 * short-circuit to a fully-revealed, non-animated render in that case —
 * they cannot rely on this hook eventually reaching 1.
 *
 * @param ref                        Element whose travel drives the range.
 * @param startAtViewportFraction    Progress hits 0 when the element's top
 *                                   sits this far down the viewport (1 =
 *                                   the very bottom edge).
 * @param endAtViewportFraction      Progress hits 1 when the element's
 *                                   bottom sits this far down the viewport.
 */
export function useScrollRevealProgress(
  ref: RefObject<HTMLElement | null>,
  startAtViewportFraction: number,
  endAtViewportFraction: number,
): MotionValue<number> {
  const rangeRef = useRef<[number, number]>(UNMEASURED_RANGE);

  // useSyncExternalStore rather than useState + useEffect, matching the
  // rest of this project's browser-state hooks (use-in-viewport.ts,
  // use-prefers-reduced-motion.ts): element geometry is external state with
  // no derivation from props during render, so there is nothing here for
  // react-hooks/set-state-in-effect to legitimately flag.
  const subscribe = useCallback(
    (onStoreChange: () => void) => {
      const element = ref.current;
      if (!element) return () => {};

      const measure = () => {
        const rect = element.getBoundingClientRect();
        // rect.top is viewport-relative and window.scrollY is exactly what
        // Lenis writes through window.scrollTo, so the two always sum back
        // to the same document-space offset no matter where the page
        // currently sits — the range is measured once and stays valid.
        const documentTop = rect.top + window.scrollY;
        const from = documentTop - window.innerHeight * startAtViewportFraction;
        const to = Math.max(
          documentTop +
            rect.height -
            window.innerHeight * endAtViewportFraction,
          // Guards the degenerate case (a very short element in a very tall
          // viewport) where `to` would land at or before `from`.
          from + 1,
        );

        const [currentFrom, currentTo] = rangeRef.current;
        if (from === currentFrom && to === currentTo) return;
        // A NEW tuple only when the numbers actually moved — getSnapshot
        // must return a referentially stable value or useSyncExternalStore
        // re-renders forever.
        rangeRef.current = [from, to];
        onStoreChange();
      };

      measure();
      // ResizeObserver, not just `resize`: the element's own height changes
      // when a webfont swaps in or the copy rewraps at a breakpoint, and
      // both shift where the reveal should finish.
      const observer = new ResizeObserver(measure);
      observer.observe(element);
      // Still needed alongside the observer — window.innerHeight is half of
      // the range and can change (mobile URL bar) without the element ever
      // resizing.
      window.addEventListener("resize", measure);

      return () => {
        observer.disconnect();
        window.removeEventListener("resize", measure);
      };
    },
    [ref, startAtViewportFraction, endAtViewportFraction],
  );

  const getSnapshot = useCallback(() => rangeRef.current, []);
  const getServerSnapshot = useCallback(() => UNMEASURED_RANGE, []);

  const range = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  // useTransform rebuilds its interpolator during render whenever the input
  // range identity changes and writes the result synchronously, so the
  // measured range takes effect on the same render it arrives on.
  return useTransform(lenisScrollY, range, [0, 1], { clamp: true });
}
