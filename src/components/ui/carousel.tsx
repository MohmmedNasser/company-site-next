"use client";

import * as React from "react";
import useEmblaCarousel, {
  type UseEmblaCarouselType,
} from "embla-carousel-react";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { usePrefersReducedMotion } from "@/lib/hooks/use-prefers-reduced-motion";
import { cn } from "@/lib/utils";

// Adapted from https://ui.shadcn.com/docs/components/base/carousel.
// CarouselPrevious/CarouselNext deliberately do NOT use shadcn's own
// `@/components/ui/button` — this project's button.tsx is a hand-built
// component (default export, `buttonClassNames`, `loading` prop) already
// used across header/footer/hero, and the registry's Button is a
// same-named but incompatible replacement. Swapping it in here would
// either overwrite that file (breaking every other caller) or silently
// bolt a second, shadcn-token-based button style onto the site next to
// this project's own tokens.css system. Plain `<button>`s styled with
// this project's own tokens avoid both.
const NAV_BUTTON_CLASSES =
  "border-border text-text-primary hover:bg-surface-raised duration-micro inline-flex size-40 shrink-0 items-center justify-center rounded-full border transition-colors disabled:pointer-events-none disabled:opacity-40";

type CarouselApi = UseEmblaCarouselType[1];
type UseCarouselParameters = Parameters<typeof useEmblaCarousel>;
type CarouselOptions = UseCarouselParameters[0];
type CarouselPlugin = UseCarouselParameters[1];

type CarouselProps = {
  opts?: CarouselOptions;
  plugins?: CarouselPlugin;
  orientation?: "horizontal" | "vertical";
  setApi?: (api: CarouselApi) => void;
};

type CarouselContextProps = {
  carouselRef: ReturnType<typeof useEmblaCarousel>[0];
  api: ReturnType<typeof useEmblaCarousel>[1];
  scrollPrev: () => void;
  scrollNext: () => void;
  canScrollPrev: boolean;
  canScrollNext: boolean;
} & CarouselProps;

const CarouselContext = React.createContext<CarouselContextProps | null>(null);

function useCarousel() {
  const context = React.useContext(CarouselContext);

  if (!context) {
    throw new Error("useCarousel must be used within a <Carousel />");
  }

  return context;
}

function Carousel({
  orientation = "horizontal",
  opts,
  setApi,
  plugins,
  className,
  children,
  ...props
}: React.ComponentProps<"div"> & CarouselProps) {
  const [carouselRef, api] = useEmblaCarousel(
    {
      ...opts,
      axis: orientation === "horizontal" ? "x" : "y",
    },
    plugins,
  );
  // useSyncExternalStore (not useState + effect) — same reasoning as
  // use-prefers-reduced-motion.ts: canScrollPrev/canScrollNext are a
  // synchronous snapshot of an external store (Embla's api), not derived
  // React state, so there's no setState-in-effect to trip the
  // react-hooks/set-state-in-effect rule.
  const subscribeToSelect = React.useCallback(
    (onStoreChange: () => void) => {
      if (!api) return () => {};
      api.on("select", onStoreChange);
      api.on("reInit", onStoreChange);
      return () => {
        api.off("select", onStoreChange);
        api.off("reInit", onStoreChange);
      };
    },
    [api],
  );
  const canScrollPrev = React.useSyncExternalStore(
    subscribeToSelect,
    React.useCallback(() => api?.canScrollPrev() ?? false, [api]),
    () => false,
  );
  const canScrollNext = React.useSyncExternalStore(
    subscribeToSelect,
    React.useCallback(() => api?.canScrollNext() ?? false, [api]),
    () => false,
  );
  // Embla's scroll animation is JS-driven (rAF-based physics), not CSS —
  // it does not read `prefers-reduced-motion` on its own. `jump=true`
  // skips straight to the target position instead of animating there.
  const prefersReducedMotion = usePrefersReducedMotion();

  const scrollPrev = React.useCallback(() => {
    api?.scrollPrev(prefersReducedMotion);
  }, [api, prefersReducedMotion]);

  const scrollNext = React.useCallback(() => {
    api?.scrollNext(prefersReducedMotion);
  }, [api, prefersReducedMotion]);

  const handleKeyDown = React.useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        scrollPrev();
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        scrollNext();
      }
    },
    [scrollPrev, scrollNext],
  );

  React.useEffect(() => {
    if (!api || !setApi) return;
    setApi(api);
  }, [api, setApi]);

  return (
    <CarouselContext.Provider
      value={{
        carouselRef,
        api: api,
        opts,
        orientation:
          orientation || (opts?.axis === "y" ? "vertical" : "horizontal"),
        scrollPrev,
        scrollNext,
        canScrollPrev,
        canScrollNext,
      }}
    >
      <div
        onKeyDownCapture={handleKeyDown}
        className={cn("relative", className)}
        role="region"
        aria-roledescription="carousel"
        data-slot="carousel"
        {...props}
      >
        {children}
      </div>
    </CarouselContext.Provider>
  );
}

function CarouselContent({ className, ...props }: React.ComponentProps<"div">) {
  const { carouselRef, orientation } = useCarousel();

  return (
    <div
      ref={carouselRef}
      className="overflow-hidden"
      data-slot="carousel-content"
    >
      <div
        className={cn(
          "flex",
          orientation === "horizontal" ? "-ml-24" : "-mt-24 flex-col",
          className,
        )}
        {...props}
      />
    </div>
  );
}

function CarouselItem({ className, ...props }: React.ComponentProps<"div">) {
  const { orientation } = useCarousel();

  return (
    <div
      role="group"
      aria-roledescription="slide"
      data-slot="carousel-item"
      className={cn(
        "min-w-0 shrink-0 grow-0 basis-full",
        orientation === "horizontal" ? "pl-24" : "pt-24",
        className,
      )}
      {...props}
    />
  );
}

function CarouselPrevious({
  className,
  ...props
}: React.ComponentProps<"button">) {
  const { scrollPrev, canScrollPrev } = useCarousel();

  return (
    <button
      type="button"
      data-slot="carousel-previous"
      disabled={!canScrollPrev}
      onClick={scrollPrev}
      className={cn(NAV_BUTTON_CLASSES, className)}
      {...props}
    >
      <ChevronLeftIcon
        className="size-16 rtl:-scale-x-100"
        aria-hidden="true"
      />
      <span className="sr-only">Previous slide</span>
    </button>
  );
}

function CarouselNext({ className, ...props }: React.ComponentProps<"button">) {
  const { scrollNext, canScrollNext } = useCarousel();

  return (
    <button
      type="button"
      data-slot="carousel-next"
      disabled={!canScrollNext}
      onClick={scrollNext}
      className={cn(NAV_BUTTON_CLASSES, className)}
      {...props}
    >
      <ChevronRightIcon
        className="size-16 rtl:-scale-x-100"
        aria-hidden="true"
      />
      <span className="sr-only">Next slide</span>
    </button>
  );
}

export {
  type CarouselApi,
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
  useCarousel,
};
