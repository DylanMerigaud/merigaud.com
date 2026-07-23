import type { MetadataRoute } from "next";

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
];

export default sitemap;
