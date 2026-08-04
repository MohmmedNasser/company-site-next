import { content, pick } from "@/lib/content";
import Container from "@/components/ui/container";
import HeroSection from "@/components/hero/hero-section";

// The placeholder <Container> below is Phase 3's — Phase 5 replaces it with
// the real home page sections. HeroSection (Phase 4) reads its copy from
// src/lib/content/mock/settings.json via the same `content` repository, not
// a new hardcoded string or a messages/*.json key — per the translation-
// ownership rule in docs/design-decisions.md, hero title/subtitle/CTAs are
// client-editable content, not UI chrome.
export default async function Home({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const settings = await content.getSettings();

  return (
    <>
      <HeroSection
        locale={locale}
        title={pick(settings.hero.title, locale)}
        subtitle={pick(settings.hero.subtitle, locale)}
        ctaPrimaryLabel={pick(settings.hero.ctaPrimary, locale)}
        ctaSecondaryLabel={pick(settings.hero.ctaSecondary, locale)}
      />
      <Container className="py-96">
        <p className="text-24 text-text-primary max-w-640 font-semibold">
          {pick(settings.hero.title, locale)}
        </p>
      </Container>
    </>
  );
}
