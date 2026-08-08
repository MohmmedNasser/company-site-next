import { useCallback, useRef, useSyncExternalStore } from "react";

/**
 * Resolves design tokens to literal hex strings for consumers that cannot
 * accept a CSS `var()` — in practice, WebGL uniforms (see Silk.jsx).
 *
 * This is the ONLY sanctioned way to get a colour value into JS in this
 * project. The alternative — hardcoding the hex at the call site — is what
 * the design system's "no raw hex in components" rule exists to prevent, and
 * it also silently freezes the value on one theme.
 *
 * Returns `null` until the first client-side read. There is no server
 * fallback on purpose: a fallback would have to be a hex literal in this
 * file, reintroducing exactly the duplication the token layer removes.
 * Callers render their non-WebGL fallback layer while this is null.
 */

// The tokens are read off <html>, which is where next-themes toggles `.dark`
// and therefore where both themes' values are in scope.
const THEME_ROOT_ATTRIBUTE = "class";

export function useTokenColors<Name extends string>(
  names: readonly Name[],
): Record<Name, string> | null {
  const resolvedRef = useRef<Record<Name, string> | null>(null);

  const subscribe = useCallback(
    (onStoreChange: () => void) => {
      const root = document.documentElement;

      const read = () => {
        const styles = getComputedStyle(root);
        // getPropertyValue returns the COMPUTED value of a custom property,
        // which means the whole var() chain (--hero-silk-low ->
        // --palette-mono-25 -> #fafafa) is already substituted. No manual
        // dereferencing needed.
        const next = {} as Record<Name, string>;
        for (const name of names) {
          next[name] = styles.getPropertyValue(name).trim();
        }

        const current = resolvedRef.current;
        if (current && names.every((name) => current[name] === next[name])) {
          return;
        }
        resolvedRef.current = next;
        onStoreChange();
      };

      read();
      // The theme toggle swaps a class on <html>; it fires no event, so the
      // class attribute itself is the only thing there is to observe. This
      // is what repaints the silk when the user flips theme, rather than
      // leaving it frozen on whichever theme happened to load first.
      const observer = new MutationObserver(read);
      observer.observe(root, { attributeFilter: [THEME_ROOT_ATTRIBUTE] });

      return () => observer.disconnect();
    },
    [names],
  );

  const getSnapshot = useCallback(() => resolvedRef.current, []);
  const getServerSnapshot = useCallback(() => null, []);

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

// Module-level so the array identity is stable across renders — an inline
// literal would change identity every render and tear down/recreate the
// MutationObserver each time. Same contract as use-in-viewport.ts's options.
export const SILK_TOKEN_NAMES = [
  "--hero-silk-low",
  "--hero-silk-high",
] as const;
