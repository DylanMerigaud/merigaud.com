import Link from "next/link";

import { SectionMarker } from "@/components/section-marker";
import { articles, formatArticleDate, notes, readingMinutes } from "@/lib/articles";

// The public record, placed right after the policy section on purpose: the
// reader has just been told how I build, this is the evidence I argue it in the
// open. It sits before the commercial ask so nothing gets pushed past the CTA.
//
// `articles` is hand-ordered newest-first (see lib/articles.ts), so the top
// three are already an editorial choice made in the data file. Nothing sorts or
// filters here; to change what shows up, reorder the array.
const latest = articles.slice(0, 3);

export const NotesSection = () =>
  latest.length === 0 ? null : (
    <section aria-label="Notes" className="py-24 md:py-32">
      <div className="relative mx-auto max-w-6xl px-6 md:px-10">
        <SectionMarker stage={notes.stage} index={notes.index} label={notes.sectionLabel} />
        <div className="pl-7 md:pl-10">
          <h2 className="mt-8 text-3xl font-semibold tracking-tight md:text-4xl">
            {notes.heading}
          </h2>
          <p className="text-ink/75 mt-4 max-w-xl leading-relaxed">{notes.intro}</p>
          <ul className="border-ink/15 mt-10 max-w-4xl border-t">
            {latest.map((article) => (
              <li key={article.slug} className="border-ink/15 border-b">
                {/* Same contract as the notes index: the whole row is the target,
                  because a long title is a bad place to ask for a short click.
                  The lead stays on /blog, the reason to go there. */}
                <Link href={`/blog/${article.slug}`} className="group block py-6">
                  <p className="eyebrow text-trace flex flex-wrap gap-x-4">
                    <time dateTime={article.publishedAt}>
                      {formatArticleDate(article.publishedAt)}
                    </time>
                    <span>{readingMinutes(article)} min read</span>
                  </p>
                  <h3 className="group-hover:text-stamp mt-2 max-w-[46ch] text-xl font-semibold tracking-tight transition-colors md:text-2xl">
                    {article.title}
                  </h3>
                </Link>
              </li>
            ))}
          </ul>
          <p className="mt-6">
            <Link
              href="/blog"
              className="quiet-link link-arrow text-stamp decoration-stamp/40 hover:decoration-stamp font-medium underline underline-offset-4"
            >
              {notes.backLabel}
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
