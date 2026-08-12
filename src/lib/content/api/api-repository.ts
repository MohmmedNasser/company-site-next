import type { ContentRepository } from "../repository";

function notImplemented(): never {
  throw new Error("Not implemented until Phase 14");
}

export const apiRepository: ContentRepository = {
  getServices: notImplemented,
  getService: notImplemented,
  getProjects: notImplemented,
  getProject: notImplemented,
  getTestimonials: notImplemented,
  getClients: notImplemented,
  getProcessSteps: notImplemented,
  getFaqItems: notImplemented,
  getPosts: notImplemented,
  getPost: notImplemented,
  getSettings: notImplemented,
  submitContact: notImplemented,
  subscribeNewsletter: notImplemented,
};
