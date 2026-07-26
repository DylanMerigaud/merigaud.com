"use client";

import { Canvas } from "@react-three/fiber";
import { useEffect } from "react";

import { InkScene } from "@/components/ink-scene";
import { hero, runReceipt, site } from "@/lib/copy";
import { OG_HEIGHT, OG_PULSE, OG_WIDTH } from "@/lib/og";
import { scrollState } from "@/lib/scroll-state";

// The social card, rendered as a real page instead of drawn by hand: the same
// WebGL approval graph, fonts and colours as the hero, recomposed for a 1200x630
// crop. scripts/generate-og.ts screenshots this route into public/og.jpg.
//
// Everything the scene reads from scrollState is pinned below, so two runs a
// month apart produce the same pixels.
export const OgPoster = () => {
  useEffect(() => {
    // paused kills the pointer drift and the ambient pulse clock; runSweep >= 0
    // overrides the pulse outright. Nothing in the scene moves after settle.
    scrollState.paused = true;
    scrollState.runSweep = OG_PULSE;
    return () => {
      scrollState.paused = false;
      scrollState.runSweep = -1;
    };
  }, []);

  return (
    <div
      data-og-poster
      className="on-dark bg-ink-deep relative overflow-hidden"
      style={{ width: OG_WIDTH, height: OG_HEIGHT }}
    >
      {/* The scene's camera rest pose is fixed by CameraRig, so the graph is
          slid into the card's optical centre by moving the canvas instead: down
          into the space the three headline lines leave, and right until the
          wire's intake tail stops touching "money.". What slides out of frame is
          the same flat #0a0b0d as the page. */}
      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{ transform: "translate(24px, 30px)" }}
      >
        <Canvas
          frameloop="always"
          camera={{ fov: 40, position: [0, -0.1, 7.7] }}
          // Fixed DPR: the screenshot's own scale factor supplies the retina
          // pixels, and the hero's [1, 1.5] range would make the render
          // resolution depend on the machine taking the shot.
          dpr={1.5}
          resize={{ scroll: false, debounce: { scroll: 0, resize: 0 } }}
          gl={{ antialias: false, powerPreference: "high-performance" }}
        >
          <InkScene />
        </Canvas>
        <div className="ink-grain" />
      </div>

      {/* Reading scrim. The hero can let a bright wire cross its headline at full
          size; a card thumbnailed to 300px cannot. Light enough that the nodes it
          passes over keep their glow, dark enough to hold the type. */}
      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(100deg, rgb(10 11 13 / 0.94) 0%, rgb(10 11 13 / 0.9) 33%, rgb(10 11 13 / 0.34) 48%, rgb(10 11 13 / 0) 62%)",
        }}
      />

      <div className="relative flex h-full flex-col" style={{ padding: "50px 64px 46px" }}>
        <p className="eyebrow text-trace-dark" style={{ fontSize: 15, letterSpacing: "0.1em" }}>
          {hero.eyebrow}
        </p>

        <h1
          className="h1-display text-paper"
          style={{ marginTop: "auto", marginBottom: "auto", fontSize: 104 }}
        >
          {/* The hero's signature break: the wide line splits in two and the
              narrow one runs long underneath. At this size the wide voice would
              otherwise fit "Code decides the" on one line, so the measure is
              capped just under it and text-wrap: balance evens the halves. */}
          <span className="h1-wide block" style={{ maxWidth: 800 }}>
            {hero.h1Line1}
          </span>
          <span className="h1-narrow block">{hero.h1Line2}</span>
        </h1>

        <div className="flex items-end justify-between">
          <p className="text-paper" style={{ fontSize: 21, fontWeight: 500 }}>
            {site.url.replace("https://", "")}
          </p>
          {/* The run's verdict, frozen: the poster claims a processed invoice, so
              it shows the receipt that processing printed. */}
          <div
            className="eyebrow text-trace-dark text-right"
            style={{ fontSize: 14, lineHeight: 1.65 }}
          >
            <p>{runReceipt.vendor}</p>
            <p>{runReceipt.amount}</p>
            <p className="text-stamp-dark">{runReceipt.approved}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
