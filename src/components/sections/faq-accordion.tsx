"use client";

import { useId, useState } from "react";
import { Plus } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { EASE_DECELERATE } from "@/lib/motion/easing";
import { cn } from "@/lib/utils/cn";

export interface FaqItemDisplay {
  id: string;
  question: string;
  answer: string;
}

interface FaqAccordionProps {
  items: FaqItemDisplay[];
}

// Upper bound of this project's own 150–300ms animation guideline: a
// height+opacity panel reveal is a bigger visual move than the
// --duration-micro token's "hover, focus, buttons" scope, so it reads
// better slower than that token's 150ms.
const PANEL_DURATION_SECONDS = 0.3;

// Single `openId` (not one boolean per item) enforces the single-open
// accordion behavior by construction — there is no state shape in which
// two items could both read as open.
export default function FaqAccordion({ items }: FaqAccordionProps) {
  const [openId, setOpenId] = useState<string | null>(null);
  const shouldReduceMotion = useReducedMotion();
  const baseId = useId();

  return (
    <div className="border-border border-t">
      {items.map((item) => {
        const isOpen = item.id === openId;
        const headerId = `${baseId}-${item.id}-header`;
        const panelId = `${baseId}-${item.id}-panel`;

        return (
          <div key={item.id} className="border-border border-b">
            <h3>
              <button
                type="button"
                id={headerId}
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => setOpenId(isOpen ? null : item.id)}
                className="text-14 md:text-16 text-text-primary flex min-h-44 w-full items-center justify-between gap-16 py-16 text-start font-medium"
              >
                <span>{item.question}</span>
                <Plus
                  aria-hidden="true"
                  className={cn(
                    "text-text-secondary size-20 shrink-0",
                    !shouldReduceMotion &&
                      "duration-micro ease-decelerate transition-transform",
                    isOpen && "rotate-45",
                  )}
                />
              </button>
            </h3>

            {shouldReduceMotion ? (
              // CRITICAL short-circuit, same rule as Reveal: reduced-motion
              // means no transform/height transition at all, not a
              // shortened version of the same animation — the panel is
              // either fully in the DOM or not there.
              isOpen && (
                <div id={panelId} role="region" aria-labelledby={headerId}>
                  <p className="text-14 text-text-secondary pe-40 pb-16">
                    {item.answer}
                  </p>
                </div>
              )
            ) : (
              <motion.div
                id={panelId}
                role="region"
                aria-labelledby={headerId}
                initial={false}
                animate={{
                  height: isOpen ? "auto" : 0,
                  opacity: isOpen ? 1 : 0,
                }}
                transition={{
                  duration: PANEL_DURATION_SECONDS,
                  ease: EASE_DECELERATE,
                }}
                className="overflow-hidden"
              >
                <p className="text-14 text-text-secondary pe-40 pb-16">
                  {item.answer}
                </p>
              </motion.div>
            )}
          </div>
        );
      })}
    </div>
  );
}
