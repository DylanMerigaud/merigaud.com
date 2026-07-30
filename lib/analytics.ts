import type { ClickRule } from "@dylanmerigaud/microsaas-kit/analytics";

// Every site that reports analytics shares ONE PostHog project (the free plan
// allows a single one), so every insight has to filter on this. Named SITE_ID,
// not `site`: lib/copy.ts already exports a `site` object (url, title, links),
// and shadowing it here would be confusing.
export const SITE_ID = "merigaud";

/**
 * Which routes session replay may record. Only the long reads qualify: `/blog`
 * and `/work` and their subpaths. The landing page is deliberately NOT
 * recordable (it is a WebGL hero; a replay of it says nothing), and every
 * other route is denied by omission.
 *
 * This site renders no forms, holds no auth, and collects no PII, which is
 * what makes replay defensible here at all.
 *
 * `pathname` normally arrives from `usePathname()`, which already carries no
 * query or hash, but the query/hash is stripped defensively anyway since
 * nothing about this function's signature guarantees that.
 */
export const isReplayAllowedPath = (pathname: string): boolean => {
  const path = pathname.split(/[?#]/, 1)[0] ?? pathname;
  return (
    path === "/blog" || path.startsWith("/blog/") || path === "/work" || path.startsWith("/work/")
  );
};

/**
 * Ordered most to least specific; the first match wins (see
 * `resolveClickEvent` in the kit). Internal navigation is deliberately
 * unmatched: `$pageview` and autocapture already cover it, and a named event
 * here would double-count it.
 *
 * The three demo hosts share one `demo_click` event and differ only by their
 * `project` property, so "which demo pulls" is answerable from one PostHog
 * insight instead of three.
 */
export const ANALYTICS_CLICK_RULES: readonly ClickRule[] = [
  { event: "email_click", protocol: "mailto:" },
  { event: "call_click", hosts: ["calendly.com"] },
  {
    event: "demo_click",
    hosts: ["ledgerloop.merigaud.com"],
    properties: { project: "ledgerloop" },
  },
  {
    event: "demo_click",
    hosts: ["invoice-parser.merigaud.com"],
    properties: { project: "invoice-parser" },
  },
  {
    event: "demo_click",
    hosts: ["approvals-ui.vercel.app"],
    properties: { project: "approvals-ui" },
  },
  { event: "repo_click", hosts: ["github.com"], properties: { target: "github" } },
  { event: "repo_click", hosts: ["npmjs.com"], properties: { target: "npm" } },
];
