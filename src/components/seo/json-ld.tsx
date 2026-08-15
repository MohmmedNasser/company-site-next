// src/components/seo/json-ld.tsx
//
// JSON-LD requires a literal <script type="application/ld+json"> tag —
// dangerouslySetInnerHTML is the sanctioned way to emit one from React (see
// Next.js's own JSON-LD documentation). `data` is always a plain object
// built server-side from typed content/settings (src/lib/structured-data.ts),
// never raw user input, so there is no injection surface here.
export function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
