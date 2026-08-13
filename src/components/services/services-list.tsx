import { ArrowRight } from "lucide-react";
import { getTranslations } from "next-intl/server";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import Container from "@/components/ui/container";
import Chip from "@/components/ui/chip";
import Reveal from "@/components/motion/reveal";
import { SERVICE_ICONS } from "@/components/services/service-icons";

export interface ServiceListItem {
  id: string;
  slug: string;
  icon: string;
  image: string;
  title: string;
  excerpt: string;
  categories: string[];
}

interface ServicesListProps {
  services: ServiceListItem[];
}

/**
 * The /services index, as rows rather than cards.
 *
 * Deliberately not a card grid: the home page already renders these six
 * records as a horizontal card scroller, and repeating that here would make
 * the index read as a duplicate of a section the visitor just scrolled
 * past. A full-width row also gives the excerpt and the capability chips
 * room the card format doesn't have, which is the reason to open an index
 * page at all.
 *
 * Separation is a top border per row, and hover brightens that border —
 * the system's elevation rule (a border, never a fill step) applied to a
 * list instead of a card, matching what Card already does on hover.
 */
export default async function ServicesList({ services }: ServicesListProps) {
  const t = await getTranslations("services.list");

  return (
    <Container as="section" className="pb-80 md:pb-96">
      <div className="flex flex-col">
        {services.map((service) => {
          const Icon = SERVICE_ICONS[service.icon];
          return (
            <Reveal key={service.id}>
              <Link
                href={`/services/${service.slug}`}
                className="group border-border hover:border-text-secondary duration-micro flex flex-col gap-24 border-t py-32 transition-colors md:flex-row md:items-center md:gap-48 md:py-40"
              >
                <div className="flex flex-1 flex-col items-start gap-16">
                  <div className="flex items-center gap-16">
                    {Icon && (
                      <Icon
                        aria-hidden="true"
                        className="text-text-primary size-20 shrink-0"
                      />
                    )}
                    <h2 className="text-24 md:text-32 text-text-primary font-semibold">
                      {service.title}
                    </h2>
                  </div>

                  <p className="text-14 md:text-16 text-text-secondary max-w-640">
                    {service.excerpt}
                  </p>

                  <ul className="flex flex-wrap gap-8">
                    {service.categories.map((category) => (
                      <li key={category}>
                        {/* lang="en" on the chip, not the list: these are
                            practitioner terms that stay in English in both
                            locales (i18n-keys skill), and tagging them
                            keeps Arabic pages from applying Noto Kufi's
                            optical sizing to Latin text. */}
                        <Chip lang="en">{category}</Chip>
                      </li>
                    ))}
                  </ul>

                  <span className="text-13 text-text-primary inline-flex items-center gap-8 font-medium">
                    {t("viewLabel")}
                    <ArrowRight
                      aria-hidden="true"
                      className="size-14 rtl:-scale-x-100"
                    />
                  </span>
                </div>

                {/* Grayscale: the full-colour photography exception is
                    scoped to the HOME services section (see Service.image
                    in content/types.ts) and doesn't extend to this page.
                    Hidden below md — at phone width the row already carries
                    a heading, an excerpt and four chips, and a thumbnail
                    under them adds scroll length without adding
                    information. */}
                <div className="border-border bg-card rounded-card relative hidden aspect-video w-240 shrink-0 overflow-hidden border md:block lg:w-320">
                  <Image
                    src={service.image}
                    alt=""
                    fill
                    sizes="(min-width: 1024px) 320px, 240px"
                    className="ease-decelerate object-cover grayscale transition-transform duration-700 group-hover:scale-105"
                  />
                </div>
              </Link>
            </Reveal>
          );
        })}

        {/* Closes the last row, so the list reads as a bounded block rather
            than one that simply ran out of items. */}
        <span aria-hidden="true" className="bg-border h-px w-full" />
      </div>
    </Container>
  );
}
