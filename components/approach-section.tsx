import { SectionMarker } from "@/components/section-marker";
import { approach } from "@/lib/copy";

export const ApproachSection = () => (
  <section aria-label="Approach" className="py-24 md:py-32">
    <div className="relative mx-auto max-w-6xl px-6 md:px-10">
      <SectionMarker stage={approach.stage} index={approach.index} label={approach.eyebrow} />
      <h2 className="sr-only">{approach.heading}</h2>
      <div className="pl-7 md:pl-10">
        <p className="pull-statement mt-10">
          {approach.pullBefore} <span className="pull-never">{approach.pullNever}</span>{" "}
          {approach.pullAfter}
        </p>
        <p className="text-ink/75 mt-8 max-w-2xl leading-relaxed">{approach.text}</p>
        <ul aria-label="Stack" className="mt-8 flex max-w-2xl flex-wrap gap-x-5 gap-y-2">
          {approach.stack.map((item) => (
            <li key={item} className="eyebrow text-trace">
              {item}
            </li>
          ))}
        </ul>
      </div>
    </div>
  </section>
);
