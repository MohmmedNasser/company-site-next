import { Star } from "lucide-react";
import Image from "next/image";

interface HeroTrustBadgeProps {
  rating: string;
  ratingScale: string;
  clientsCount: string;
  clientsLabel: string;
}

const avatars = [
  { src: "/avatars/avatar1.jpg", alt: "client1" },
  { src: "/avatars/avatar2.jpg", alt: "client2" },
  { src: "/avatars/avatar3.jpg", alt: "client3" },
  { src: "/avatars/avatar4.jpg", alt: "client4" },
  { src: "/avatars/avatar5.jpg", alt: "client5" },
];

const STAR_COUNT = 5;

// Avatar stack is generic placeholders (lucide User icon on a surface
// circle), not real client headshots exist yet. Swap
// each <span> below for a real next/image client photo once available;
// keep the size-32/-ms-8/border-bg treatment so the stacked "cut-out"
// overlap survives the swap unchanged.
export default function HeroTrustBadge({
  rating,
  ratingScale,
  clientsCount,
  clientsLabel,
}: HeroTrustBadgeProps) {
  return (
    <div className="flex items-center gap-16">
      <div className="flex items-center" aria-hidden="true">
        {avatars.map((avatar, index) => (
          <span
            key={index}
            className="text-text-secondary -ms-11 inline-flex size-28 items-center justify-center rounded-full border-2 border-black/50 first:ms-0"
          >
            <Image
              src={avatar.src}
              alt={avatar.alt}
              width={24}
              height={24}
              className="size-24 rounded-full object-cover"
            />
          </span>
        ))}
      </div>
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1" aria-hidden="true">
            {Array.from({ length: STAR_COUNT }).map((_, index) => (
              <Star key={index} className="text-warning size-14 fill-current" />
            ))}
          </div>
          <span className="text-text-primary text-13 ms-4 font-semibold">
            {rating}/{ratingScale}
          </span>
        </div>
        <p className="text-12 text-text-secondary">
          {clientsCount} {clientsLabel}
        </p>
      </div>
    </div>
  );
}
