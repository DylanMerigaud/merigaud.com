import type { MetadataRoute } from "next";

import { headers } from "next/headers";

import { site } from "@/lib/copy";

/**
 * /robots.txt. On the canonical production host (the `site.url` host, dylan.merigaud.com): crawl
 * everything and point at the sitemap. On any OTHER host, serve a blanket `disallow: "/"`.
 *
 * That host check is the machinery, and this file had lost it. Vercel serves the same deployment on
 * several hosts, and they are NOT all protected: the per-deployment `*-<hash>-<team>.vercel.app`
 * URLs sit behind Vercel SSO and answer 302, but the project alias `merigaud-com.vercel.app` is
 * wide open and answered HTTP 200 with `Allow: /` (measured 2026-08-14). That is this whole site
 * served as a crawlable duplicate of dylan.merigaud.com, free to split link equity and to surface a
 * vercel.app URL in the SERP.
 *
 * The `redirects()` in next.config.ts do NOT cover this. They bounce the apex and www to the
 * canonical host by matching those two hostnames by name, so every vercel.app alias sails past
 * them. Matching a host by name cannot catch a host you did not name, which is why the rule here is
 * inverted: anything that is not the canonical host is refused, without enumerating it.
 *
 * Reading the request host makes this route dynamic, which is free for robots.txt. `host === null`
 * is treated as canonical on purpose: it only happens off the request path (a build time or test
 * render), where refusing to allow crawling would be the wrong default.
 */
const robots = async (): Promise<MetadataRoute.Robots> => {
  const requestHeaders = await headers();
  const host = requestHeaders.get("host");
  const canonicalHost = new URL(site.url).host;
  const isCanonicalHost = host === null || host === canonicalHost;

  if (!isCanonicalHost) {
    return {
      rules: { userAgent: "*", disallow: "/" },
      sitemap: `${site.url}/sitemap.xml`,
    };
  }

  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: `${site.url}/sitemap.xml`,
  };
};

export default robots;
