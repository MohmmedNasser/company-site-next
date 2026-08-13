import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { content, pick } from "@/lib/content";
import { localeAlternates } from "@/lib/metadata";
import Container from "@/components/ui/container";
import PageIntro from "@/components/ui/page-intro";
import Reveal from "@/components/motion/reveal";
import ContactDetails from "@/components/contact/contact-details";
import ContactForm from "@/components/sections/contact-form";

const ROUTE = "/contact";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const settings = await content.getSettings();
  const intro = settings.pages.contact.intro;

  return {
    title: pick(intro.heading, locale),
    description: pick(intro.description, locale),
    alternates: localeAlternates(ROUTE, locale),
  };
}

export default async function ContactPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const [settings, tNav, tContact] = await Promise.all([
    content.getSettings(),
    getTranslations({ locale, namespace: "common.nav" }),
    getTranslations({ locale, namespace: "contact" }),
  ]);

  const intro = settings.pages.contact.intro;

  return (
    <>
      <PageIntro
        label={tNav("contact")}
        heading={pick(intro.heading, locale)}
        description={pick(intro.description, locale)}
      />

      {/* No second SectionLabel: the form and the details ARE this page's
          content, not sections within it — same call as the other index
          pages. Plain logical flex-row, so it reorders itself under
          dir="rtl" with no rtl: classes.

          The form is rendered here rather than rebuilt: ContactForm already
          owns the validation schema, the honeypot, the server action, and
          the aria-live status region. A second copy would be a second thing
          to keep correct. The home section's world-map backdrop is
          deliberately NOT reused — it is that section's signature, and
          repeating it here would spend it twice. */}
      <Container as="section" className="pb-80 md:pb-96">
        <div className="flex flex-col gap-48 md:flex-row md:gap-64">
          <Reveal className="md:w-320 md:shrink-0">
            <ContactDetails
              email={settings.contact.email}
              phone={settings.contact.phone}
              address={pick(settings.contact.address, locale)}
            />
          </Reveal>

          <Reveal delay={0.08} className="w-full flex-1">
            <div className="flex flex-col gap-24">
              <h2 className="text-20 text-text-primary font-semibold">
                {tContact("formHeading")}
              </h2>
              <div className="border-border bg-card rounded-card border p-24 md:p-32">
                <ContactForm />
              </div>
            </div>
          </Reveal>
        </div>
      </Container>
    </>
  );
}
