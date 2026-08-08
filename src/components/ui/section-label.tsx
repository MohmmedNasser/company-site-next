import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

interface SectionLabelProps extends HTMLAttributes<HTMLDivElement> {
  /** Section index. A plain number is padded to 2 digits ("01"); pass a
   * string directly for anything that shouldn't be padded (e.g. "12"). */
  number: number | string;
  children: ReactNode;
}

/**
 * The monochrome system's core repeating identity element (docs/design-
 * decisions.md, "Section-label pattern"): a bracketed index, the section
 * name, and a thin divider that carries on to fill the rest of the row.
 * Every hand-built marketing section opens with one of these.
 *
 * Logical/RTL by construction, not by special-casing: `flex` (row) reorders
 * itself for reading direction automatically — no `flex-row-reverse` or
 * `rtl:` variant needed — and the literal `[`/`]` characters mirror
 * automatically under the Unicode bidi algorithm in an RTL context. The
 * only thing that changes per-locale is the section NAME text the caller
 * passes in as `children`, which is already translated by the time it
 * reaches this component.
 */
export default function SectionLabel({
  number,
  children,
  className,
  ...rest
}: SectionLabelProps) {
  const formatted =
    typeof number === "number" ? String(number).padStart(2, "0") : number;

  return (
    <div className={cn("flex items-center gap-16", className)} {...rest}>
      <span className="text-12 text-text-secondary shrink-0 font-medium tabular-nums">
        [{formatted}]
      </span>
      <span className="text-12 text-text-primary shrink-0 font-medium">
        {children}
      </span>
      <span aria-hidden="true" className="bg-border h-px min-w-24 flex-1" />
    </div>
  );
}
