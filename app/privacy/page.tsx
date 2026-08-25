import type { Metadata } from "next";

import Link from "next/link";

import { privacy, site } from "@/lib/copy";

export const metadata: Metadata = {
  title: `${privacy.heading} | ${site.name}`,
  description: privacy.intro,
  alternates: { canonical: "/privacy" },
  openGraph: {
    type: "website",
    url: `${site.url}/privacy`,
    siteName: site.name,
    title: `${privacy.heading} | ${site.name}`,
    description: privacy.intro,
    images: [{ url: "/og.jpg", width: 1200, height: 630 }],
  },
};

export default function PrivacyPage() {
  return (
    <main id="main" className="sheet relative min-h-svh">
      <div className="mx-auto max-w-6xl px-6 py-16 md:px-10 md:py-24">
        <nav aria-label="Breadcrumb" className="eyebrow text-trace">
          <Link
            href="/"
            className="quiet-link hover:text-ink underline-offset-4 transition-colors hover:underline"
          >
            {site.name}
          </Link>{" "}
          / {privacy.eyebrow}
        </nav>

        <h1 className="mt-6 text-4xl font-semibold tracking-tight md:text-6xl">
          {privacy.heading}
        </h1>
        <p className="text-ink/90 mt-4 max-w-2xl text-xl leading-snug font-medium">
          {privacy.intro}
        </p>
        <p className="eyebrow text-trace mt-6">
          <time dateTime={privacy.updatedAt}>
            {privacy.updatedLabel} {privacy.updated}
          </time>
        </p>

        <div className="border-ink/15 mt-12 max-w-[62ch] space-y-12 border-t pt-12">
          {privacy.sections.map((section) => (
            <section key={section.heading}>
              <h2 className="text-2xl font-semibold tracking-tight">{section.heading}</h2>
              {section.paragraphs.map((paragraph, index) => (
                <p
                  key={`${section.heading}-${String(index)}`}
                  className="text-ink/75 mt-4 leading-relaxed"
                >
                  {paragraph}
                </p>
              ))}
            </section>
          ))}
        </div>

        <div
          data-ph-surface="privacy-end"
          className="border-ink/15 mt-16 flex flex-wrap items-center gap-6 border-t pt-10"
        >
          <a
            href={`mailto:${site.email}`}
            className="bg-ink text-paper inline-flex min-h-11 items-center rounded-md px-6 py-3 font-medium transition-opacity hover:opacity-85"
          >
            {site.email}
          </a>
          <Link
            href="/"
            className="quiet-link link-arrow text-stamp decoration-stamp/40 hover:decoration-stamp font-medium underline underline-offset-4"
          >
            {privacy.backCta}
          </Link>
        </div>
      </div>
    </main>
  );
}
