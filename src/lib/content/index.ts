import { apiRepository } from "./api/api-repository";
import { mockRepository } from "./mock/mock-repository";
import type { ContentRepository } from "./repository";

export const content: ContentRepository =
  process.env.NEXT_PUBLIC_DATA_SOURCE === "api"
    ? apiRepository
    : mockRepository;

export { pick } from "./locale";
export type {
  ContactPayload,
  ContactResult,
  ContentRepository,
  ProjectFilter,
} from "./repository";
export type * from "./types";
