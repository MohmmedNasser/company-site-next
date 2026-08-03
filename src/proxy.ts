// proxy.ts
//
// Next.js 16 renamed the `middleware.ts` file convention to `proxy.ts`. The
// exported function's behavior and signature are unchanged from what
// `middleware.ts` used to do — only the filename changed. Do not rename this
// back to `middleware.ts`; that convention is deprecated as of Next 16, and
// any guide referencing `middleware.ts` predates the rename.
import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

export default createMiddleware(routing);

export const config = {
  // Run on every path except API routes, Next.js internals, Vercel
  // internals, and any request for a path with a file extension (static
  // assets like favicon.ico, images, etc).
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
