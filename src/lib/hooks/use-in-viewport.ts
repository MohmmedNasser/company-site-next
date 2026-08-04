import {
  useCallback,
  useRef,
  useSyncExternalStore,
  type RefObject,
} from "react";

// useSyncExternalStore instead of useState + useEffect, for the same reason
// as the rest of this project's browser-state hooks: the intersection
// state is external to React and has no derivation from props/state during
// render, so there is nothing here for react-hooks/set-state-in-effect to
// legitimately flag — this just wires that external source in correctly.
//
// `isIntersectingRef` is shared between `subscribe` (which owns the
// IntersectionObserver and writes to it) and `getSnapshot` (which only
// reads it) — the two must stay separate stable callbacks for
// useSyncExternalStore, so the observer's latest reading has to live
// somewhere both can reach without either one closing over the other.
//
// Callers MUST pass a module-level (referentially stable) `options` object,
// not an inline literal — an inline object would change identity every
// render, which would tear the observer down and recreate it every render.
export function useInViewport<T extends Element>(
  ref: RefObject<T | null>,
  options?: IntersectionObserverInit,
): boolean {
  const isIntersectingRef = useRef(false);

  const subscribe = useCallback(
    (callback: () => void) => {
      const element = ref.current;
      if (!element) return () => {};

      const observer = new IntersectionObserver(([entry]) => {
        isIntersectingRef.current = entry.isIntersecting;
        callback();
      }, options);
      observer.observe(element);

      return () => observer.disconnect();
    },
    [ref, options],
  );

  const getSnapshot = useCallback(() => isIntersectingRef.current, []);
  const getServerSnapshot = useCallback(() => false, []);

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
