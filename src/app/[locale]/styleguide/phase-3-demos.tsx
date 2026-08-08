// src/app/[locale]/styleguide/phase-3-demos.tsx
"use client";

import { useState, type ReactNode } from "react";
import Button from "@/components/ui/button";
import Card from "@/components/ui/card";
import Chip from "@/components/ui/chip";
import Container from "@/components/ui/container";
import SectionHeading from "@/components/ui/section-heading";
import StatusCircle, {
  type StatusCircleState,
} from "@/components/ui/status-circle";
import Reveal from "@/components/motion/reveal";
import SlidingTextButton from "@/components/ui/sliding-text-button";

const STATUS_STATES: StatusCircleState[] = [
  "backlog",
  "todo",
  "in-progress",
  "done",
  "cancelled",
];

const SIZES = ["sm", "md"] as const;

// Phase 3 primitives get their own file rather than growing
// styleguide-client.tsx further (already large from Phase 1/2's token
// demos) — imported and rendered as one extra section there.
export function Phase3Demos() {
  const [loading, setLoading] = useState(false);

  function simulateLoad() {
    setLoading(true);
    setTimeout(() => setLoading(false), 2000);
  }

  return (
    <>
      <Section title="10. Button">
        <div className="flex flex-wrap items-center gap-16">
          <Button variant="primary">Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="primary" size="compact">
            Compact
          </Button>
          <Button variant="primary" disabled>
            Disabled
          </Button>
          <Button variant="primary" loading={loading} onClick={simulateLoad}>
            {loading ? "Loading…" : "Click to load (2s)"}
          </Button>
        </div>
      </Section>

      <Section title="11. Card">
        <div className="grid grid-cols-1 gap-16 sm:grid-cols-3">
          <Card>
            <p className="text-14 text-text-primary font-medium">
              Default card
            </p>
            <p className="text-13 text-text-secondary mt-4">
              Hover to see the border brighten — card and surface are the same
              fill now, so elevation is border-only.
            </p>
          </Card>
          <Card>
            <p className="text-14 text-text-primary font-medium">
              Another card
            </p>
            <p className="text-13 text-text-secondary mt-4">
              Dark mode never gets a shadow.
            </p>
          </Card>
          <Card>
            <p className="text-14 text-text-primary font-medium">Third card</p>
            <p className="text-13 text-text-secondary mt-4">
              Light mode gets a subtle shadow instead.
            </p>
          </Card>
        </div>
      </Section>

      <Section title="12. Chip">
        <div className="flex flex-wrap gap-8">
          <Chip color="neutral">Neutral</Chip>
          <Chip color="primary">Primary</Chip>
          <Chip color="success">Success</Chip>
          <Chip color="warning">Warning</Chip>
          <Chip color="error">Error</Chip>
        </div>
      </Section>

      <Section title="13. Container">
        <div className="bg-surface border-border border">
          <Container className="bg-primary/10 border-primary border-s-4 border-e-4 py-16">
            <p className="text-13 text-text-primary">
              max-w-7xl, centred, logical inline padding (ps/pe via px-24
              sm:px-32)
            </p>
          </Container>
        </div>
      </Section>

      <Section title="14. SectionHeading">
        <SectionHeading
          eyebrow="Styleguide"
          heading="Every section starts here"
          description="Eyebrow, heading, and an optional description, spaced consistently for every marketing section from Phase 5 onward."
        />
      </Section>

      <Section title="15. StatusCircle">
        <div className="flex flex-col gap-24">
          {SIZES.map((size) => (
            <div key={size} className="flex flex-wrap items-center gap-24">
              <span className="text-12 text-text-secondary w-32 font-mono">
                {size}
              </span>
              {STATUS_STATES.map((state) => (
                <div key={state} className="flex flex-col items-center gap-8">
                  <StatusCircle state={state} size={size} />
                  <span className="text-11 text-text-secondary font-mono">
                    {state}
                  </span>
                </div>
              ))}
            </div>
          ))}
        </div>
      </Section>

      <Section title="16. SlidingTextButton">
        <div className="flex flex-wrap items-center gap-16">
          <SlidingTextButton>Get Started</SlidingTextButton>
          <SlidingTextButton size="compact">Learn more</SlidingTextButton>
          <SlidingTextButton disabled>Disabled</SlidingTextButton>
        </div>
      </Section>

      <Section title="17. Reveal">
        <Reveal className="flex flex-col gap-12" stagger={0.12}>
          <Card>
            <p className="text-14 text-text-primary">Staggered item 1</p>
          </Card>
          <Card>
            <p className="text-14 text-text-primary">Staggered item 2</p>
          </Card>
          <Card>
            <p className="text-14 text-text-primary">Staggered item 3</p>
          </Card>
        </Reveal>
        <p className="text-12 text-text-secondary mt-16">
          Scroll this section out of view and back — with reduced motion off,
          the cards above fade/slide in staggered on re-entry; with
          prefers-reduced-motion on, they render fully visible immediately with
          no animation at all.
        </p>
      </Section>
    </>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section aria-label={title} className="mb-48">
      <h2 className="text-20 text-text-primary mb-16 font-semibold">{title}</h2>
      {children}
    </section>
  );
}
