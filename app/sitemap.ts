import type { MetadataRoute } from "next";

const sitemap = (): MetadataRoute.Sitemap => [
  {
    url: "https://dylan.merigaud.com",
    lastModified: new Date("2026-07-23"),
    changeFrequency: "monthly",
    priority: 1,
  },
  ...["ledgerloop", "approvals-ui", "fintech-roast"].map((slug) => ({
    url: `https://dylan.merigaud.com/work/${slug}`,
    lastModified: new Date("2026-07-23"),
    changeFrequency: "monthly" as const,
    priority: 0.8,
  })),
];

export default sitemap;
