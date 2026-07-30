import {
  CONSENT_COOKIE_NAME,
  POSTHOG_PROXY_PATH,
  posthogTrailingSlashRedirect,
  resolveConsentGate,
} from "@dylanmerigaud/microsaas-kit/analytics";
import { geolocation } from "@vercel/functions";
import { type NextRequest, NextResponse } from "next/server";

/**
 * This site had no middleware before PostHog. It gains one now for exactly two reasons:
 * restoring the trailing-slash 308 that next.config.ts's `skipTrailingSlashRedirect` disabled
 * site-wide, and setting the geo consent cookie PostHogClient / the consent banner both read.
 *
 * `geolocation()` (@vercel/functions) reads Vercel's edge-network geo headers for free: no
 * external call, no added latency. Locally (`pnpm build && pnpm start`) the header is absent,
 * `country` comes back undefined, and `resolveConsentGate`'s fail-safe default (the kit's
 * consent-geo module) takes over, so a local visitor always sees the gated (EU) path rather than
 * silently testing the wrong branch.
 *
 * The cookie is non-httpOnly and readable by design: PostHog init and the consent banner both
 * read it synchronously via document.cookie, and neither may wait on a server round trip before
 * first paint.
 */
export const proxy = (request: NextRequest): NextResponse => {
  const { pathname, search } = request.nextUrl;
  const redirectTarget = posthogTrailingSlashRedirect(pathname, search);
  if (redirectTarget !== null) {
    return NextResponse.redirect(new URL(redirectTarget, request.url), 308);
  }

  const response = NextResponse.next();
  const { country } = geolocation(request);

  response.cookies.set(CONSENT_COOKIE_NAME, resolveConsentGate(country), {
    maxAge: 60 * 60 * 24 * 182,
    httpOnly: false,
    sameSite: "lax",
    // No NODE_ENV in this site's env.ts (a static portfolio has no other use for
    // it, and the kit's base schema that carries it also requires DATABASE_URL,
    // which this site does not have). The request's own protocol says the same
    // thing without it: local dev is http, every Vercel deployment (preview and
    // production alike) is https.
    secure: request.nextUrl.protocol === "https:",
    path: "/",
  });

  return response;
};

// Next requires config.matcher below to be a statically analysable array of literals, so
// POSTHOG_PROXY_PATH cannot be interpolated into the "hue" segment it excludes. This assertion is
// the next best thing: it fails loudly at import time if the literal and the constant ever
// drift apart, rather than going quietly dark (an event POST paying for a middleware invocation
// it should have skipped, or the reverse). Widened to `string` on purpose: left as the literal
// type TypeScript would otherwise infer, the comparison below would be provably always-true and
// the compiler would flag it as dead code, defeating the whole point of a runtime guard.
const PROXY_EXCLUDED_SEGMENT: string = "hue";
if (`/${PROXY_EXCLUDED_SEGMENT}` !== POSTHOG_PROXY_PATH) {
  throw new Error(
    `proxy.ts matcher excludes "${PROXY_EXCLUDED_SEGMENT}" but POSTHOG_PROXY_PATH is "${POSTHOG_PROXY_PATH}"`
  );
}

export const config = {
  matcher: [
    // Every path except: the PostHog reverse proxy (an event POST must not pay for a middleware
    // invocation), Next's static/image assets, and the metadata files, none of which render a
    // page or need the consent cookie.
    "/((?!hue|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};
