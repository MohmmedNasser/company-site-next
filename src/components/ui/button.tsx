"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils/cn";

type ButtonVariant = "primary" | "secondary" | "ghost";
type ButtonSize = "default" | "compact";

interface ButtonProps extends Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  "children"
> {
  children: ReactNode;
  /** @default "primary" */
  variant?: ButtonVariant;
  /** @default "default" */
  size?: ButtonSize;
  /** Shows a spinner and disables the button without changing its width. */
  loading?: boolean;
}

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary:
    "bg-primary text-on-primary hover:bg-primary-hover active:bg-primary-hover disabled:bg-primary/50",
  secondary:
    "bg-surface text-text-primary border border-border hover:bg-surface-raised active:bg-surface-raised disabled:opacity-50",
  ghost:
    "bg-transparent text-text-primary hover:bg-surface active:bg-surface-raised disabled:opacity-50",
};

const SIZE_CLASSES: Record<ButtonSize, string> = {
  default: "text-14 px-24 py-12 gap-8",
  compact: "text-13 px-16 py-8 gap-4",
};

const BASE_CLASSES =
  "rounded-control duration-micro inline-flex items-center justify-center font-medium transition-colors";

/**
 * Same visual classes as <Button>, for callers that need button styling on
 * a non-<button> element — e.g. the header/footer "Start a project" CTA,
 * which navigates via next-intl's locale-aware <Link> (an <a>). Nesting a
 * real <button> inside that <a> would put two interactive roles inside one
 * another, which is invalid HTML and confuses keyboard/AT navigation, so
 * those callers apply this class list to the <Link> directly instead of
 * rendering <Button> itself.
 */
export function buttonClassNames({
  variant = "primary",
  size = "default",
  className,
}: {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
} = {}): string {
  return cn(
    BASE_CLASSES,
    VARIANT_CLASSES[variant],
    SIZE_CLASSES[size],
    className,
  );
}

export default function Button({
  children,
  variant = "primary",
  size = "default",
  loading = false,
  disabled,
  className,
  type = "button",
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={cn(
        buttonClassNames({ variant, size }),
        "relative disabled:pointer-events-none",
        className,
      )}
      {...rest}
    >
      {/* The label stays in flow (just hidden) instead of being removed, so
          the button's intrinsic width from its text never shifts when the
          spinner appears — only its visibility toggles. */}
      <span
        className={cn("inline-flex items-center gap-8", loading && "invisible")}
      >
        {children}
      </span>
      {loading && (
        <span className="absolute inset-0 flex items-center justify-center">
          <Loader2 className="size-16 animate-spin" aria-hidden="true" />
        </span>
      )}
    </button>
  );
}
