// src/lib/content/locale.ts
import type { Localized } from "./types";

// Admin panel (Phase 13) surfaces incomplete translations rather than
// hiding them — this fallback only affects what the public site renders.
export function pick(localized: Localized, locale: string): string {
  if (locale === "ar" && localized.ar) {
    return localized.ar;
  }
  return localized.en;
}
