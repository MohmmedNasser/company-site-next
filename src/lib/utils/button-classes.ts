import { cn } from "@/lib/utils/cn";

export type ButtonVariant = "primary" | "secondary" | "ghost";
export type ButtonSize = "default" | "compact";

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
 * a non-<button> element — e.g. a locale-aware <Link> CTA. Pulled out of
 * button.tsx (a "use client" module) into its own plain module: RSC treats
 * every export of a "use client" file as living behind the client
 * boundary, re-exports included, so a Server Component can render <Button>
 * via JSX but can't call buttonClassNames() as a function from
 * button.tsx directly. This file has no client-only behavior — it's pure
 * string building — so it's safe to import from both server and client
 * code; button.tsx itself re-exports it for existing client-side callers.
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
