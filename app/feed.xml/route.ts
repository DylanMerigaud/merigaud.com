// The RSS 2.0 feed for the notes, at /feed.xml.
//
// It exists to be pointed at, not to be read: dev.to's RSS import pulls every
// new item in as a draft with the canonical URL already set, which is the whole
// point of publishing here first (see the PROVENANCE note at the top of
// lib/articles.ts). Syndication stops being a manual copy-paste the moment this
// URL answers.
//
// Two consequences of that consumer, both deliberate:
//   - `description` is the article's `lead`, never the body. dev.to builds the
//     imported draft's body from the description, so dumping the blocks here
//     would create a draft that has to be emptied by hand before it can be
//     written. A one-paragraph standfirst is a summary a human can expand.
//   - the route is a plain string template, not a feed library. The block union
//     in lib/articles.ts is not serialized here at all, so there is nothing for
//     a dependency to do that five lines of escaping do not.
//
// `force-static` prerenders the file at build time: the articles are compiled
// data, so nothing about this response can change between deploys, and the feed
// should not cost a function invocation per poll.
import { type Article, articles } from "@/lib/articles";
import { site } from "@/lib/copy";

export const dynamic = "force-static";

const FEED_PATH = "/feed.xml";
const FEED_TITLE = `Notes | ${site.name}`;
const FEED_DESCRIPTION =
  "Long-form writing on AI in fintech: AP automation, agents, evals, and the parts that survive real usage. Published here first, syndicated after.";

// The five XML predefined entities. Everything in a feed item comes from
// lib/articles.ts (typed data, no raw HTML allowed there either), but a title
// with an ampersand or an apostrophe in it must not be able to produce a
// document no parser will accept.
const escapeXml = (value: string): string =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");

// RFC 822 dates, which `toUTCString` already emits ("Tue, 28 Jul 2026 00:00:00
// GMT"). `publishedAt` is a bare date, so it is anchored at UTC midnight the
// same way app/sitemap.ts and formatArticleDate anchor it, and no reader ever
// sees a note dated a day early in its own timezone.
const rfc822 = (isoDate: string): string => new Date(`${isoDate}T00:00:00Z`).toUTCString();

const articleUrl = (article: Article): string => `${site.url}/blog/${article.slug}`;

const renderItem = (article: Article): string => {
  const url = articleUrl(article);
  return `    <item>
      <title>${escapeXml(article.title)}</title>
      <link>${escapeXml(url)}</link>
      <guid isPermaLink="true">${escapeXml(url)}</guid>
      <pubDate>${rfc822(article.publishedAt)}</pubDate>
      <description>${escapeXml(article.lead)}</description>
${article.tags.map((tag) => `      <category>${escapeXml(tag)}</category>`).join("\n")}
    </item>`;
};

export const GET = (): Response => {
  // `articles` is already hand-ordered newest first, but a feed that silently
  // depends on someone remembering that is a feed that goes wrong once.
  //
  // Sorting a spread copy rather than taking `unicorn/no-array-sort`'s advice:
  // `toSorted` is ES2023 and the shared tsconfig pins lib to ES2022, so the
  // suggested fix does not typecheck (VERIFIED: it resolves to an error type
  // and lights up eight no-unsafe-* errors instead of these one). Same reason
  // lib/articles.ts gives for hand-ordering the array in the first place. The
  // copy is what makes the sort safe: `articles` is readonly and shared.
  // eslint-disable-next-line unicorn/no-array-sort -- ES2023, lib is pinned to ES2022
  const sorted = [...articles].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));

  // Deliberately the newest note's date rather than `Date.now()`: the response
  // is prerendered, so a build clock would make the file churn on every deploy
  // while claiming a freshness nothing behind it actually gained.
  const lastBuild = sorted[0]?.publishedAt;

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(FEED_TITLE)}</title>
    <link>${escapeXml(`${site.url}/blog`)}</link>
    <description>${escapeXml(FEED_DESCRIPTION)}</description>
    <language>en</language>
    <lastBuildDate>${rfc822(lastBuild ?? "2026-07-28")}</lastBuildDate>
    <atom:link href="${escapeXml(`${site.url}${FEED_PATH}`)}" rel="self" type="application/rss+xml" />
${sorted.map((article) => renderItem(article)).join("\n")}
  </channel>
</rss>
`;

  return new Response(body, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      // Readers and dev.to's importer poll on their own schedule; an hour at
      // the edge with a day of stale-while-revalidate means a poll almost never
      // reaches the origin, and a new note is still picked up the same day.
      "Cache-Control": "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
};
