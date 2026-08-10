import { useSyncExternalStore } from "react";

// Mirrors Tailwind's default `md` breakpoint (768px) — this project has no
// custom --breakpoint-md override (checked src/styles), so the literal
// here stays in sync with every `md:` class used alongside it.
const QUERY = "(min-width: 768px)";

function subscribe(callback: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  const mediaQueryList = window.matchMedia(QUERY);
  mediaQueryList.addEventListener("change", callback);
  return () => mediaQueryList.removeEventListener("change", callback);
}

function getSnapshot(): boolean {
  return window.matchMedia(QUERY).matches;
}

// Assume mobile on the server, same reasoning as
// use-prefers-reduced-motion.ts's "assume motion is fine": the safer
// default is the one that never mounts the heavier client-only tree
// (services-pinned.tsx's scroll subscription) before hydration confirms
// it's actually warranted.
function getServerSnapshot(): boolean {
  return false;
}

export function useIsDesktop(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
