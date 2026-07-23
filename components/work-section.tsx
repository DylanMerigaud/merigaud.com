import { SectionMarker } from "@/components/section-marker";
import { WorkFigure } from "@/components/work-figure";
import { work, workMore, workSection } from "@/lib/copy";

export const WorkSection = () => (
  <section id="work" aria-label="Selected work" className="pt-24 pb-24 md:pt-32 md:pb-32">
    <div className="relative mx-auto max-w-6xl px-6 md:px-10">
      <div className="pl-7 md:pl-10">
        <p className="eyebrow text-trace">{workSection.eyebrow}</p>
        <h2 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">
          {workSection.heading}
        </h2>
        <p className="text-ink/75 mt-4 max-w-xl leading-relaxed">{workSection.intro}</p>
      </div>
    </div>

    <div className="space-y-24 pt-20 md:space-y-32">
      {work.map((item) => (
        <article key={item.slug} className="relative mx-auto max-w-6xl px-6 md:px-10">
          <SectionMarker stage={item.stage} index={item.index} label={item.title} />
          <div className="pl-7 md:grid md:grid-cols-12 md:gap-10 md:pl-10">
            <div className="md:col-span-5">
              <h3 className="mt-4 text-2xl font-semibold tracking-tight">{item.title}</h3>
              <p className="text-ink/90 mt-3 text-lg leading-snug font-medium">{item.lead}</p>
              {item.body.map((paragraph) => (
                <p key={paragraph.slice(0, 24)} className="text-ink/75 mt-4 leading-relaxed">
                  {paragraph}
                </p>
              ))}
              <ul className="mt-6 flex flex-wrap gap-x-6 gap-y-2">
                {item.links.map((link) => (
                  <li key={link.href}>
                    <a
                      href={link.href}
                      className="link-arrow text-stamp decoration-stamp/40 hover:decoration-stamp font-medium underline underline-offset-4"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
              <ul aria-label="Stack" className="mt-5 flex flex-wrap gap-x-4 gap-y-1.5">
                {item.tags.map((tag) => (
                  <li key={tag} className="eyebrow text-trace">
                    {tag}
                  </li>
                ))}
              </ul>
            </div>
            <div className="mt-8 md:col-span-7 md:mt-4">
              <WorkFigure figure={item.figure} />
            </div>
          </div>
        </article>
      ))}
    </div>

    <div className="relative mx-auto max-w-6xl px-6 pt-16 md:px-10">
      <div className="border-ink/15 border-t pt-6 pl-7 md:pl-10">
        <p className="eyebrow text-trace">{workMore.label}</p>
        <p className="text-ink/75 mt-2 max-w-2xl leading-relaxed">
          {workMore.text}{" "}
          {workMore.links.map((link, index) => (
            <span key={link.href}>
              <a
                href={link.href}
                className="link-arrow text-stamp decoration-stamp/40 hover:decoration-stamp font-medium underline underline-offset-4"
              >
                {link.label}
              </a>
              {index < workMore.links.length - 1 ? " · " : ""}
            </span>
          ))}
        </p>
      </div>
    </div>
  </section>
);
