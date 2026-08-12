// src/lib/content/repository.ts
import type {
  Client,
  FaqItem,
  Post,
  ProcessStep,
  Project,
  Service,
  SiteSettings,
  Testimonial,
} from "./types";

export interface ProjectFilter {
  category?: string;
}

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
  getSettings(): Promise<SiteSettings>;
  submitContact(payload: ContactPayload): Promise<ContactResult>;
}
