import type { SVGAttributes } from "react";

type IconProps = SVGAttributes<SVGSVGElement>;

const BASE_PROPS = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.75,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

/**
 * lucide-react 1.28 ships no brand/social icons (dropped for trademark
 * reasons in an earlier major version). These are hand-drawn monoline
 * glyphs matching lucide's own stroke style (24x24 viewBox, round caps and
 * joins) — recognizable link targets, not reproductions of the platforms'
 * trademarked logomarks. Used by Footer; see docs/design-decisions.md.
 */
export function LinkedInIcon(props: IconProps) {
  return (
    <svg {...BASE_PROPS} {...props}>
      <rect x="3" y="3" width="18" height="18" rx="3" />
      <circle cx="7.5" cy="7.3" r="0.9" fill="currentColor" stroke="none" />
      <line x1="7.5" y1="10.7" x2="7.5" y2="17" />
      <path d="M11.5 17v-4.2a2.3 2.3 0 0 1 4.6 0V17" />
      <line x1="11.5" y1="10.7" x2="11.5" y2="17" />
    </svg>
  );
}

export function XIcon(props: IconProps) {
  return (
    <svg {...BASE_PROPS} {...props}>
      <line x1="5" y1="5" x2="19" y2="19" />
      <line x1="19" y1="5" x2="5" y2="19" />
    </svg>
  );
}

export function GitHubIcon(props: IconProps) {
  return (
    <svg {...BASE_PROPS} {...props}>
      <path d="M9 19c-4.3 1.2-4.3-2.1-6-2.5m12 4.5v-3.3c0-.9.3-1.5.7-1.8-2.5-.3-5.1-1.2-5.1-5.5 0-1.2.4-2.2 1.1-3-.1-.3-.5-1.4.1-3 0 0 .9-.3 3 1.1a10.5 10.5 0 0 1 5.5 0c2.1-1.4 3-1.1 3-1.1.6 1.6.2 2.7.1 3 .7.8 1.1 1.8 1.1 3 0 4.3-2.6 5.2-5.1 5.5.4.4.8 1.1.8 2.2V21" />
    </svg>
  );
}

export function InstagramIcon(props: IconProps) {
  return (
    <svg {...BASE_PROPS} {...props}>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4.2" />
      <circle cx="17.3" cy="6.7" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}
