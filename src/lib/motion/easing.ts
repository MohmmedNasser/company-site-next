// One shared, deliberate deceleration curve for every non-scroll-scrubbed
// UI transition on the marketing site (header condense, nav indicator,
// hero entrances) — a single reusable constant instead of each component
// inlining its own curve, per the Phase 4 quality revision. Mirrors
// --ease-decelerate in tokens.css; keep both in sync if this ever changes.
//
// Not used for scroll-scrubbed values (e.g. the hero's parallax
// useTransform outputs) — those track scroll position directly and have no
// independent "easing" of their own to set.
export const EASE_DECELERATE = [0.22, 1, 0.36, 1] as const;
