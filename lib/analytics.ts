import { type ClickRule, createReplayScope } from "@dylanmerigaud/microsaas-kit/analytics";

// Every site that reports analytics shares ONE PostHog project (the free plan
// allows a single one), so every insight has to filter on this. Named SITE_ID,
// not `site`: lib/copy.ts already exports a `site` object (url, title, links),
// and shadowing it here would be confusing.
export const SITE_ID = "merigaud";

/**
 * Which routes session replay may record. Only the long reads qualify: `/blog`
 * and `/work` and their subpaths. The landing page is deliberately NOT
 * recordable (`allowRoot: false`; it is a WebGL hero, a replay of it says
 * nothing), and every other route is denied by omission.
 *
 * This site renders no forms, holds no auth, and collects no PII, which is
 * what makes replay defensible here at all.
 *
 * The matcher body (strip query/hash, then root-or-prefix match) moved to
 * @dylanmerigaud/microsaas-kit/analytics (kit 0.4.0, `createReplayScope`);
 * only the prefix list and the `allowRoot: false` override stay local.
 */
export const isReplayAllowedPath = createReplayScope(["/blog", "/work"], { allowRoot: false });

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
