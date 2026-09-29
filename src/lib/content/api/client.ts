import "server-only";

/**
 * The one place that talks HTTP to the Laravel API. Every method in
 * api-repository.ts goes through `apiRequest` — nothing else calls fetch.
 *
 * Contract: docs/api-contract.md in company-site-api (§1 conventions).
 * Success bodies are `{ data: T, meta? }`; every non-2xx body is
 * `{ error: { status, code, message, fields? } }`.
 */

export interface ApiEnvelope<T, M = undefined> {
  data: T;
  meta?: M;
}

interface ApiErrorBody {
  error?: {
    status?: number;
    code?: string;
    message?: string;
    fields?: Record<string, string[]>;
  };
}

// A hung API must not hang page rendering — fail fast so the fallback in
// index.ts gets a chance to run.
const REQUEST_TIMEOUT_MS = 5000;

export class ApiError extends Error {
  /** HTTP status, or 0 when no response arrived (refused, DNS, timeout). */
  readonly status: number;
  readonly code?: string;
  /** 422 only: field name → messages, straight from the error envelope. */
  readonly fields?: Record<string, string[]>;

  constructor(
    status: number,
    message: string,
    code?: string,
    fields?: Record<string, string[]>,
  ) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.fields = fields;
  }

  /**
   * True when the API itself is the problem (down, overloaded, throttling),
   * as opposed to the request being wrong (404, 422, 405). Only this kind of
   * failure is safe to paper over with mock data.
   */
  get isUnavailable(): boolean {
    return this.status === 0 || this.status === 429 || this.status >= 500;
  }
}

function baseUrl(): string {
  const url = process.env.NEXT_PUBLIC_API_URL;
  if (!url) {
    // A misconfiguration, not an outage — deliberately not an ApiError, so
    // the mock fallback does not hide it.
    throw new Error(
      "NEXT_PUBLIC_API_URL is not set but NEXT_PUBLIC_DATA_SOURCE=api. " +
        "See .env.example.",
    );
  }
  return url.replace(/\/+$/, "");
}

// How long a cached GET may be served before Next refetches it. Editors
// see a change within this window until an admin-triggered `revalidateTag`
// webhook exists (see docs/design-decisions.md §9). Five minutes is long
// enough that one build — and any burst of visitors — costs roughly one API
// call per resource instead of one per page, and short enough that an edit
// is never stale for long.
const REVALIDATE_SECONDS = 300;

interface RequestOptions {
  method?: "GET" | "POST";
  query?: Record<string, string | number | undefined>;
  body?: unknown;
  /**
   * One tag per content type ("services", "settings"…), on GETs only. This
   * is both the cache key group and the handle for `revalidateTag(tag)`.
   */
  tag?: string;
}

export async function apiRequest<T, M = undefined>(
  path: string,
  { method = "GET", query, body, tag }: RequestOptions = {},
): Promise<ApiEnvelope<T, M>> {
  const url = new URL(`${baseUrl()}${path}`);
  for (const [key, value] of Object.entries(query ?? {})) {
    if (value !== undefined) url.searchParams.set(key, String(value));
  }

  let response: Response;
  try {
    response = await fetch(url, {
      method,
      headers: {
        Accept: "application/json",
        ...(body !== undefined && { "Content-Type": "application/json" }),
      },
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      // Next's fetch data cache (`cacheComponents` is not enabled, so
      // `"use cache"` is unavailable). GETs are cached and tagged; POSTs
      // are submissions and must never be cached. Only 2xx responses are
      // stored, so a 429/5xx is retried on the next call, not remembered.
      ...(method === "GET"
        ? { next: { revalidate: REVALIDATE_SECONDS, tags: tag ? [tag] : [] } }
        : { cache: "no-store" as const }),
    });
  } catch (cause) {
    throw new ApiError(
      0,
      `API unreachable (${method} ${url.pathname}): ${
        cause instanceof Error ? cause.message : String(cause)
      }`,
    );
  }

  if (!response.ok) {
    // Non-JSON error pages (a proxy 502, a Herd error screen) fall through
    // to the generic message rather than masking the status with a parse
    // error.
    const parsed = (await response
      .json()
      .catch(() => null)) as ApiErrorBody | null;
    const error = parsed?.error;
    throw new ApiError(
      response.status,
      error?.message ?? `${method} ${url.pathname} failed (${response.status})`,
      error?.code,
      error?.fields,
    );
  }

  return (await response.json()) as ApiEnvelope<T, M>;
}
