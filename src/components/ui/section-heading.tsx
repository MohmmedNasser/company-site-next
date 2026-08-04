import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

interface SectionHeadingProps extends HTMLAttributes<HTMLDivElement> {
  eyebrow: ReactNode;
  heading: ReactNode;
  description?: ReactNode;
}

export default function SectionHeading({
  eyebrow,
  heading,
  description,
  className,
  ...rest
}: SectionHeadingProps) {
  return (
    <div className={cn("flex max-w-640 flex-col gap-16", className)} {...rest}>
      {/* .overline (globals.css) uppercases only under :lang(en) — Arabic
          has no case, so the Arabic eyebrow renders as authored. */}
      <p className="text-13 text-primary font-medium overline">{eyebrow}</p>
      <h2 className="text-32 text-text-primary font-semibold">{heading}</h2>
      {description && (
        <p className="text-16 text-text-secondary">{description}</p>
      )}
    </div>
  );
}
