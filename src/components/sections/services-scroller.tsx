"use client";

import type { LucideIcon } from "lucide-react";
import {
  Cloud,
  Compass,
  Globe,
  PenTool,
  Server,
  Smartphone,
} from "lucide-react";
import Image from "next/image";
import { usePrefersReducedMotion } from "@/lib/hooks/use-prefers-reduced-motion";
import { useIsDesktop } from "@/lib/hooks/use-is-desktop";
import type { ServiceDisplay } from "@/components/sections/services-section";
import ServicesPinned from "@/components/sections/services-pinned";
import Reveal from "@/components/motion/reveal";

// lucide-react icon names come from content (mock/services.json), same
// render-time lookup pattern as ProcessSection's ICONS map.
const ICONS: Record<string, LucideIcon> = {
  Globe,
  Smartphone,
  PenTool,
  Server,
  Cloud,
  Compass,
};

interface ServicesScrollerProps {
  services: ServiceDisplay[];
  categoriesLabel: string;
}

/**
 * Gate between the two Services layouts. The pinned/parallax interaction
 * only mounts (and only subscribes to scroll) on a qualifying client —
 * desktop viewport AND no prefers-reduced-motion — so phones and reduced-
 * motion users never pay for a scroll subscription they'll never see.
 * `StackedServices` below serves both of those non-qualifying cases: a
 * plain, fully static list, not a shortened version of the pinned effect.
 */
export default function ServicesScroller({
  services,
  categoriesLabel,
}: ServicesScrollerProps) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const isDesktop = useIsDesktop();

  if (prefersReducedMotion || !isDesktop) {
    return (
      <StackedServices services={services} categoriesLabel={categoriesLabel} />
    );
  }

  return (
    <ServicesPinned services={services} categoriesLabel={categoriesLabel} />
  );
}

function StackedServices({ services, categoriesLabel }: ServicesScrollerProps) {
  return (
    <div className="flex flex-col gap-24">
      {services.map((service) => {
        const Icon = ICONS[service.icon];
        return (
          <Reveal key={service.id}>
            <div className="rounded-card border-border bg-card flex flex-col gap-24 border p-24">
              <div className="rounded-control relative aspect-video w-full overflow-hidden">
                <Image
                  src={service.image}
                  alt=""
                  fill
                  sizes="100vw"
                  className="object-cover"
                />
              </div>
              <div className="flex flex-col gap-16">
                <div className="bg-surface-raised border-border rounded-control inline-flex size-40 shrink-0 items-center justify-center border">
                  {Icon && (
                    <Icon
                      className="text-text-primary size-20"
                      strokeWidth={1.5}
                    />
                  )}
                </div>
                <div className="flex flex-col gap-8">
                  <h3 className="text-16 text-text-primary font-semibold">
                    {service.title}
                  </h3>
                  <p className="text-13 text-text-secondary">
                    {service.excerpt}
                  </p>
                </div>
                <div className="flex flex-col gap-8">
                  <span className="text-12 text-text-secondary font-medium">
                    {categoriesLabel}
                  </span>
                  <div className="flex flex-wrap gap-8">
                    {service.categories.map((category) => (
                      <span
                        key={category}
                        className="border-border text-text-primary text-13 rounded-full border px-16 py-8"
                      >
                        {category}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </Reveal>
        );
      })}
    </div>
  );
}
