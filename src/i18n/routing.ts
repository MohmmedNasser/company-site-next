import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["en", "ar"],
  defaultLocale: "ar",
  // Always show the locale prefix — "/" redirects to "/ar", never renders
  // unprefixed content.
  localePrefix: "always",
  // Disabled so "/" always redirects to defaultLocale ("/ar") regardless of
  // the visitor's Accept-Language header or a previously set cookie. Without
  // this, a browser set to English would land on "/en" instead — which
  // contradicts the "/ redirects to /ar" requirement this phase verifies.
  localeDetection: false,
});

export type Locale = (typeof routing.locales)[number];
