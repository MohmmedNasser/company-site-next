// src/lib/content/repository.ts
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
} from "./types";

export interface ProjectFilter {
  category?: string;
}

/**
 * Page size for `getPosts(page)`. Part of the repository CONTRACT, not a
 * mock-only detail: /blog has to know it to render a page count, and the
 * API repository has to honour the same number or the client's page links
 * would point at differently-sized pages than the ones it renders.
 */
export const POSTS_PER_PAGE = 6;

export interface ContactPayload {
  name: string;
  email: string;
  service?: string;
  budget?: string;
  message: string;
}

export interface ContactResult {
  success: boolean;
}

export interface NewsletterPayload {
  email: string;
}

export interface NewsletterResult {
  success: boolean;
}

export interface ContentRepository {
  getServices(): Promise<Service[]>;
  getService(slug: string): Promise<Service | null>;
  getProjects(filter?: ProjectFilter): Promise<Project[]>;
  getProject(slug: string): Promise<Project | null>;
  getTestimonials(): Promise<Testimonial[]>;
  getClients(): Promise<Client[]>;
  getProcessSteps(): Promise<ProcessStep[]>;
  getFaqItems(): Promise<FaqItem[]>;
  getPosts(page?: number): Promise<Post[]>;
  getPost(slug: string): Promise<Post | null>;
  // Total published posts, ignoring pagination. /blog needs it to render a
  // page count and to generate one static route per page — `getPosts`
  // alone can only answer "is there at least one more?", which isn't
  // enough to build the pager or to enumerate routes ahead of time.
  getPostCount(): Promise<number>;
  // /about collections. No single-record getter for any of the three —
  // none of them has a detail page, so `getTeamMember(slug)` etc. would be
  // an unused method on every implementation of this interface.
  getTeamMembers(): Promise<TeamMember[]>;
  getValues(): Promise<ValueItem[]>;
  getTimeline(): Promise<TimelineEntry[]>;
  getSettings(): Promise<SiteSettings>;
  submitContact(payload: ContactPayload): Promise<ContactResult>;
  // Stub only — real wiring happens in Phase 14, same as submitContact.
  subscribeNewsletter(payload: NewsletterPayload): Promise<NewsletterResult>;
}
