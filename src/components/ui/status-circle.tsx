import type { SVGAttributes } from "react";
import { cn } from "@/lib/utils/cn";

export type StatusCircleState =
  "backlog" | "todo" | "in-progress" | "done" | "cancelled";
type StatusCircleSize = "sm" | "md";
export type StatusCircleTone = "status" | "mono";

interface StatusCircleProps extends Omit<SVGAttributes<SVGSVGElement>, "role"> {
  state: StatusCircleState;
  /** 14px | 24px. @default "sm" */
  size?: StatusCircleSize;
  /**
   * "status" keeps the issue-tracker colour semantics (green done, gold
   * in-progress); "mono" renders every state in a neutral. See the comment
   * on TONE_COLOR_CLASS below. @default "status"
   */
  tone?: StatusCircleTone;
  /** Accessible label override. Defaults to a human-readable form of `state`. */
  label?: string;
}

const SIZE_PX: Record<StatusCircleSize, number> = { sm: 14, md: 24 };
const STROKE_WIDTH: Record<StatusCircleSize, number> = { sm: 1.5, md: 2 };

const DEFAULT_LABEL: Record<StatusCircleState, string> = {
  backlog: "Backlog",
  todo: "Todo",
  "in-progress": "In progress",
  done: "Done",
  cancelled: "Cancelled",
};

// Two tones, not one.
//
// "status" is the original map and stays the default, so nothing that
// already renders a StatusCircle changes, and docs/design-decisions.md's
// admin-panel open question (do success/warning/error survive that
// decision?) stays open rather than being answered by this prop.
//
// "mono" exists because the marketing site is monochrome — colour lives
// only in the logo mark — so a status indicator on a marketing page cannot
// use green/gold. Nothing is lost by dropping the colour here: the five
// states are already distinguished by SHAPE (dashed ring, hollow ring,
// half-filled, filled + check, filled + slash), so colour was never the
// only channel carrying the meaning. Done/in-progress take text-primary
// and the muted states text-secondary, which keeps the same "this one is
// resolved, that one isn't" contrast step the colour map had.
const TONE_COLOR_CLASS: Record<
  StatusCircleTone,
  Record<StatusCircleState, string>
> = {
  status: {
    backlog: "text-text-secondary",
    todo: "text-text-secondary",
    "in-progress": "text-warning",
    done: "text-success",
    cancelled: "text-text-secondary",
  },
  mono: {
    backlog: "text-text-secondary",
    todo: "text-text-secondary",
    "in-progress": "text-text-primary",
    done: "text-text-primary",
    cancelled: "text-text-secondary",
  },
};

/**
 * The dense-UI design system's circular status indicators. Reused verbatim
 * in Phase 5 (process section), Phase 6
 * (portfolio status), and Phase 7 (contact form steps) — all five states
 * are implemented now so those phases only ever choose a `state`, never add
 * a new visual treatment.
 */
export default function StatusCircle({
  state,
  size = "sm",
  tone = "status",
  label,
  className,
  ...rest
}: StatusCircleProps) {
  const px = SIZE_PX[size];
  const strokeWidth = STROKE_WIDTH[size];
  const r = 12 - strokeWidth; // keep the stroke fully inside the 24x24 viewBox
  const accessibleLabel = label ?? DEFAULT_LABEL[state];

  return (
    <svg
      viewBox="0 0 24 24"
      width={px}
      height={px}
      role="img"
      aria-label={accessibleLabel}
      className={cn(TONE_COLOR_CLASS[tone][state], "shrink-0", className)}
      {...rest}
    >
      {state === "backlog" && (
        <circle
          cx="12"
          cy="12"
          r={r}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeDasharray="2 2"
        />
      )}

      {state === "todo" && (
        <circle
          cx="12"
          cy="12"
          r={r}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
        />
      )}

      {state === "in-progress" && (
        <>
          <circle
            cx="12"
            cy="12"
            r={r}
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
          />
          {/* Right-half pie fill — the "half-filled" treatment */}
          <path
            d={`M12 ${12 - r} A${r} ${r} 0 0 1 12 ${12 + r} Z`}
            fill="currentColor"
          />
        </>
      )}

      {state === "done" && (
        <>
          <circle cx="12" cy="12" r={r} fill="currentColor" />
          <path
            d="M7.5 12.5l2.7 2.7L16.5 9"
            fill="none"
            stroke="var(--color-on-primary)"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </>
      )}

      {state === "cancelled" && (
        <>
          <circle cx="12" cy="12" r={r} fill="currentColor" />
          <line
            x1={12 - r * 0.6}
            y1="12"
            x2={12 + r * 0.6}
            y2="12"
            stroke="var(--color-on-primary)"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />
        </>
      )}
    </svg>
  );
}
