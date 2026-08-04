import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export default function Card({ children, className, ...rest }: CardProps) {
  return (
    <div
      className={cn(
        // Elevation on hover is background-layering (card -> surface, one
        // step up the dark-mode elevation scale) in both themes. Light mode
        // additionally gets the subtle shadow design-decisions.md §1
        // permits there; dark mode explicitly never gets a shadow, per the
        // design system's "shadows forbidden on dark cards" rule.
        "rounded-card border-border bg-card duration-micro hover:bg-surface border p-24 shadow-sm transition-[background-color,box-shadow] hover:shadow-md dark:shadow-none dark:hover:shadow-none",
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  );
}
