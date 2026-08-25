import { ApproachSection } from "@/components/approach-section";
import { ContactSection } from "@/components/contact-section";
import { EngagementSection } from "@/components/engagement-section";
import { ExperienceSection } from "@/components/experience-section";
import { HeroGate } from "@/components/hero-gate";
import { NotesSection } from "@/components/notes-section";
import { TestimonialsSection } from "@/components/testimonials-section";
import { TraceEffects } from "@/components/trace-effects";
import { WorkSection } from "@/components/work-section";
import { jsonLd } from "@/lib/copy";
import { serializeJsonLd } from "@/lib/structured-data";

export default function Page() {
  return (
    <>
      <script
        type="application/ld+json"
        // eslint-disable-next-line @eslint-react/dom-no-dangerously-set-innerhtml -- JSON-LD must be an inline script; the payload is JSON.stringify of our own static object with `<` escaped (serializeJsonLd), no user input involved.
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(jsonLd) }}
      />
      <HeroGate />
      <main id="main" data-sheet className="sheet relative z-10">
        {/* The execution trace: drawn by scroll, pierced through every section. */}
        <div aria-hidden="true" data-spine className="spine hidden md:block">
          <div data-spine-fill className="spine-fill" />
        </div>
        <WorkSection />
        <TestimonialsSection />
        <ExperienceSection />
        <ApproachSection />
        <NotesSection />
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
