import { content, pick } from "@/lib/content";
import Container from "@/components/ui/container";
import HeroSection from "@/components/hero/hero-section";
import MarqueeSection from "@/components/sections/marquee-section";
import ApproachSection from "@/components/sections/approach-section";
import ProcessSection from "@/components/sections/process-section";
import ServicesSection from "@/components/sections/services-section";
import PortfolioSection from "@/components/sections/portfolio-section";
import TestimonialsSection from "@/components/sections/testimonials-section";
import FaqSection from "@/components/sections/faq-section";
import ContactSection from "@/components/sections/contact-section";

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
  const [
    settings,
    processSteps,
    services,
    projects,
    clients,
    testimonials,
    faqItems,
  ] = await Promise.all([
    content.getSettings(),
    content.getProcessSteps(),
    content.getServices(),
    content.getProjects(),
    content.getClients(),
    content.getTestimonials(),
    content.getFaqItems(),
  ]);
  const clientNameById = new Map(
    clients.map((client) => [client.id, pick(client.name, locale)]),
  );

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

      <PortfolioSection
        heading={pick(settings.sections.portfolio.heading, locale)}
        description={pick(settings.sections.portfolio.description, locale)}
        projects={projects.map((project) => ({
          id: project.id,
          slug: project.slug,
          category: project.category,
          status: project.status,
          coverImage: project.coverImage,
          title: pick(project.title, locale),
          summary: pick(project.summary, locale),
          clientName: clientNameById.get(project.client) ?? "",
        }))}
      />

      <ServicesSection
        heading={pick(settings.sections.services.heading, locale)}
        description={pick(settings.sections.services.description, locale)}
        services={services.map((service) => ({
          id: service.id,
          icon: service.icon,
          image: service.image,
          title: pick(service.title, locale),
          excerpt: pick(service.excerpt, locale),
          categories: service.categories,
        }))}
      />

      <TestimonialsSection
        heading={pick(settings.sections.testimonials.heading, locale)}
        description={pick(settings.sections.testimonials.description, locale)}
        testimonials={testimonials.map((testimonial) => ({
          id: testimonial.id,
          avatar: testimonial.avatar,
          rating: testimonial.rating,
          author: pick(testimonial.author, locale),
          role: pick(testimonial.role, locale),
          quote: pick(testimonial.quote, locale),
        }))}
      />

      <FaqSection
        heading={pick(settings.sections.faq.heading, locale)}
        description={pick(settings.sections.faq.description, locale)}
        items={faqItems.map((item) => ({
          id: item.id,
          question: pick(item.question, locale),
          answer: pick(item.answer, locale),
        }))}
      />

      <ContactSection
        heading={pick(settings.sections.contact.heading, locale)}
        description={pick(settings.sections.contact.description, locale)}
        phone={settings.contact.phone}
      />

      <Container className="py-96">
        <p className="text-24 text-text-primary max-w-640 font-semibold">
          {pick(settings.hero.title, locale)}
        </p>
      </Container>
    </>
  );
}
