import { getTranslations } from "next-intl/server";
import Container from "@/components/ui/container";
import SectionLabel from "@/components/ui/section-label";
import Reveal from "@/components/motion/reveal";
import ServicesScroller from "@/components/sections/services-scroller";

export interface ServiceDisplay {
  id: string;
  icon: string;
  image: string;
  title: string;
  excerpt: string;
  categories: string[];
}

interface ServicesSectionProps {
  heading: string;
  description: string;
  services: ServiceDisplay[];
}

export default async function ServicesSection({
  heading,
  description,
  services,
}: ServicesSectionProps) {
  const tNav = await getTranslations("common.nav");
  const tServices = await getTranslations("home.services");

  return (
    <Container as="section" className="py-128 md:py-160">
      <SectionLabel number={3}>{tNav("services")}</SectionLabel>

      <Reveal className="mx-auto mt-32 mb-64 flex max-w-640 flex-col items-center gap-16 text-center md:mt-48 md:mb-96">
        <h2 className="text-48 md:text-64 lg:text-80 text-text-primary leading-tight font-semibold tracking-[-0.03em] text-balance">
          {heading}
        </h2>
        <p className="text-14 md:text-16 text-text-secondary mx-auto max-w-480 text-balance">
          {description}
        </p>
      </Reveal>

      <ServicesScroller
        services={services}
        categoriesLabel={tServices("categoriesLabel")}
      />
    </Container>
  );
}
