import { content, pick } from "@/lib/content";
import Container from "@/components/ui/container";

// Placeholder only — Phase 5 owns real home page sections. Renders the
// hero title already in src/lib/content/mock/settings.json (not a new
// hardcoded string) so this doubles as an end-to-end check that Header,
// <main>, and Footer all render around real bilingual content.
export default async function Home({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const settings = await content.getSettings();

  return (
    <Container className="py-96">
      <p className="text-24 text-text-primary max-w-640 font-semibold">
        {pick(settings.hero.title, locale)}
      </p>
    </Container>
  );
}
