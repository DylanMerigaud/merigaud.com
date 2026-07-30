"use client";

import { POSTHOG_PROXY_PATH } from "@dylanmerigaud/microsaas-kit/analytics";
import { PostHogClient as KitPostHogClient } from "@dylanmerigaud/microsaas-kit/analytics/components";

import { isReplayAllowedPath, SITE_ID } from "@/lib/analytics";
import { env } from "@/lib/env";

/**
 * Thin "use client" wrapper around the kit's `PostHogClient`, mounted from app/layout.tsx (a
 * Server Component). This has to exist: `isReplayAllowedPath` is a plain function, and a Server
 * Component cannot pass a function prop to a Client Component (React can only serialize plain
 * data across that boundary; a `useEffect` inside a client-only file, by contrast, can reference
 * one freely). Declaring the config here, inside a file that is ITSELF a Client Component, means
 * `isReplayAllowedPath` never crosses the RSC boundary at all; layout.tsx only ever renders
 * `<PostHogClient />` with zero props.
 */
export const PostHogClient = () => (
  <KitPostHogClient
    posthogKey={env.NEXT_PUBLIC_POSTHOG_KEY}
    host={POSTHOG_PROXY_PATH}
    site={SITE_ID}
    isReplayAllowedPath={isReplayAllowedPath}
  />
);
