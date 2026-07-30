"use client";

import {
  getPostHogInstance,
  isConsentGated,
  POSTHOG_READY_EVENT,
  readConsentCookie,
  shouldShowConsentBanner,
} from "@dylanmerigaud/microsaas-kit/analytics";
import Link from "next/link";
import { useEffect, useState } from "react";

import { consentBanner } from "@/lib/copy";

/**
 * merigaud.com's own cookie-consent banner. The kit ships one
 * (`ConsentBanner`, "@dylanmerigaud/microsaas-kit/analytics/components"), but
 * its default markup statically imports the kit's shadcn `Button`, and this
 * site has no shadcn, no kit `ui`, and none of the CSS custom properties
 * those classes depend on. This composes the same decision from the kit's
 * exported primitives instead: `readConsentCookie` + `isConsentGated` decide
 * whether this visitor is even gated, `getPostHogInstance` +
 * `POSTHOG_READY_EVENT` reach the live PostHog instance without importing the
 * SDK a second time, and `shouldShowConsentBanner` makes the show decision.
 * Accept/Decline call posthog-js's own consent methods directly; PostHog
 * persists the explicit choice itself, so there is no consent-choice storage
 * of this component's own to add.
 *
 * Renders null, not a hidden element, for a non-gated visitor: the effect
 * below short-circuits before it ever touches PostHog.
 */
export const ConsentBanner = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const cw = readConsentCookie();
    if (!isConsentGated(cw)) return;

    // PostHog's own consent store decides this, not anything React renders,
    // so it runs imperatively: once now, and once more whenever
    // POSTHOG_READY_EVENT fires, since the SDK arrives from a lazy chunk and
    // is not necessarily loaded yet on this component's first render.
    const checkStatus = () => {
      const instance = getPostHogInstance();
      const status = instance ? instance.get_explicit_consent_status() : null;
      // eslint-disable-next-line @eslint-react/set-state-in-effect -- mirrors PostHog's own explicit-consent store (not derivable from props/render), and must apply synchronously the moment POSTHOG_READY_EVENT fires.
      setIsVisible(shouldShowConsentBanner(cw, status));
    };

    checkStatus();
    window.addEventListener(POSTHOG_READY_EVENT, checkStatus);
    return () => window.removeEventListener(POSTHOG_READY_EVENT, checkStatus);
  }, []);

  if (!isVisible) return null;

  const handleAccept = () => {
    getPostHogInstance()?.opt_in_capturing();
    setIsVisible(false);
  };

  const handleDecline = () => {
    getPostHogInstance()?.opt_out_capturing();
    setIsVisible(false);
  };

  return (
    <div
      role="region"
      aria-label="Cookie consent"
      className="bg-paper text-ink border-ink/15 fixed inset-x-0 bottom-0 z-50 border-t px-6 py-4"
    >
      <div className="mx-auto flex w-full max-w-3xl flex-col items-center gap-3 text-center sm:flex-row sm:justify-between sm:text-left">
        <p className="text-ink/80 text-sm text-pretty">
          {consentBanner.text}{" "}
          <Link href="/privacy" className="underline underline-offset-2 hover:no-underline">
            {consentBanner.privacyLabel}
          </Link>
        </p>
        <div className="flex shrink-0 gap-3">
          <button
            type="button"
            onClick={handleDecline}
            className="border-ink/30 text-ink hover:border-ink/70 inline-flex min-h-9 items-center rounded-md border px-4 text-sm font-medium transition-colors"
          >
            {consentBanner.decline}
          </button>
          <button
            type="button"
            onClick={handleAccept}
            className="bg-ink text-paper inline-flex min-h-9 items-center rounded-md px-4 text-sm font-medium transition-opacity hover:opacity-85"
          >
            {consentBanner.accept}
          </button>
        </div>
      </div>
    </div>
  );
};
