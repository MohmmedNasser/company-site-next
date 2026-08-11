"use client";

import { useEffect, useState } from "react";
import { Star } from "lucide-react";
import Image from "next/image";
import { useLocale } from "next-intl";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";
import { usePrefersReducedMotion } from "@/lib/hooks/use-prefers-reduced-motion";
import { cn } from "@/lib/utils/cn";
import type { TestimonialDisplay } from "@/components/sections/testimonials-section";

interface TestimonialsSliderProps {
  testimonials: TestimonialDisplay[];
  previousLabel: string;
  nextLabel: string;
}

export default function TestimonialsSlider({
  testimonials,
  previousLabel,
  nextLabel,
}: TestimonialsSliderProps) {
  const locale = useLocale();
  const prefersReducedMotion = usePrefersReducedMotion();
  const [api, setApi] = useState<CarouselApi>();
  const [activeIndex, setActiveIndex] = useState(0);

  // Single source of truth for the dot indicator, driven by Embla's own
  // "select" event — fires for arrow-button, dot, and raw drag/swipe
  // navigation alike, so there's no separate geometry-guessing pass to
  // keep in sync (the previous hand-rolled track had to reverse-engineer
  // this from scroll position; Embla already knows which slide is active).
  useEffect(() => {
    if (!api) return;
    const onSelect = () => setActiveIndex(api.selectedScrollSnap());
    onSelect();
    api.on("select", onSelect);
    api.on("reInit", onSelect);
    return () => {
      api.off("select", onSelect);
      api.off("reInit", onSelect);
    };
  }, [api]);

  return (
    <Carousel
      setApi={setApi}
      opts={{
        align: "start",
        direction: locale === "ar" ? "rtl" : "ltr",
      }}
      className="flex flex-col gap-24"
    >
      <CarouselContent>
        {testimonials.map((testimonial) => (
          <CarouselItem
            key={testimonial.id}
            className="w-320 shrink-0 basis-auto sm:w-400"
          >
            <div className="border-border bg-card rounded-card flex h-full flex-col gap-24 border p-32">
              <div className="flex items-center gap-16">
                <div className="relative size-64 shrink-0 overflow-hidden rounded-full">
                  <Image
                    src={testimonial.avatar}
                    alt=""
                    fill
                    sizes="64px"
                    className="object-cover"
                  />
                </div>
                <div className="flex flex-col gap-4">
                  <span className="text-24 text-text-primary font-semibold">
                    {testimonial.author}
                  </span>
                  <span className="text-14 text-text-secondary">
                    {testimonial.role}
                  </span>
                </div>
              </div>

              <div className="border-border border-t" />

              <p className="text-14 text-text-secondary flex-1">
                {testimonial.quote}
              </p>

              <div className="flex items-center gap-8">
                <div className="flex items-center gap-2" aria-hidden="true">
                  {Array.from({ length: 5 }, (_, i) => (
                    <Star
                      key={i}
                      className="text-warning size-14"
                      fill="currentColor"
                      strokeWidth={0}
                    />
                  ))}
                </div>
                <span className="text-13 text-text-secondary font-medium">
                  {testimonial.rating.toFixed(1)}
                </span>
              </div>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>

      <div className="flex items-center justify-between gap-16">
        <div className="flex items-center gap-8">
          {testimonials.map((testimonial, index) => (
            <button
              key={testimonial.id}
              type="button"
              onClick={() => api?.scrollTo(index, prefersReducedMotion)}
              aria-label={testimonial.author}
              aria-current={index === activeIndex}
              className={cn(
                "duration-micro size-8 rounded-full transition-colors",
                index === activeIndex ? "bg-text-primary" : "bg-border",
              )}
            />
          ))}
        </div>

        <div className="flex items-center gap-8">
          <CarouselPrevious aria-label={previousLabel} />
          <CarouselNext aria-label={nextLabel} />
        </div>
      </div>
    </Carousel>
  );
}
