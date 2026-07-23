import { ApproachSection } from "@/components/approach-section";
import { ContactSection } from "@/components/contact-section";
import { ExperienceSection } from "@/components/experience-section";
import { Hero } from "@/components/hero";
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
      <Hero />
      <main data-sheet className="sheet relative z-10">
        {/* The execution trace: drawn by scroll, pierced through every section. */}
        <div aria-hidden="true" data-spine className="spine hidden md:block">
          <div data-spine-fill className="spine-fill" />
        </div>
        <WorkSection />
        <ExperienceSection />
        <ApproachSection />
        <ContactSection />
      </main>
      <TraceEffects />
    </>
  );
}
