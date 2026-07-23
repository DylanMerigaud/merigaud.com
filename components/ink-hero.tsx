"use client";

import { Canvas } from "@react-three/fiber";
import Lenis from "lenis";
import { useEffect, useState } from "react";

import { InkRun } from "@/components/ink-run";
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

    // R3F measures the fixed canvas parent on mount; mid-hydration the layout
    // can settle a frame late, leaving the canvas under-sized until the next
    // resize (what toggling the browser sidebar was doing). Force a couple of
    // resize ticks so the canvas fills the viewport from the first paint.
    let isCancelled = false;
    let raf2 = 0;
    const forceResize = () => {
      if (isCancelled) return;
      window.dispatchEvent(new Event("resize"));
    };
    const raf1 = requestAnimationFrame(() => {
      forceResize();
      raf2 = requestAnimationFrame(forceResize);
    });
    const settle = window.setTimeout(forceResize, 250);
    void document.fonts.ready.then(forceResize, forceResize);

    return () => {
      isCancelled = true;
      delete document.documentElement.dataset["ink3d"];
      lenis.destroy();
      window.removeEventListener("pointermove", handlePointer);
      cancelAnimationFrame(raf1);
      cancelAnimationFrame(raf2);
      window.clearTimeout(settle);
      scrollState.paused = false;
    };
  }, []);

  useEffect(() => {
    scrollState.paused = !isPlaying;
  }, [isPlaying]);

  return (
    <header className="on-dark bg-ink-deep sticky top-0 z-0 h-svh">
      <div aria-hidden="true" className="fixed inset-0 h-svh w-screen">
        <Canvas
          camera={{ fov: 40, position: [0, -0.1, 7.7] }}
          dpr={[1, 2]}
          resize={{ scroll: false, debounce: { scroll: 0, resize: 0 } }}
          gl={{ antialias: true, powerPreference: "high-performance" }}
        >
          <InkScene />
        </Canvas>
      </div>
      {/* Scroll-driven dim over the canvas as the sheet approaches. */}
      <div aria-hidden="true" data-hero-dim className="bg-ink-deep absolute inset-0 opacity-0" />
      <InkRun
        isPlaying={isPlaying}
        onTogglePlayback={() => {
          setIsPlaying((current) => !current);
        }}
      />
    </header>
  );
};
