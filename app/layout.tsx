import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";

import { TrackClicks } from "@dylanmerigaud/microsaas-kit/analytics/components";
import { Analytics } from "@vercel/analytics/next";

import { fontMono, fontSans } from "@/app/fonts";
import { ConsentBanner } from "@/components/consent-banner";
import { PostHogClient } from "@/components/posthog-client";
import { ANALYTICS_CLICK_RULES } from "@/lib/analytics";
import { site } from "@/lib/copy";
import { PRE_INK_SCRIPT } from "@/lib/hero-mode";
import "@/app/globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: site.title,
  description: site.description,
  // The RSS autodiscovery link, so a reader (or dev.to's importer) handed the
  // bare domain finds /feed.xml without being told the path. Metadata merging
  // replaces `alternates` wholesale, so any page that sets its own canonical
  // has to repeat this; app/blog/page.tsx does.
  alternates: {
    canonical: "/",
    types: { "application/rss+xml": [{ url: "/feed.xml", title: `Notes | ${site.name}` }] },
  },
  openGraph: {
    type: "profile",
    url: site.url,
    siteName: site.name,
    locale: "en_US",
    title: site.ogTitle,
    description: site.description,
    images: [
      {
        url: "/og.jpg",
        // Shot at 2x the 1200x630 card so it stays crisp on retina timelines;
        // scripts/generate-og.ts is the source of both the file and these numbers.
        width: 2400,
        height: 1260,
        alt: "Dylan Mérigaud, freelance AI full-stack engineer for fintech. Code decides the money. AI reads the mess.",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: site.ogTitle,
    description: site.description,
    images: ["/og.jpg"],
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#0a0b0d",
};

const RootLayout = ({ children }: { children: ReactNode }) => (
  <html
    lang="en"
    // The pre-ink flash guard adds a class to <html> before hydration; suppress
    // the expected attribute diff on this one element (the next-themes pattern).
    suppressHydrationWarning
    className={`${fontSans.variable} ${fontMono.variable}`}
  >
    <body>
      {/* Runs before the hero paints: if the ink hero is coming (desktop + WebGL2
          + motion, matching HeroGate), mark the document so CSS keeps the headline
          hidden through the loading shell. It then rises in exactly once when the
          ink hero mounts, instead of flashing shell → hidden → in. No-JS and
          reduced-motion never get the class, so they show the headline immediately. */}
      <script
        // eslint-disable-next-line @eslint-react/dom-no-dangerously-set-innerhtml -- pre-paint flash guard; static, self-authored (lib/hero-mode)
        dangerouslySetInnerHTML={{ __html: PRE_INK_SCRIPT }}
      />
      {/* The skip link points at the page's own <main>, not at a section. It used to target
          #work, an id that exists on the home page alone (components/work-section.tsx), so on
          /blog, /privacy and every /work/<slug> the first thing a keyboard reader reached was a
          link to nowhere: the fragment matched no element and the browser did not move. #main is
          on the <main> of every route, which is the destination a skip link is for. The label
          follows the target rather than naming a section it no longer goes to. */}
      <a
        href="#main"
        className="bg-paper text-ink sr-only z-50 rounded-md px-4 py-2 focus:not-sr-only focus:fixed focus:top-4 focus:left-4"
      >
        Skip to content
      </a>
      {children}
      <Analytics />
      <PostHogClient />
      <TrackClicks rules={ANALYTICS_CLICK_RULES} />
      <ConsentBanner />
    </body>
  </html>
);

export default RootLayout;
