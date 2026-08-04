import { useSyncExternalStore } from "react";

const QUERY = "(prefers-reduced-motion: reduce)";

// useSyncExternalStore (not useState + useEffect) for the same reason as
// use-is-mounted.ts: there is no setState-in-effect to trip the
// react-hooks/set-state-in-effect rule, and the server snapshot (false —
// assume motion is fine) intentionally differs from the real client value,
// which useSyncExternalStore reconciles safely on the client-only render
// pass right after hydration instead of causing a mismatch.
function subscribe(callback: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  const mediaQueryList = window.matchMedia(QUERY);
  mediaQueryList.addEventListener("change", callback);
  return () => mediaQueryList.removeEventListener("change", callback);
}

function getSnapshot(): boolean {
  return window.matchMedia(QUERY).matches;
}

function getServerSnapshot(): boolean {
  return false;
}

export function usePrefersReducedMotion(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
