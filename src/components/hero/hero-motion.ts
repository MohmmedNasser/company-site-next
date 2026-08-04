// Shared timing constants for the hero's initial-load entrance choreography
// — single source of truth so HeroHeadline's word-stagger and HeroSection's
// subhead/CTA follow-on stay in sync regardless of how many words a given
// locale's headline happens to split into, instead of HeroSection guessing
// a fixed delay that would drift out of sync with a longer/shorter
// translation (Arabic and English word counts differ).
export const WORD_STAGGER_SECONDS = 0.06;
export const WORD_ENTRANCE_DURATION_SECONDS = 0.5;

// Roughly when the headline's word-stagger finishes animating in, so the
// subhead/CTA group can start exactly as the headline settles — reading as
// a deliberate sequence — rather than racing it (simultaneous) or leaving a
// dead gap (a guessed-too-late fixed delay).
export function getHeadlineSettleDelay(title: string): number {
  const wordCount = title.trim().split(/\s+/).filter(Boolean).length;
  return (
    Math.max(0, wordCount - 1) * WORD_STAGGER_SECONDS +
    WORD_ENTRANCE_DURATION_SECONDS
  );
}
