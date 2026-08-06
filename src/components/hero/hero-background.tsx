// Token-driven CSS gradient — no WebGL canvas. Two soft radial blobs in the
// brand hues read as intentional in both themes (design-decisions.md §4)
// without any JS/GPU work, so every visitor gets the same background
// regardless of device or motion preference.
export default function HeroBackground() {
  return (
    <div
      className="absolute inset-0"
      style={{
        backgroundImage: [
          "radial-gradient(60% 55% at 20% 25%, color-mix(in srgb, var(--color-primary) 22%, transparent), transparent 70%)",
          "radial-gradient(55% 60% at 85% 80%, color-mix(in srgb, var(--color-secondary) 16%, transparent), transparent 70%)",
        ].join(", "),
        backgroundColor: "var(--color-bg)",
      }}
    />
  );
}
