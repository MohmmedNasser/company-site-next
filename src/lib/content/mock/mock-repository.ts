import type {
  ContactPayload,
  ContactResult,
  ContentRepository,
  NewsletterPayload,
  NewsletterResult,
  ProjectFilter,
} from "../repository";
import type {
  Client,
  FaqItem,
  Post,
  ProcessStep,
  Project,
  Service,
  SiteSettings,
  Testimonial,
} from "../types";

import clientsData from "./clients.json";
import faqData from "./faq.json";
import postsData from "./posts.json";
import processStepsData from "./process-steps.json";
import projectsData from "./projects.json";
import servicesData from "./services.json";
import settingsData from "./settings.json";
import testimonialsData from "./testimonials.json";

const services = servicesData as Service[];
// Project.status is a string union; JSON imports infer plain `string`, so
// this needs the unknown-cast escape hatch instead of a direct assertion.
const projects = projectsData as unknown as Project[];
const testimonials = testimonialsData as Testimonial[];
const clients = clientsData as Client[];
const posts = postsData as Post[];
const processSteps = processStepsData as ProcessStep[];
const faqItems = faqData as FaqItem[];
const settings = settingsData as SiteSettings;

const POSTS_PER_PAGE = 6;

const byOrder = <T extends { order: number }>(items: T[]): T[] =>
  [...items].sort((a, b) => a.order - b.order);

export const mockRepository: ContentRepository = {
  async getServices() {
    return byOrder(services);
  },
  async getService(slug) {
    return services.find((service) => service.slug === slug) ?? null;
  },
  async getProjects(filter?: ProjectFilter) {
    const filtered = filter?.category
      ? projects.filter((project) => project.category === filter.category)
      : projects;
    return byOrder(filtered);
  },
  async getProject(slug) {
    return projects.find((project) => project.slug === slug) ?? null;
  },
  async getTestimonials() {
    return byOrder(testimonials);
  },
  async getClients() {
    return byOrder(clients);
  },
  async getProcessSteps() {
    return byOrder(processSteps);
  },
  async getFaqItems() {
    return byOrder(faqItems);
  },
  async getPosts(page = 1) {
    const sorted = byOrder(posts);
    const start = (page - 1) * POSTS_PER_PAGE;
    return sorted.slice(start, start + POSTS_PER_PAGE);
  },
  async getPost(slug) {
    return posts.find((post) => post.slug === slug) ?? null;
  },
  async getSettings() {
    return settings;
  },
  async submitContact(payload: ContactPayload): Promise<ContactResult> {
    console.log("[mock-repository] contact submission received:", payload);
    return { success: true };
  },
  async subscribeNewsletter(
    payload: NewsletterPayload,
  ): Promise<NewsletterResult> {
    console.log("[mock-repository] newsletter subscription received:", payload);
    return { success: true };
  },
};
