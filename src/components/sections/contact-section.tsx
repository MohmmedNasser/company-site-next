import { readFileSync } from "node:fs";
import { join } from "node:path";
import { getTranslations } from "next-intl/server";
import { Phone, ChevronRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import Container from "@/components/ui/container";
import SectionLabel from "@/components/ui/section-label";
import { buttonClassNames } from "@/lib/utils/button-classes";
import Reveal from "@/components/motion/reveal";
import ContactForm from "@/components/sections/contact-form";

// Inlined at module load (not a CSS mask-image/<img>) so `fill="currentColor"`
// in the SVG actually inherits `text-text-decorative` from its wrapper — an
// externally-referenced SVG (via <img> or mask-image: url(...)) can't see
// page CSS, so currentColor would resolve to black instead of the token.

interface ContactSectionProps {
  heading: string;
  description: string;
  phone: string;
}

export default async function ContactSection({
  heading,
  description,
  phone,
}: ContactSectionProps) {
  const t = await getTranslations("home.contact");
  const tActions = await getTranslations("common.actions");

  return (
    <Container as="section" className="relative overflow-hidden py-80 md:py-96">
      <div
        aria-hidden="true"
        className="text-text-decorative pointer-events-none absolute inset-0 top-56 -z-20 h-full w-full bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url("/illustrations/world-map.jpg")` }}
      />

      {/* Light mode: fully opaque — world-map.jpg's own colours read as a
          visibly mismatched tinted rectangle against the near-white --bg
          even at 5% bleed-through, since light mode has so little contrast
          headroom to absorb it into. Dark mode keeps the original 95% (the
          same faint bleed-through is invisible against near-black), left
          untouched. */}
      <div
        aria-hidden="true"
        className="bg-bg dark:bg-bg/95 absolute inset-0 -z-10"
      />

      <SectionLabel number={7}>{t("sectionLabel")}</SectionLabel>

      {/* Plain logical flex-row, same technique as testimonials/faq —
          reorders itself under dir="rtl" with no rtl: classes needed. */}
      <div className="mt-32 flex flex-col gap-48 md:mt-48 md:flex-row md:items-center md:gap-64">
        <Reveal className="flex flex-1 flex-col items-start gap-24">
          <h2 className="text-48 md:text-64 text-text-primary leading-tight font-semibold tracking-[-0.03em] text-balance">
            {heading}
          </h2>
          <p className="text-14 md:text-16 text-text-secondary max-w-480 text-balance">
            {description}
          </p>

          <div className="mt-8 flex items-center gap-12">
            <span className="border-border flex size-40 shrink-0 items-center justify-center rounded-full border">
              <Phone className="text-text-primary size-16" aria-hidden="true" />
            </span>
            <span className="flex flex-col">
              <span className="text-12 text-text-secondary">
                {t("phoneLabel")}
              </span>
              <span className="text-14 text-text-primary font-medium">
                {phone}
              </span>
            </span>
          </div>

          <Link
            href="#contact-form"
            className={buttonClassNames({
              variant: "primary",
              className: "mt-8",
            })}
          >
            {tActions("startProject")}
            <ChevronRight
              className="size-16 rtl:-scale-x-100"
              aria-hidden="true"
            />
          </Link>
        </Reveal>

        <Reveal className="w-full flex-1">
          <div
            id="contact-form"
            className="border-border bg-card rounded-card border p-24 md:p-32"
          >
            <ContactForm />
          </div>
        </Reveal>
      </div>
    </Container>
  );
}
