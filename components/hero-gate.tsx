"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

import { Hero } from "@/components/hero";

const InkHero = dynamic(
  async () => {
    const mod = await import("@/components/ink-hero");
    return mod.InkHero;
  },
  {
    ssr: false,
    loading: () => <Hero />,
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
// ink3d experience; everyone else keeps the video hero (SSR default).
export const HeroGate = () => {
  const [mode, setMode] = useState<"video" | "ink">("video");

  useEffect(() => {
    // Deferred one tick: the upgrade must not set state synchronously in the
    // effect, and the video hero is a correct first paint anyway.
    const timer = window.setTimeout(() => {
      const isWantsMotion = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const isDesktop = window.matchMedia("(min-width: 768px)").matches;
      const connection: unknown = Reflect.get(navigator, "connection");
      const isSavesData =
        typeof connection === "object" &&
        connection !== null &&
        "saveData" in connection &&
        connection.saveData === true;
      if (isWantsMotion && isDesktop && !isSavesData && hasWebgl()) {
        setMode("ink");
      }
    }, 0);
    return () => {
      window.clearTimeout(timer);
    };
  }, []);

  return mode === "ink" ? <InkHero /> : <Hero />;
};
