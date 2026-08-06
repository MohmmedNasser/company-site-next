import { Marquee } from "@/components/ui/marquee";
import Image from "next/image";

export default function MarqueeSection() {
  return (
    <Marquee
      reverse
      className="border-border border-y py-20 [--duration:50s] [--gap:48px]"
    >
      <div>
        <Image
          src="/tech-logos/anchor-sponsorships.svg"
          alt="Anchor Sponsorships"
          width={174}
          height={32}
          className="h-32 w-160 object-contain dark:brightness-0 dark:invert"
        />
      </div>
      <div>
        <Image
          src="/tech-logos/directus.svg"
          alt="Directus"
          width={154}
          height={32}
          className="h-32 w-160 object-contain dark:brightness-0 dark:invert"
        />
      </div>
      <div>
        <Image
          src="/tech-logos/fey.svg"
          alt="Fey"
          width={79}
          height={32}
          className="h-32 w-160 object-contain dark:brightness-0 dark:invert"
        />
      </div>
      <div>
        <Image
          src="/tech-logos/empower.svg"
          alt="Empower"
          width={151}
          height={32}
          className="h-32 w-160 object-contain dark:brightness-0 dark:invert"
        />
      </div>
      <div>
        <Image
          src="/tech-logos/fey.svg"
          alt="Fey"
          width={79}
          height={32}
          className="h-32 w-160 object-contain dark:brightness-0 dark:invert"
        />
      </div>
      <div>
        <Image
          src="/tech-logos/graphcore.svg"
          alt="Graphcore"
          width={251}
          height={32}
          className="h-32 w-160 object-contain dark:brightness-0 dark:invert"
        />
      </div>
      <div>
        <Image
          src="/tech-logos/hivecell.svg"
          alt="Hivecell"
          width={219}
          height={32}
          className="h-32 w-160 object-contain dark:brightness-0 dark:invert"
        />
      </div>
      <div>
        <Image
          src="/tech-logos/linktree.svg"
          alt="Linktree"
          width={158}
          height={32}
          className="h-32 w-160 object-contain dark:brightness-0 dark:invert"
        />
      </div>
      <div>
        <Image
          src="/tech-logos/stord.svg"
          alt="Stord"
          width={150}
          height={32}
          className="h-32 w-160 object-contain dark:brightness-0 dark:invert"
        />
      </div>
      <div>
        <Image
          src="/tech-logos/superlative.svg"
          alt="Superlative"
          width={175}
          height={32}
          className="h-32 w-160 object-contain dark:brightness-0 dark:invert"
        />
      </div>
    </Marquee>
  );
}
