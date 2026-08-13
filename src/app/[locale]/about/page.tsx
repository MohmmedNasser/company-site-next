import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { content, pick, toParagraphs } from "@/lib/content";
import { localeAlternates } from "@/lib/metadata";
import PageIntro from "@/components/ui/page-intro";
import StorySection from "@/components/about/story-section";
import ValuesSection from "@/components/about/values-section";
import TeamSection from "@/components/about/team-section";
import TimelineSection from "@/components/about/timeline-section";

const ROUTE = "/about";

// generateStaticParams lives on the [locale] layout, which already
// enumerates every locale — this route has no further dynamic segment, so
// it needs no params generator of its own.

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const settings = await content.getSettings();
  const about = settings.pages.about;

  return {
    // Rendered through the layout's title template ("%s · <site title>"),
    // so this is the page name only, not the full document title.
    title: pick(about.intro.heading, locale),
    description: pick(about.intro.description, locale),
    alternates: localeAlternates(ROUTE, locale),
  };
}

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  // Opts this route into static rendering — without it, next-intl falls
  // back to dynamic rendering for anything reading translations here.
  setRequestLocale(locale);

  const [settings, values, teamMembers, timeline, tTimeline] =
    await Promise.all([
      content.getSettings(),
      content.getValues(),
      content.getTeamMembers(),
      content.getTimeline(),
      getTranslations({ locale, namespace: "about.timeline" }),
    ]);

  const about = settings.pages.about;
  const tNav = await getTranslations({ locale, namespace: "common.nav" });

  return (
    <>
      <PageIntro
        label={tNav("about")}
        heading={pick(about.intro.heading, locale)}
        description={pick(about.intro.description, locale)}
      />

      <StorySection
        heading={pick(about.story.heading, locale)}
        description={pick(about.story.description, locale)}
        // Split here, in the page, rather than inside StorySection — the
        // section renders what it's given and never parses content, same
        // contract every other section component follows.
        paragraphs={toParagraphs(pick(about.story.body, locale))}
      />

      <ValuesSection
        heading={pick(about.values.heading, locale)}
        description={pick(about.values.description, locale)}
        values={values.map((value) => ({
          id: value.id,
          icon: value.icon,
          title: pick(value.title, locale),
          description: pick(value.description, locale),
        }))}
      />

      <TeamSection
        heading={pick(about.team.heading, locale)}
        description={pick(about.team.description, locale)}
        members={teamMembers.map((member) => ({
          id: member.id,
          avatar: member.avatar,
          name: pick(member.name, locale),
          role: pick(member.role, locale),
          bio: pick(member.bio, locale),
        }))}
      />

      <TimelineSection
        heading={pick(about.timeline.heading, locale)}
        description={pick(about.timeline.description, locale)}
        entries={timeline.map((entry) => ({
          id: entry.id,
          year: entry.year,
          status: entry.status,
          title: pick(entry.title, locale),
          description: pick(entry.description, locale),
          // StatusCircle's built-in labels are English-only defaults meant
          // for the admin UI. A marketing page in two locales has to supply
          // its own translated one.
          statusLabel: tTimeline(`status.${entry.status}`),
        }))}
      />
    </>
  );
}
