import { content, pick } from "@/lib/content";
import Container from "@/components/ui/container";
import HeroSection from "@/components/hero/hero-section";
import MarqueeSection from "@/components/sections/marquee-section";
import ApproachSection from "@/components/sections/approach-section";
import ProcessSection from "@/components/sections/process-section";

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
  const processSteps = await content.getProcessSteps();

  return (
    <>
      <HeroSection
        locale={locale}
        title={pick(settings.hero.title, locale)}
        subtitle={pick(settings.hero.subtitle, locale)}
        ctaPrimaryLabel={pick(settings.hero.ctaPrimary, locale)}
        ctaSecondaryLabel={pick(settings.hero.ctaSecondary, locale)}
        trustRating={settings.hero.trust.rating}
        trustRatingScale={settings.hero.trust.ratingScale}
        trustClientsCount={settings.hero.trust.clientsCount}
        trustClientsLabel={pick(settings.hero.trust.clientsLabel, locale)}
      />

      <MarqueeSection />

      <ApproachSection
        statement={pick(settings.sections.approach.heading, locale)}
        detail={pick(settings.sections.approach.description, locale)}
      />

      <ProcessSection
        heading={pick(settings.sections.process.heading, locale)}
        description={pick(settings.sections.process.description, locale)}
        ctaLabel={pick(settings.sections.process.ctaLabel, locale)}
        steps={processSteps.map((step) => ({
          id: step.id,
          icon: step.icon,
          title: pick(step.title, locale),
          description: pick(step.description, locale),
        }))}
      />

      <Container className="py-96">
        <p className="text-24 text-text-primary max-w-640 font-semibold">
          {pick(settings.hero.title, locale)}
        </p>
      </Container>
    </>
  );
}
