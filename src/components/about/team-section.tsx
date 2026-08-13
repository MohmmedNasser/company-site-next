import { getTranslations } from "next-intl/server";
import Image from "next/image";
import Container from "@/components/ui/container";
import SectionLabel from "@/components/ui/section-label";
import Reveal from "@/components/motion/reveal";

export interface TeamMemberDisplay {
  id: string;
  avatar: string;
  name: string;
  role: string;
  bio: string;
}

interface TeamSectionProps {
  heading: string;
  description: string;
  members: TeamMemberDisplay[];
}

export default async function TeamSection({
  heading,
  description,
  members,
}: TeamSectionProps) {
  const t = await getTranslations("about.team");

  return (
    <Container as="section" className="py-80 md:py-96">
      <SectionLabel number={4}>{t("sectionLabel")}</SectionLabel>

      <Reveal className="mt-32 mb-48 flex max-w-640 flex-col gap-16 md:mt-48 md:mb-64">
        <h2 className="text-48 md:text-64 text-text-primary leading-tight font-semibold tracking-[-0.03em] text-balance">
          {heading}
        </h2>
        <p className="text-14 md:text-16 text-text-secondary text-balance">
          {description}
        </p>
      </Reveal>

      <div className="grid grid-cols-1 gap-32 sm:grid-cols-2 lg:grid-cols-4">
        {members.map((member, index) => (
          <Reveal key={member.id} delay={(index % 4) * 0.08}>
            <div className="flex flex-col gap-16">
              {/* grayscale, not a colour photo: the services section's
                  full-colour photography is a named, section-scoped
                  exception (see Service.image in content/types.ts) and does
                  not extend here. Desaturating in CSS keeps the source
                  asset untouched and needs no colour token. */}
              <div className="border-border bg-card rounded-card relative aspect-square w-full overflow-hidden border">
                <Image
                  src={member.avatar}
                  alt=""
                  fill
                  sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                  className="object-cover grayscale"
                />
              </div>

              <div className="flex flex-col gap-8">
                <h3 className="text-20 text-text-primary font-semibold">
                  {member.name}
                </h3>
                <p className="text-12 text-text-secondary font-medium">
                  {member.role}
                </p>
                <p className="text-14 text-text-secondary">{member.bio}</p>
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </Container>
  );
}
