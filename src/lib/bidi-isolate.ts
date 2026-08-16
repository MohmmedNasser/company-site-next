// src/lib/bidi-isolate.ts
//
// Satori (the renderer behind next/og's ImageResponse) does not implement
// the Unicode Bidirectional Algorithm the way a browser does. A mixed
// Arabic/Latin title rendered as one text node ("لماذا اخترنا Next.js
// لمشاريع عملائنا") gets the words *before* the Latin run ordered
// correctly, but the words *after* it come out transposed on wrap, and a
// Latin run glued directly to an Arabic character with no space ("وLaravel")
// gets its glyphs merged into a single corrupted cluster.
//
// The standard fix for mixed-script bidi text — wrapping the Latin run in
// Unicode isolate characters (U+2066 LRI ... U+2069 PDI) — does NOT work
// here: verified empirically (byte-identical ImageResponse output with and
// without the isolate marks, on a clean dev server with a cleared build
// cache) that Satori's layout engine never consumes them; they're invisible
// format characters it has no bidi-aware handling for.
//
// What Satori *does* implement correctly is flexbox (it's Yoga-based). So
// this splits the string into individual words ourselves and lets a
// `flexWrap: "wrap", flexDirection: "row-reverse"` flex row place and wrap
// them — first logical word ends up rightmost, matching RTL reading order,
// and Satori's own width-based wrapping breaks the line.
//
// Every non-Latin run is split down to single WORDS, not just to
// Latin/non-Latin chunks — verified empirically (a throwaway diagnostic
// route rendering distinct single Arabic letters as markers, e.g. "ا ب ج"
// as one segment renders back as "ج ب ا") that a multi-word segment nested
// inside a row-reverse flex row gets its own internal word order reversed
// by Satori, even when it's pure Arabic with no Latin content at all. One
// word per flex item sidesteps that: there's nothing left inside any item
// for Satori to reorder. (A separate hypothesis — that flexWrap itself
// reverses whichever line isn't first — did NOT hold up under the same
// rigorous check and was dropped; that observation had come from reading
// real Arabic word shapes, which turned out to be an unreliable way to
// verify this.)
export type BidiSegment = { text: string; ltr: boolean };

// A run of Latin letters/digits/technical punctuation, optionally
// continuing across single spaces into further Latin words — this keeps
// multi-word terms ("React Native", "App Router") together as one segment
// without swallowing the Arabic word that follows a space. Must start with
// a letter, not a digit — a bare number ("2024", a plural count) is not a
// term needing isolation, and letting it match its own segment here would
// pull ordinary numerals embedded in Arabic text out of their word.
const LATIN_RUN =
  /[A-Za-z][A-Za-z0-9.+#/&-]*(?: [A-Za-z0-9][A-Za-z0-9.+#/&-]*)*/g;

const NBSP = " ";

export function splitBidiSegments(text: string): BidiSegment[] {
  const segments: BidiSegment[] = [];
  let lastIndex = 0;

  const pushNonLatin = (chunk: string) => {
    for (const token of chunk.match(/\S+|\s+/g) ?? []) {
      // A flex item whose entire text content is a plain space collapses
      // to zero width under normal whitespace rules — non-breaking spaces
      // don't get trimmed away the same way.
      const isWhitespace = /^\s+$/.test(token);
      segments.push({
        text: isWhitespace ? NBSP.repeat(token.length) : token,
        ltr: false,
      });
    }
  };

  for (const match of text.matchAll(LATIN_RUN)) {
    const index = match.index ?? 0;
    if (index > lastIndex) {
      pushNonLatin(text.slice(lastIndex, index));
    }
    segments.push({ text: match[0], ltr: true });
    lastIndex = index + match[0].length;
  }
  if (lastIndex < text.length) {
    pushNonLatin(text.slice(lastIndex));
  }

  return segments;
}
