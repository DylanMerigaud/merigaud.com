import type { Metadata } from "next";

import { OgPoster } from "@/components/og-poster";

// The source of public/og.jpg, served as a route so the card is rendered by the
// same engine as the site (real Mona Sans, real ink shader, real bloom) instead
// of redrawn in a design tool every time the headline changes. Regenerate with
// `pnpm og:generate`; see scripts/generate-og.ts.
export const metadata: Metadata = {
  title: "og poster",
  robots: { index: false, follow: false },
};

// The screenshot viewport is exactly the poster; the centering here is only for
// a human opening the route to look at it.
export default function OgPage() {
  return (
    <main id="main" className="bg-ink-deep flex min-h-svh items-center justify-center">
      <OgPoster />
    </main>
  );
}
