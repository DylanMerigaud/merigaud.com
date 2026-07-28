import type { MetadataRoute } from "next";

import { articles } from "@/lib/articles";
import { site } from "@/lib/copy";
import { caseSlugs } from "@/lib/work-pages";

const sitemap = (): MetadataRoute.Sitemap => [
  {
    url: site.url,
    lastModified: new Date("2026-07-23"),
    changeFrequency: "monthly",
    priority: 1,
  },
  ...caseSlugs.map((slug) => ({
    url: `${site.url}/work/${slug}`,
    lastModified: new Date("2026-07-23"),
    changeFrequency: "monthly" as const,
    priority: 0.8,
  })),
  {
    url: `${site.url}/blog`,
    // The index dates itself from the newest note instead of from a constant
    // somebody has to remember to bump.
    lastModified: new Date(`${articles[0]?.publishedAt ?? "2026-07-28"}T00:00:00Z`),
    changeFrequency: "weekly",
    priority: 0.7,
  },
  ...articles.map((article) => ({
    url: `${site.url}/blog/${article.slug}`,
    lastModified: new Date(`${article.publishedAt}T00:00:00Z`),
    changeFrequency: "yearly" as const,
    priority: 0.6,
  })),
];

export default sitemap;
