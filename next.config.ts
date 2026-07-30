import type { NextConfig } from "next";

// Baseline hardening: drop the X-Powered-By fingerprint and set the security
// headers a public site is judged on. Deliberately minimal.
const nextConfig: NextConfig = {
  poweredByHeader: false,
  /**
   * Works around a kit packaging defect (VERIFIED by build failure, not guessed; see
   * lib/dead-code-stub.ts): `@dylanmerigaud/microsaas-kit/analytics/components` co-bundles
   * `ConsentBanner` (needs class-variance-authority, radix-ui, and, via the kit's own `cn()`
   * helper, clsx + tailwind-merge) in the same barrel as `PostHogClient`/`TrackClicks`
   * (app/layout.tsx, which this site does need), so importing either of the latter two also
   * resolves `ConsentBanner`'s dependencies, even though this site imports neither
   * `ConsentBanner` nor shadcn. This is the pattern Next's own v16 upgrade guide documents for
   * exactly this shape of problem (a bundle transitively reaching code it cannot run): alias the
   * unreachable dependency to an empty module. All four are dead in every bundle, so all four
   * alias unconditionally.
   */
  turbopack: {
    resolveAlias: {
      "class-variance-authority": "./lib/dead-code-stub.ts",
      "radix-ui": "./lib/dead-code-stub.ts",
      clsx: "./lib/dead-code-stub.ts",
      "tailwind-merge": "./lib/dead-code-stub.ts",
    },
  },
  // PostHog's own endpoints end in a slash, and Next's built-in trailing-slash
  // redirect would bounce every event POST before it reaches the rewrite
  // below. This switch is site-wide, so proxy.ts re-applies the same redirect
  // for real pages; without that, every page would answer on two URLs and
  // split its own SEO.
  skipTrailingSlashRedirect: true,
  /**
   * `posthogRewrites`/`POSTHOG_PROXY_PATH` are loaded with a DYNAMIC import inside the function
   * body rather than a static top-level one: the kit ships ESM-only (no `require` condition in
   * its `exports` map), and Next's DEFAULT loader for `next.config.ts` transpiles it to
   * CommonJS before running it (`module: { type: "commonjs" }`, regardless of this project's own
   * `"type": "module"`), lowering even a dynamic `import()` back down to a `require()` call that
   * cannot see an ESM-only package's exports at all (VERIFIED: reproduced `ERR_PACKAGE_PATH_NOT_
   * EXPORTED` at the first `rewrites()` invocation with the default loader).
   *
   * The fix is `--experimental-next-config-strip-types` (package.json's dev/build/start
   * scripts): it switches `next.config.ts` to Node's own native TypeScript loader (Node 22.10+),
   * which runs this file through the REAL ESM graph, so the dynamic import below resolves
   * normally. `rewrites` already supports returning a Promise, so no other change is needed.
   */
  rewrites: async () => {
    const { POSTHOG_PROXY_PATH, posthogRewrites } =
      await import("@dylanmerigaud/microsaas-kit/analytics");
    return posthogRewrites(POSTHOG_PROXY_PATH);
  },
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
