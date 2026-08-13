import { ArrowRight } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import Container from "@/components/ui/container";
import SectionLabel from "@/components/ui/section-label";
import Reveal from "@/components/motion/reveal";
import { SERVICE_ICONS } from "@/components/services/service-icons";

export interface OtherServiceItem {
  id: string;
  slug: string;
  icon: string;
  title: string;
}

interface OtherServicesSectionProps {
  services: OtherServiceItem[];
}

/**
 * The tail of a service detail page: the other five services, so the page
 * ends on a route onward rather than a dead stop. Kept text-only — the
 * index page is where these get thumbnails and full excerpts, and
 * reproducing that here would compete with the page's own content.
 */
export default async function OtherServicesSection({
  services,
}: OtherServicesSectionProps) {
  const t = await getTranslations("services.detail");

  return (
    <Container as="section" className="py-80 md:py-96">
      <SectionLabel number={3}>{t("otherLabel")}</SectionLabel>

      <div className="mt-32 grid grid-cols-1 gap-x-48 md:mt-48 md:grid-cols-2">
        {services.map((service) => {
          const Icon = SERVICE_ICONS[service.icon];
          return (
            <Reveal key={service.id}>
              <Link
                href={`/services/${service.slug}`}
                className="group border-border hover:border-text-secondary duration-micro flex items-center gap-16 border-t py-24 transition-colors"
              >
                {Icon && (
                  <Icon
                    aria-hidden="true"
                    className="text-text-secondary size-20 shrink-0"
                  />
                )}
                <span className="text-16 text-text-primary flex-1 font-medium">
                  {service.title}
                </span>
                <ArrowRight
                  aria-hidden="true"
                  className="text-text-secondary size-16 shrink-0 rtl:-scale-x-100"
                />
              </Link>
            </Reveal>
          );
        })}
      </div>
    </Container>
  );
}
