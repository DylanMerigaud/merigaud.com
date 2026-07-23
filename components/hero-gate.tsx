"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

import { Hero } from "@/components/hero";
import { HeroContent } from "@/components/hero-content";

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

const hasWebgl = (): boolean => {
  try {
    const canvas = document.createElement("canvas");
    return canvas.getContext("webgl2") !== null;
  } catch {
    return false;
  }
};

// Decides the hero once, on the client: desktop + WebGL2 + motion-ok gets the
// ink3d experience; everyone else gets the video hero. Until decided, the dark
// shell shows (SSR default), so no poster image ever flashes.
export const HeroGate = () => {
  const [mode, setMode] = useState<"shell" | "video" | "ink">("shell");

  useEffect(() => {
    const decide = () => {
      const isWantsMotion = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const isDesktop = window.matchMedia("(min-width: 768px)").matches;
      const connection: unknown = Reflect.get(navigator, "connection");
      const isSavesData =
        typeof connection === "object" &&
        connection !== null &&
        "saveData" in connection &&
        connection.saveData === true;
      if (isWantsMotion && isDesktop && !isSavesData && hasWebgl()) {
        // Warm the chunk so the shell-to-ink handoff is a single frame.
        void import("@/components/ink-hero");
        setMode("ink");
      } else {
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
