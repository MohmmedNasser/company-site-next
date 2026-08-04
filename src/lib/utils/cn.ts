type ClassValue = string | number | false | null | undefined;

// Dependency-free class-name joiner. Phase 3 only approved installing
// motion, lenis, and lucide-react — clsx/tailwind-merge are not among them,
// and every class string in this codebase is authored once (no conflicting
// duplicate utilities to dedupe), so a plain filter+join covers every case
// primitives in src/components/ui actually need.
export function cn(...values: ClassValue[]): string {
  return values.filter(Boolean).join(" ");
}
