"use server";

import { content } from "@/lib/content";
import type {
  NewsletterPayload,
  NewsletterResult,
} from "@/lib/content/repository";

export async function subscribeNewsletterAction(
  payload: NewsletterPayload,
): Promise<NewsletterResult> {
  if (!payload.email) {
    return { success: false };
  }

  return content.subscribeNewsletter(payload);
}
