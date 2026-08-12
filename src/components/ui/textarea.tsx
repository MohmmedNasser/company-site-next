import * as React from "react";

import { cn } from "@/lib/utils";

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "border-border text-text-primary placeholder:text-text-secondary rounded-control text-14 aria-invalid:border-error field-sizing-content min-h-64 w-full bg-transparent px-12 py-8 transition-colors outline-none disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}

export { Textarea };
