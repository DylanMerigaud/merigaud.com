"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

import { Hero } from "@/components/hero";
import { HeroContent } from "@/components/hero-content";
import { shouldRunInkHero } from "@/lib/hero-mode";

// A dark, media-free hero shell. It is the SSR/no-JS baseline (real headline and
// CTAs for SEO) and the loading state while the ink3d chunk arrives, so the page
// never flashes a poster image before the WebGL scene or the video takes over.
const HeroShell = () => (
  <header className="on-dark bg-ink-deep sticky top-0 z-0 h-svh overflow-hidden">
    <HeroContent showControls={false} />
  </header>
);

const InkHero = dynamic(
  async () => {
    const mod = await import("@/components/ink-hero");
    return mod.InkHero;
  },
  {
    ssr: false,
    loading: () => <HeroShell />,
  }
);

// Decides the hero once, on the client: desktop + WebGL2 + motion-ok gets the
// ink3d experience; everyone else gets the video hero. The decision lives in
// lib/hero-mode (shouldRunInkHero), shared with the pre-paint flash guard so they
// cannot drift. Until decided, the dark shell shows (SSR default), so no poster
// image ever flashes.
export const HeroGate = () => {
  const [mode, setMode] = useState<"shell" | "video" | "ink">("shell");

  useEffect(() => {
    const decide = () => {
      if (shouldRunInkHero()) {
        // Warm the chunk so the shell-to-ink handoff is a single frame.
        void import("@/components/ink-hero");
        setMode("ink");
      } else {
        // Not taking the ink path after all (e.g. the pre-paint guess raced a
        // resize): release the headline so it never stays hidden.
        document.documentElement.classList.remove("pre-ink");
        setMode("video");
      }
    };
    const timer = window.setTimeout(decide, 0);
    return () => {
      window.clearTimeout(timer);
    };
  }, []);

  if (mode === "ink") return <InkHero />;
  if (mode === "video") return <Hero />;
  return <HeroShell />;
};
