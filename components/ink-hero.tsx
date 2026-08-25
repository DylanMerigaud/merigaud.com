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
  // Freeze the whole WebGL render loop when the page is not being looked at (tab
  // hidden OR window blurred). The bloom composer is the heaviest thing running,
  // and rAF already stops on a hidden tab, so the real saving is the blurred-but-
  // visible case (another window on top): no reason to keep painting it.
  const [frameloop, setFrameloop] = useState<"always" | "never">(() =>
    document.visibilityState === "visible" && document.hasFocus() ? "always" : "never"
  );

  useEffect(() => {
    const syncFrameloop = () => {
      const isActive = document.visibilityState === "visible" && document.hasFocus();
      setFrameloop(isActive ? "always" : "never");
    };
    window.addEventListener("focus", syncFrameloop);
    window.addEventListener("blur", syncFrameloop);
    document.addEventListener("visibilitychange", syncFrameloop);
    return () => {
      window.removeEventListener("focus", syncFrameloop);
      window.removeEventListener("blur", syncFrameloop);
      document.removeEventListener("visibilitychange", syncFrameloop);
    };
  }, []);

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
      {/* The wire is masked out of the left of the viewport, where the headline lives. At
          1440 the graph ran straight through the letters of "money." and "mess.", which read
          as a stray scribble over the one line the page exists to say rather than as a
          circuit behind it. The gradient starts fading at 62 percent and is fully opaque by
          72, which clears the longest h1 line and still keeps three of the five nodes.

          Safe to mask this container and nothing else: it holds ONLY the Canvas and the
          grain. The invoice, the receipt and the headline are siblings in InkRun below, and
          the trace spine further down the page is CSS (.spine-fill in globals.css), not this
          canvas, so nothing past the fold reads through here. */}
      <div
        aria-hidden="true"
        className="fixed inset-0 h-svh w-screen"
        style={{
          maskImage: "linear-gradient(to right, transparent 0 62%, black 72%)",
          WebkitMaskImage: "linear-gradient(to right, transparent 0 62%, black 72%)",
        }}
      >
        <Canvas
          frameloop={frameloop}
          camera={{ fov: 40, position: [0, -0.1, 7.7] }}
          // Cap DPR at 1.5: the bloom already blurs, so full retina detail is
          // wasted pixels through a multi-pass composer that runs the whole
          // session (the wire stays visible in the slit past the hero).
          dpr={[1, 1.5]}
          resize={{ scroll: false, debounce: { scroll: 0, resize: 0 } }}
          // AA is done by the composer (MSAA + SMAA); the context flag would
          // only allocate an extra unused multisampled buffer.
          gl={{ antialias: false, powerPreference: "high-performance" }}
        >
          <InkScene />
        </Canvas>
        {/* Static film grain (replaces the per-frame Noise pass): hides bloom
            banding in the dark gradients at ~zero runtime cost. */}
        <div className="ink-grain" />
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
