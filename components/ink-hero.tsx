"use client";

import { Canvas } from "@react-three/fiber";
import Lenis from "lenis";
import { useEffect, useState } from "react";

import { HeroContent } from "@/components/hero-content";
import { InkScene } from "@/components/ink-scene";
import { scrollState } from "@/lib/scroll-state";

// The ink3d hero: a fixed WebGL canvas behind the whole page. The approval
// graph draws itself in the hero; past the seam the camera-locked wire takes
// over as the volumetric trace spine, visible through the sheet's gutter slit.
export const InkHero = () => {
  const [isPlaying, setIsPlaying] = useState(true);

  useEffect(() => {
    document.documentElement.dataset["ink3d"] = "true";
    const lenis = new Lenis({ autoRaf: true });

    const handlePointer = (event: PointerEvent) => {
      scrollState.pointerX = (event.clientX / window.innerWidth) * 2 - 1;
      scrollState.pointerY = (event.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener("pointermove", handlePointer, { passive: true });

    return () => {
      delete document.documentElement.dataset["ink3d"];
      lenis.destroy();
      window.removeEventListener("pointermove", handlePointer);
      scrollState.paused = false;
    };
  }, []);

  useEffect(() => {
    scrollState.paused = !isPlaying;
  }, [isPlaying]);

  return (
    <header className="on-dark bg-ink-deep sticky top-0 z-0 h-svh">
      <div aria-hidden="true" className="fixed inset-0">
        <Canvas
          camera={{ fov: 40, position: [0, -0.1, 7.7] }}
          dpr={[1, 2]}
          gl={{ antialias: false, powerPreference: "high-performance" }}
        >
          <InkScene />
        </Canvas>
      </div>
      {/* Scroll-driven dim over the canvas as the sheet approaches. */}
      <div aria-hidden="true" data-hero-dim className="bg-ink-deep absolute inset-0 opacity-0" />
      <HeroContent
        isPlaying={isPlaying}
        onTogglePlayback={() => {
          setIsPlaying((current) => !current);
        }}
        pauseLabel="Pause background animation"
        playLabel="Play background animation"
      />
    </header>
  );
};
