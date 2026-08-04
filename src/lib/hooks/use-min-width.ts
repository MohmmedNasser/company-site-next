import { useCallback, useSyncExternalStore } from "react";

// Same useSyncExternalStore approach as use-prefers-reduced-motion.ts — a
// live-updating matchMedia check, not a resize listener. matchMedia only
// notifies when the query's truth value actually flips past the
// breakpoint; a resize listener fires on every pixel of a window drag.
export function useMinWidth(px: number): boolean {
  const query = `(min-width: ${px}px)`;

  const subscribe = useCallback(
    (callback: () => void) => {
      if (typeof window === "undefined") return () => {};
      const mediaQueryList = window.matchMedia(query);
      mediaQueryList.addEventListener("change", callback);
      return () => mediaQueryList.removeEventListener("change", callback);
    },
    [query],
  );

  const getSnapshot = useCallback(() => {
    return window.matchMedia(query).matches;
  }, [query]);

  const getServerSnapshot = useCallback(() => false, []);

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
