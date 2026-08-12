import type { Metadata } from "next";

import Link from "next/link";

import { articles, formatArticleDate, notes, readingMinutes } from "@/lib/articles";
import { site } from "@/lib/copy";

export const metadata: Metadata = {
  title: `${notes.heading} | ${site.name}`,
  description: notes.intro,
  alternates: {
    canonical: "/blog",
    types: {
      "application/rss+xml": [{ url: "/feed.xml", title: `${notes.heading} | ${site.name}` }],
    },
  },
  openGraph: {
    type: "website",
    url: `${site.url}/blog`,
    siteName: site.name,
    title: `${notes.heading} | ${site.name}`,
    description: notes.intro,
    images: [{ url: "/og.jpg", width: 1200, height: 630 }],
  },
};

export default function NotesIndexPage() {
  return (
    <main className="sheet relative min-h-svh">
      <div className="mx-auto max-w-6xl px-6 py-16 md:px-10 md:py-24">
        <nav aria-label="Breadcrumb" className="eyebrow text-trace">
          <Link
            href="/"
            className="hover:text-ink underline-offset-4 transition-colors hover:underline"
          >
            {site.name}
          </Link>{" "}
          / {notes.eyebrow}
        </nav>

        <h1 className="mt-6 text-4xl font-semibold tracking-tight md:text-6xl">{notes.heading}</h1>
        <p className="text-ink/90 mt-4 max-w-2xl text-xl leading-snug font-medium">{notes.intro}</p>

        {articles.length === 0 ? (
          <p className="text-ink/70 mt-16">{notes.empty}</p>
        ) : (
          <ul className="border-ink/15 mt-14 border-t">
            {articles.map((article) => (
              <li key={article.slug} className="border-ink/15 border-b">
                {/* The whole row is the target: a list of long titles is a bad place
                  to ask someone to hit a short link. */}
                <Link href={`/blog/${article.slug}`} className="group block py-8">
                  <p className="eyebrow text-trace flex flex-wrap gap-x-4">
                    <time dateTime={article.publishedAt}>
                      {formatArticleDate(article.publishedAt)}
                    </time>
                    <span>{readingMinutes(article)} min read</span>
                  </p>
                  <h2 className="group-hover:text-stamp mt-3 max-w-[24ch] text-2xl font-semibold tracking-tight transition-colors md:text-3xl">
                    {article.title}
                  </h2>
                  <p className="text-ink/75 mt-3 max-w-[62ch] leading-relaxed">{article.lead}</p>
                  <ul aria-label="Tags" className="mt-4 flex flex-wrap gap-x-4 gap-y-1.5">
                    {article.tags.map((tag) => (
                      <li key={tag} className="eyebrow text-trace">
                        {tag}
                      </li>
                    ))}
                  </ul>
                </Link>
              </li>
            ))}
          </ul>
        )}

        <div
          data-ph-surface="blog-index"
          className="border-ink/15 mt-16 flex flex-wrap items-center gap-6 border-t pt-10"
        >
          <a
            href={`mailto:${site.email}`}
            className="bg-ink text-paper inline-flex min-h-11 items-center rounded-md px-6 py-3 font-medium transition-opacity hover:opacity-85"
          >
            {site.email}
          </a>
          <Link
            href="/#work"
            className="link-arrow text-stamp decoration-stamp/40 hover:decoration-stamp font-medium underline underline-offset-4"
          >
            Back to the trace
          </Link>
        </div>
      </div>
    </main>
  );
}
