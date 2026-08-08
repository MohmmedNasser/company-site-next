import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export default function Card({ children, className, ...rest }: CardProps) {
  return (
    <div
      className={cn(
        // Monochrome system: --card and --surface are now the same fill in
        // both themes (separation is by border, not a lightness step), so
        // elevation on hover brightens the BORDER instead of shifting to a
        // surface tier that no longer visually differs. Light mode
        // additionally gets a subtle shadow for edge definition; dark mode
        // explicitly never gets a shadow, per the design system's "shadows
        // forbidden on dark cards" rule.
        "rounded-card border-border bg-card duration-micro hover:border-text-secondary border p-24 shadow-sm transition-[border-color,box-shadow] hover:shadow-md dark:shadow-none dark:hover:shadow-none",
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  );
}
