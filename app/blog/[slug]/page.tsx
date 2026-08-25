import type { Metadata } from "next";

import Link from "next/link";
import { notFound } from "next/navigation";

import { ArticleBody } from "@/components/article-body";
import { articleSlugs, formatArticleDate, getArticle, notes, readingMinutes } from "@/lib/articles";
import { site } from "@/lib/copy";
import { serializeJsonLd } from "@/lib/structured-data";

export const generateStaticParams = () => articleSlugs.map((slug) => ({ slug }));

// Every note is a known slug at build time, so an unknown one is a 404 rather
// than an on-demand render of nothing.
// eslint-disable-next-line unicorn/consistent-boolean-name -- the name is Next.js route-segment API, not ours
export const dynamicParams = false;

type PageParams = { params: Promise<{ slug: string }> };

export const generateMetadata = async ({ params }: PageParams): Promise<Metadata> => {
  const { slug } = await params;
  const article = getArticle(slug);
  if (article === null) return {};
  return {
    title: article.metaTitle,
    description: article.metaDescription,
    // The canonical is the whole point of publishing here first: dev.to and
    // Medium copies point back to this URL, so this tag has to be exact.
    alternates: { canonical: `/blog/${slug}` },
    openGraph: {
      type: "article",
      url: `${site.url}/blog/${slug}`,
      siteName: site.name,
      title: article.metaTitle,
      description: article.metaDescription,
      publishedTime: article.publishedAt,
      authors: [site.url],
      tags: [...article.tags],
      images: [{ url: "/og.jpg", width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title: article.metaTitle,
      description: article.metaDescription,
      images: ["/og.jpg"],
    },
  };
};

const ArticlePage = async ({ params }: PageParams) => {
  const { slug } = await params;
  const article = getArticle(slug);
  if (article === null) notFound();

  const url = `${site.url}/blog/${slug}`;
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BlogPosting",
        headline: article.title,
        description: article.metaDescription,
        datePublished: article.publishedAt,
        dateModified: article.publishedAt,
        keywords: article.tags.join(", "),
        inLanguage: "en",
        mainEntityOfPage: { "@type": "WebPage", "@id": url },
        url,
        author: { "@type": "Person", name: site.name, url: site.url },
        publisher: { "@type": "Person", name: site.name, url: site.url },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: notes.heading, item: `${site.url}/blog` },
          { "@type": "ListItem", position: 2, name: article.title, item: url },
        ],
      },
    ],
  };

  return (
    <main id="main" className="sheet relative min-h-svh">
      <script
        type="application/ld+json"
        // eslint-disable-next-line @eslint-react/dom-no-dangerously-set-innerhtml -- JSON-LD must be an inline script; the payload is JSON.stringify of our own data with `<` escaped (serializeJsonLd), no user input involved.
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(jsonLd) }}
      />
      <div className="mx-auto max-w-6xl px-6 py-16 md:px-10 md:py-24">
        <nav aria-label="Breadcrumb" className="eyebrow text-trace">
          <Link
            href="/blog"
            className="quiet-link hover:text-ink underline-offset-4 transition-colors hover:underline"
          >
            {notes.eyebrow}
          </Link>{" "}
          / {formatArticleDate(article.publishedAt)}
        </nav>

        <article className="mt-6">
          <h1 className="max-w-[20ch] text-4xl font-semibold tracking-tight text-balance md:text-5xl">
            {article.title}
          </h1>
          <p className="text-ink/90 mt-5 max-w-[52ch] text-xl leading-snug font-medium">
            {article.lead}
          </p>

          <div className="border-ink/15 mt-8 flex flex-wrap items-center gap-x-5 gap-y-2 border-y py-3">
            <p className="eyebrow text-trace">
              <time dateTime={article.publishedAt}>{formatArticleDate(article.publishedAt)}</time>
            </p>
            <p className="eyebrow text-trace">{readingMinutes(article)} min read</p>
            <ul className="flex flex-wrap gap-x-4">
              {article.tags.map((tag) => (
                <li key={tag} className="eyebrow text-trace">
                  {tag}
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-10">
            <ArticleBody blocks={article.blocks} />
          </div>
        </article>

        <div
          data-ph-surface="article-end"
          className="border-ink/15 mt-16 flex flex-wrap items-center gap-6 border-t pt-10"
        >
          <a
            href={`mailto:${site.email}`}
            className="bg-ink text-paper inline-flex min-h-11 items-center rounded-md px-6 py-3 font-medium transition-opacity hover:opacity-85"
          >
            {site.email}
          </a>
          <Link
            href="/blog"
            className="link-arrow text-stamp decoration-stamp/40 hover:decoration-stamp font-medium underline underline-offset-4"
          >
            {notes.backLabel}
          </Link>
        </div>
      </div>
    </main>
  );
};

export default ArticlePage;
