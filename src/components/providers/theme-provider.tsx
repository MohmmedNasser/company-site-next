"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import type { ComponentProps } from "react";

declare global {
  interface Window {
    __themeScriptWarningFiltered?: boolean;
  }
}

// next-themes injects a <script> (via dangerouslySetInnerHTML) to set the
// theme class before hydration — the standard, still-correct way to
// prevent a flash of the wrong theme on reload (Phase 2's own "Done when"
// requirement). React 19 added a new dev-mode warning for any <script>
// element found in the render tree; next-themes (last released March
// 2025, effectively unmaintained — see pacocoursey/next-themes#387,
// shadcn-ui/ui#10104) hasn't been updated to avoid it. The script still
// executes correctly: the browser parses and runs it natively during the
// initial HTML parse, before React ever touches it, so this is a confirmed
// upstream false positive, not a real bug in this app or a sign FOUC
// prevention is broken.
//
// Filtering only this exact dev-mode console message — never any other
// console.error — is the mitigation the wider ecosystem converged on while
// upstream remains unmaintained. The `window.__themeScriptWarningFiltered`
// guard stops Fast Refresh from re-wrapping console.error on every module
// re-evaluation.
if (
  typeof window !== "undefined" &&
  process.env.NODE_ENV === "development" &&
  !window.__themeScriptWarningFiltered
) {
  window.__themeScriptWarningFiltered = true;
  const originalConsoleError = console.error;
  console.error = (...args: unknown[]) => {
    if (
      typeof args[0] === "string" &&
      args[0].includes("Encountered a script tag")
    ) {
      return;
    }
    originalConsoleError.apply(console, args);
  };
}

export function ThemeProvider({
  children,
  ...props
}: ComponentProps<typeof NextThemesProvider>) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
