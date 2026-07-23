import { SectionMarker } from "@/components/section-marker";
import { experience } from "@/lib/copy";

// The dark world returns once below the fold: the run history, set as a ledger.
export const ExperienceSection = () => (
  <section aria-label="Experience" className="band-dark on-dark mt-24 py-20 md:mt-32 md:py-24">
    <div className="relative mx-auto max-w-6xl px-6 md:px-10">
      <SectionMarker
        stage={experience.stage}
        index={experience.index}
        label={experience.eyebrow}
        dark
      />
      <h2 className="sr-only">{experience.heading}</h2>
      <div className="mt-10 pl-7 md:pl-10">
        {experience.rows.map((row) => (
          <div
            key={row.label}
            className="border-paper/15 grid gap-2 border-t py-5 md:grid-cols-12 md:gap-10"
          >
            <p className="eyebrow text-trace-dark md:col-span-5">{row.label}</p>
            <p className="text-paper/85 leading-relaxed md:col-span-7">{row.text}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);
