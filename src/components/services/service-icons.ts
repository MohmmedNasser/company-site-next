import type { LucideIcon } from "lucide-react";
import {
  Cloud,
  Compass,
  Globe,
  PenTool,
  Server,
  Smartphone,
} from "lucide-react";

/**
 * Render-time lookup for the lucide-react icon names carried in content
 * (mock/services.json), same explicit-map pattern ProcessSection and
 * ServicesScroller use — an explicit map rather than a dynamic import, so
 * the bundle only ever carries icons a Service can actually name.
 *
 * Pulled into its own module because two /services routes (the index list
 * and the detail page) both need it. The home page's ServicesScroller keeps
 * its own copy: it's a "use client" module and hand-built, and importing
 * across that boundary to save six lines isn't worth touching it.
 */
export const SERVICE_ICONS: Record<string, LucideIcon> = {
  Globe,
  Smartphone,
  PenTool,
  Server,
  Cloud,
  Compass,
};
