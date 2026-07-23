import type { MetadataRoute } from "next";

const sitemap = (): MetadataRoute.Sitemap => [
  {
    url: "https://merigaud.com",
    lastModified: new Date("2026-07-23"),
    changeFrequency: "monthly",
    priority: 1,
  },
];

export default sitemap;
