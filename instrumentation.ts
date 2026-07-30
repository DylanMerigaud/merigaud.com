import type { Instrumentation } from "next";

import { SITE_ID } from "@/lib/analytics";
import { env } from "@/lib/env";

/**
 * Next's server-error hook: it fires for EVERY error the server catches, across page renders,
 * route handlers, and server actions. One function here replaces try/catch reporting scattered
 * across the app.
 *
 * The nodejs guard exists because `createServerAnalytics` (below) pulls in posthog-node, a Node
 * library that must not enter the edge bundle; the DYNAMIC import is what actually keeps it out,
 * since a static import at the top of this file would load before the guard could skip it, and
 * out of every request that never throws, since the import only runs on this line.
 *
 * `warn` is a no-op: this site has no logger, and a failure to report an error must never become
 * a second error on a request that is already failing.
 */
export const onRequestError: Instrumentation.onRequestError = async (error, request, context) => {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;

  const { createServerAnalytics } = await import("@dylanmerigaud/microsaas-kit/analytics/server");
  const { captureServerException } = createServerAnalytics({
    posthogKey: env.NEXT_PUBLIC_POSTHOG_KEY,
    site: SITE_ID,
    warn: () => {},
  });

  await captureServerException(error, {
    path: request.path,
    method: request.method,
    routePath: context.routePath,
    routeType: context.routeType,
  });
};
