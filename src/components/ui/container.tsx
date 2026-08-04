import type { ElementType, HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

interface ContainerProps extends HTMLAttributes<HTMLElement> {
  children: ReactNode;
  /** @default "div" */
  as?: ElementType;
}

export default function Container({
  children,
  as: Tag = "div",
  className,
  ...rest
}: ContainerProps) {
  return (
    <Tag
      className={cn("mx-auto max-w-7xl px-24 sm:px-32", className)}
      {...rest}
    >
      {children}
    </Tag>
  );
}
