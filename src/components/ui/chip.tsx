import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

type ChipColor = "neutral" | "primary" | "success" | "warning" | "error";

interface ChipProps extends Omit<HTMLAttributes<HTMLSpanElement>, "color"> {
  children: ReactNode;
  /** Restricted to semantic tokens — never a free-form string. @default "neutral" */
  color?: ChipColor;
}

const COLOR_CLASSES: Record<ChipColor, string> = {
  neutral: "bg-surface text-text-secondary border-border",
  primary: "bg-primary/10 text-primary border-primary/20",
  success: "bg-success/10 text-success border-success/20",
  warning: "bg-warning/10 text-warning border-warning/20",
  error: "bg-error/10 text-error border-error/20",
};

export default function Chip({
  children,
  color = "neutral",
  className,
  ...rest
}: ChipProps) {
  return (
    <span
      className={cn(
        "rounded-chip text-12 inline-flex items-center border px-8 py-2 font-medium",
        COLOR_CLASSES[color],
        className,
      )}
      {...rest}
    >
      {children}
    </span>
  );
}
