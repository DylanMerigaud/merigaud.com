import { SectionMarker } from "@/components/section-marker";
import { engagement } from "@/lib/copy";

// How to actually hire Dylan: the paid pilot, the bridge-while-you-hire reframe,
// availability. The conversion step between "impressed" and "email sent". Set as
// a ledger of engagement modes; pricing routes to the call by design.
export const EngagementSection = () => (
  <section aria-label="Work with me" className="py-24 md:py-32">
    <div className="relative mx-auto max-w-6xl px-6 md:px-10">
      <SectionMarker stage={engagement.stage} index={engagement.index} label={engagement.eyebrow} />
      <div className="pl-7 md:pl-10">
        <h2 className="mt-8 text-3xl font-semibold tracking-tight md:text-4xl">
          {engagement.heading}
        </h2>
        <dl className="mt-10 max-w-4xl">
          {engagement.rows.map((row) => (
            <div
              key={row.title}
              className="border-ink/15 grid gap-2 border-t py-6 md:grid-cols-12 md:gap-10"
            >
              <dt className="text-lg font-semibold tracking-tight md:col-span-4">{row.title}</dt>
              <dd className="text-ink/75 leading-relaxed md:col-span-8">{row.body}</dd>
            </div>
          ))}
        </dl>
        <p className="eyebrow text-trace mt-6">{engagement.pricing}</p>
      </div>
    </div>
  </section>
);
