import { SectionMarker } from "@/components/section-marker";
import { Stamp } from "@/components/stamp";
import { contact, footer, site } from "@/lib/copy";

export const ContactSection = () => (
  <section aria-label="Contact" className="pb-16">
    <div className="relative mx-auto max-w-6xl px-6 md:px-10">
      <SectionMarker stage={contact.stage} index={contact.index} label={contact.eyebrow} />
      <div className="pl-7 md:grid md:grid-cols-12 md:gap-10 md:pl-10">
        <div className="md:col-span-8">
          <h2 className="mt-8 max-w-3xl text-4xl font-semibold tracking-tight text-balance md:text-5xl">
            {contact.heading}
          </h2>
          <div className="mt-10 flex flex-wrap items-center gap-4">
            <a
              href={`mailto:${site.email}`}
              className="bg-ink text-paper inline-flex min-h-12 items-center rounded-md px-7 py-3.5 text-lg font-medium transition-opacity hover:opacity-85"
            >
              {contact.ctaEmailLabel}
            </a>
            <a
              href={site.links.calendly}
              className="border-ink/30 text-ink hover:border-ink/70 inline-flex min-h-12 items-center rounded-md border px-7 py-3.5 text-lg font-medium transition-colors"
            >
              {contact.ctaCallLabel}
            </a>
          </div>
          <p className="text-ink/70 mt-8 max-w-xl leading-relaxed">{contact.location}</p>
        </div>
        <div className="mt-12 md:col-span-4 md:mt-6">
          <Stamp />
          <p className="stamp-note eyebrow text-trace mt-4">{contact.stampNote}</p>
        </div>
      </div>

      <footer className="border-ink/15 mt-24 border-t py-8 md:flex md:items-center md:justify-between">
        <ul className="flex flex-wrap gap-x-6 gap-y-2">
          {footer.links.map((link) => (
            <li key={link.href}>
              <a href={link.href} className="eyebrow text-trace hover:text-ink transition-colors">
                {link.label}
              </a>
            </li>
          ))}
        </ul>
        <p className="eyebrow text-trace mt-6 md:mt-0">{footer.note}</p>
      </footer>
    </div>
  </section>
);
