import { ApproachSection } from "@/components/approach-section";
import { ContactSection } from "@/components/contact-section";
import { EngagementSection } from "@/components/engagement-section";
import { ExperienceSection } from "@/components/experience-section";
import { HeroGate } from "@/components/hero-gate";
import { TraceEffects } from "@/components/trace-effects";
import { WorkSection } from "@/components/work-section";
import { jsonLd } from "@/lib/copy";

export default function Page() {
  return (
    <>
      <script
        type="application/ld+json"
        // eslint-disable-next-line @eslint-react/dom-no-dangerously-set-innerhtml -- the canonical way to emit JSON-LD; input is our own static object
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <HeroGate />
      <main data-sheet className="sheet relative z-10">
        {/* The execution trace: drawn by scroll, pierced through every section. */}
        <div aria-hidden="true" data-spine className="spine hidden md:block">
          <div data-spine-fill className="spine-fill" />
        </div>
        <WorkSection />
        <ExperienceSection />
        <ApproachSection />
        <EngagementSection />
        <ContactSection />
        {/* Anchors the grey trace track to the page bottom so the gutter slit is
            never an empty black bar below the last node. */}
        <div aria-hidden="true" data-spine-end className="h-px w-full" />
      </main>
      <TraceEffects />
    </>
  );
}
