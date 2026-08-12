"use server";

import { content } from "@/lib/content";
import type { ContactPayload, ContactResult } from "@/lib/content/repository";

interface SubmitContactInput extends ContactPayload {
  // Honeypot — real visitors never fill this. Not part of ContactPayload
  // since the repository has no business reason to know about it.
  company?: string;
}

export async function submitContactAction(
  input: SubmitContactInput,
): Promise<ContactResult> {
  const { company, ...payload } = input;

  if (!payload.name || !payload.email || !payload.message) {
    return { success: false };
  }

  // A filled honeypot means a bot filled every field, including the one
  // hidden from real visitors — report success without touching the
  // repository, so the bot gets no signal that it was caught.
  if (company) {
    return { success: true };
  }

  return content.submitContact(payload);
}
