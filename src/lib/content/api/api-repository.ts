import "server-only";

import {
  type ContactPayload,
  type ContactResult,
  type ContentRepository,
  type NewsletterPayload,
  type NewsletterResult,
  type ProjectFilter,
} from "../repository";
import type {
  Client,
  FaqItem,
  Post,
  ProcessStep,
  Project,
  Service,
  SiteSettings,
  TeamMember,
  Testimonial,
  TimelineEntry,
  ValueItem,
} from "../types";

import { ApiError, apiRequest } from "./client";

// `GET /posts` is the only response with a `meta` block (api-contract §4).
interface PostsMeta {
  currentPage: number;
  perPage: number;
  total: number;
  lastPage: number;
}

// Every list/detail body is `{ data: T }` where T is exactly the repository
// method's return type (api-contract §1), so each method just unwraps `.data`.
//
// `tag` is the content type ("services"…): the fetch cache key group in
// client.ts and the handle for a future `revalidateTag(tag)`.
async function getData<T>(
  path: string,
  tag: string,
  query?: Record<string, string | number | undefined>,
): Promise<T> {
  return (await apiRequest<T>(path, { query, tag })).data;
}

// The mock repository's contract for a missing record is `null`, and the API
// answers 404 for an unknown slug — map exactly that status and nothing else.
// Any other failure (500, unreachable) still throws.
async function getDataOrNull<T>(path: string, tag: string): Promise<T | null> {
  try {
    return await getData<T>(path, tag);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return null;
    throw error;
  }
}

// Submissions report failure through `{ success: false }`, which is the only
// failure shape the forms understand (they show one generic error state; the
// zod schema already catches field errors before the request is sent). A
// thrown error would leave the form silent, so any ApiError — 422, 429, 5xx,
// unreachable — resolves to `success: false`. A non-ApiError (missing
// NEXT_PUBLIC_API_URL) is a config bug and still throws.
async function submit(
  path: string,
  body: unknown,
): Promise<{ success: boolean }> {
  try {
    return (
      await apiRequest<{ success: boolean }>(path, {
        method: "POST",
        body,
      })
    ).data;
  } catch (error) {
    if (!(error instanceof ApiError)) throw error;
    console.error(
      `[api-repository] POST ${path} failed: ${error.status} ${error.code ?? ""}`,
      error.fields ?? "",
    );
    return { success: false };
  }
}

export const apiRepository: ContentRepository = {
  getServices: () => getData<Service[]>("/services", "services"),
  getService: (slug) =>
    getDataOrNull<Service>(`/services/${encodeURIComponent(slug)}`, "services"),
  getProjects: (filter?: ProjectFilter) =>
    getData<Project[]>("/projects", "projects", { category: filter?.category }),
  getProject: (slug) =>
    getDataOrNull<Project>(`/projects/${encodeURIComponent(slug)}`, "projects"),
  getTestimonials: () =>
    getData<Testimonial[]>("/testimonials", "testimonials"),
  getClients: () => getData<Client[]>("/clients", "clients"),
  getProcessSteps: () =>
    getData<ProcessStep[]>("/process-steps", "process-steps"),
  getFaqItems: () => getData<FaqItem[]>("/faq-items", "faq-items"),
  getPosts: (page = 1) => getData<Post[]>("/posts", "posts", { page }),
  getPost: (slug) =>
    getDataOrNull<Post>(`/posts/${encodeURIComponent(slug)}`, "posts"),
  // No route of its own — reads `meta.total` off the first page of /posts.
  async getPostCount() {
    const response = await apiRequest<Post[], PostsMeta>("/posts", {
      query: { page: 1 },
      tag: "posts",
    });
    if (!response.meta) {
      throw new Error("GET /posts response is missing its `meta` block");
    }
    return response.meta.total;
  },
  getTeamMembers: () => getData<TeamMember[]>("/team-members", "team-members"),
  getValues: () => getData<ValueItem[]>("/values", "values"),
  getTimeline: () => getData<TimelineEntry[]>("/timeline", "timeline"),
  getSettings: () => getData<SiteSettings>("/settings", "settings"),
  submitContact: (payload: ContactPayload): Promise<ContactResult> =>
    submit("/contact", payload),
  subscribeNewsletter: (
    payload: NewsletterPayload,
  ): Promise<NewsletterResult> => submit("/newsletter", payload),
};
