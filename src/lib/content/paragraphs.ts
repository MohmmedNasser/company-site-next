// src/lib/content/paragraphs.ts

/**
 * Splits a long-form content field into paragraphs at blank lines.
 *
 * Every long-form field in this content layer (`Service.body`, `Post.body`,
 * `SiteSettings.pages.about.story.body`) is stored as ONE `Localized`
 * string with blank lines between paragraphs, rather than as an array of
 * strings. Two reasons that's the storage shape:
 *
 * - The Phase 14 admin panel edits these in a plain textarea. A single
 *   string round-trips through a textarea unchanged; an array needs the
 *   form to invent a join/split convention anyway, so it may as well live
 *   here, once, where every consumer shares it.
 * - It keeps `Localized` uniform — `{ ar, en }` of `string`, never
 *   sometimes `{ ar, en }` of `string[]`.
 *
 * Splitting on "one or more blank lines" (rather than every newline) means
 * a soft-wrapped line inside an authored paragraph doesn't accidentally
 * become its own paragraph. Empty results are dropped so trailing blank
 * lines in the source can't render an empty <p>.
 */
export function toParagraphs(text: string): string[] {
  return text
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter((paragraph) => paragraph.length > 0);
}
