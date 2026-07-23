import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";

import { Analytics } from "@vercel/analytics/next";

import { fontMono, fontSans } from "@/app/fonts";
import { site } from "@/lib/copy";
import "@/app/globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: site.title,
  description: site.description,
  alternates: { canonical: "/" },
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
        width: 1200,
        height: 630,
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
  <html lang="en" className={`${fontSans.variable} ${fontMono.variable}`}>
    <body>
      <a
        href="#work"
        className="bg-paper text-ink sr-only z-50 rounded-md px-4 py-2 focus:not-sr-only focus:fixed focus:top-4 focus:left-4"
      >
        Skip to work
      </a>
      {children}
      <Analytics />
    </body>
  </html>
);

export default RootLayout;
