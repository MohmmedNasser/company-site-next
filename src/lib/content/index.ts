import "server-only";

import { apiRepository } from "./api/api-repository";
import { ApiError } from "./api/client";
import { mockRepository } from "./mock/mock-repository";
import type { ContentRepository } from "./repository";

// Wraps the API repository so an unreachable API degrades to mock data
// during local development and testing.
//
// DEVELOPMENT ONLY — never active in a production build or `next start`
// (docs/design-decisions.md §9, fix 3). In production a failed read must
// surface as a real error through `[locale]/error.tsx`, because silently
// serving mock content would show visitors a "working" site with wrong data.
// `NODE_ENV` is what Next sets itself (`development` under `next dev`,
// `production` under `next build`/`next start`), so no separate flag can be
// forgotten on a deploy.
//
// Only READS fall back. A submission that fell back would hit the mock's
// `{ success: true }` and silently discard a real visitor's message, so the
// two write methods are passed through untouched.
//
// Only "the API is down" errors fall back (no response, 429, 5xx —
// `ApiError.isUnavailable`). A 422 on a read or a missing NEXT_PUBLIC_API_URL
// is a bug on our side, and hiding it behind mock data would hide the bug.
const WRITE_METHODS = new Set<keyof ContentRepository>([
  "submitContact",
  "subscribeNewsletter",
]);

function withMockFallback(
  primary: ContentRepository,
  fallback: ContentRepository,
): ContentRepository {
  const wrapped = { ...primary };
  for (const name of Object.keys(primary) as (keyof ContentRepository)[]) {
    if (WRITE_METHODS.has(name)) continue;
    const read = primary[name] as (...args: unknown[]) => Promise<unknown>;
    const mock = fallback[name] as (...args: unknown[]) => Promise<unknown>;
    (wrapped as Record<string, unknown>)[name] = async (...args: unknown[]) => {
      try {
        return await read(...args);
      } catch (error) {
        if (!(error instanceof ApiError) || !error.isUnavailable) throw error;
        console.warn(
          `[content] API unavailable in ${name}(), serving mock data: ${error.message}`,
        );
        return mock(...args);
      }
    };
  }
  return wrapped;
}

function selectRepository(): ContentRepository {
  if (process.env.NEXT_PUBLIC_DATA_SOURCE !== "api") return mockRepository;
  if (process.env.NODE_ENV === "production") return apiRepository;
  return withMockFallback(apiRepository, mockRepository);
}

export const content: ContentRepository = selectRepository();

export { POSTS_PER_PAGE } from "./repository";
export { pick } from "./locale";
export { toParagraphs } from "./paragraphs";
export type {
  ContactPayload,
  ContactResult,
  ContentRepository,
  NewsletterPayload,
  NewsletterResult,
  ProjectFilter,
} from "./repository";
export type * from "./types";
