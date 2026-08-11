"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import {
  buttonClassNames,
  type ButtonSize,
  type ButtonVariant,
} from "@/lib/utils/button-classes";

// Re-exported for existing client-side callers (header, footer, hero) that
// import it from here — server components must import it from
// @/lib/utils/button-classes directly instead, since re-exporting through
// this "use client" module wouldn't cross the RSC boundary (see that
// file's comment).
export { buttonClassNames };

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
