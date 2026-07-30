import type { NextConfig } from "next";

/**
 * PostHog reverse-proxy config, DUPLICATED here as local literals rather than imported from
 * `@dylanmerigaud/microsaas-kit/analytics`'s `posthogRewrites(POSTHOG_PROXY_PATH)`, which is the
 * source of truth these three rules must keep matching. `next.config.ts` is the one place in
 * this site that structurally cannot reach the kit: the kit ships ESM-only (no `require`
 * condition in its `exports` map), and Next's loader for `next.config.ts` transpiles it to
 * CommonJS before running it (`module: { type: "commonjs" }`, regardless of this project's own
 * `"type": "module"`), which downlevels even a dynamic `import()` back into a `require()` call
 * (VERIFIED: reproduced `ERR_PACKAGE_PATH_NOT_EXPORTED` from a dynamic import too, at the first
 * `rewrites()` invocation rather than at config-load time). There is no supported way to make an
 * ESM-only package resolve inside this specific file; every OTHER file that imports the kit's
 * `/analytics` subpath (`proxy.ts`, `components/posthog-client.tsx`, `lib/analytics.ts`,
 * `instrumentation.ts`) is bundled by Next's real build pipeline instead of this special-cased
 * config loader, and does so with no issue.
 */
const POSTHOG_PROXY_PATH = "/hue";
const POSTHOG_INGESTION_HOST = "https://us.i.posthog.com";
const POSTHOG_ASSET_HOST = "https://us-assets.i.posthog.com";

// Baseline hardening: drop the X-Powered-By fingerprint and set the security
// headers a public site is judged on. Deliberately minimal.
const nextConfig: NextConfig = {
  poweredByHeader: false,
  // PostHog's own endpoints end in a slash, and Next's built-in trailing-slash
  // redirect would bounce every event POST before it reaches the rewrite
  // below. This switch is site-wide, so proxy.ts re-applies the same redirect
  // for real pages; without that, every page would answer on two URLs and
  // split its own SEO.
  skipTrailingSlashRedirect: true,
  // Mirrors the kit's own `posthogRewrites(POSTHOG_PROXY_PATH)`: `/static` and `/array` come from
  // the asset host, the catch-all takes everything else (events, flags, replay chunks) and MUST
  // stay last, since it would otherwise swallow the two specific rules above it.
  rewrites: () => [
    {
      source: `${POSTHOG_PROXY_PATH}/static/:path*`,
      destination: `${POSTHOG_ASSET_HOST}/static/:path*`,
    },
    {
      source: `${POSTHOG_PROXY_PATH}/array/:path*`,
      destination: `${POSTHOG_ASSET_HOST}/array/:path*`,
    },
    { source: `${POSTHOG_PROXY_PATH}/:path*`, destination: `${POSTHOG_INGESTION_HOST}/:path*` },
  ],
  redirects: () => [
    // Canonical host is dylan.merigaud.com; the apex and www redirect to it.
    {
      source: "/:path*",
      has: [{ type: "host", value: "merigaud.com" }],
      destination: "https://dylan.merigaud.com/:path*",
      permanent: true,
    },
    {
      source: "/:path*",
      has: [{ type: "host", value: "www.merigaud.com" }],
      destination: "https://dylan.merigaud.com/:path*",
      permanent: true,
    },
  ],
  headers: () => [
    {
      source: "/:path*",
      headers: [
        { key: "X-Content-Type-Options", value: "nosniff" },
        { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
      ],
    },
  ],
};

export default nextConfig;
