"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

import { HeroContent } from "@/components/hero-content";
import { scrollState } from "@/lib/scroll-state";

// The hero as a live run: a messy vendor invoice lands, the AI visibly reads
// it (field boxes, extracted values flying to a run receipt), the amount
// routes through the 3D approval graph, APPROVED lands, and only then does the
// headline stamp in. The visitor watches the thesis execute before reading it.
//
// Phases (seconds from start, paused with the hero control, skipped by any
// scroll/keydown):
//   p1 0.0  invoice settles in, scan sweep
//   p2 0.9  field boxes ink on
//   p3 1.8  values fly to the receipt
//   p4 2.7  the graph routes the amount (bright sweep, driven via scrollState)
//   p5 3.8  receipt flips to APPROVED
//   p6 4.4  headline stamps in, invoice recedes to a processed artifact
const PHASE_TIMES = [0, 0.9, 1.8, 2.7, 3.8, 4.4] as const;
const RUN_END = 4.4;
const SWEEP_START = 2.7;
const SWEEP_DURATION = 1.1;

type Extraction = {
  id: string;
  label: string;
  value: string;
  // Field rect on the invoice image, in percent.
  box: { left: string; top: string; width: string; height: string };
};

const EXTRACTIONS: Extraction[] = [
  {
    id: "vendor",
    label: "vendor",
    value: "NORDWIND SUPPLY",
    box: { left: "19%", top: "19%", width: "23%", height: "8.5%" },
  },
  {
    id: "terms",
    label: "terms",
    value: "NET 30",
    box: { left: "19%", top: "34.5%", width: "25%", height: "7.5%" },
  },
  {
    id: "amount",
    label: "amount",
    value: "$48,250.00",
    box: { left: "30%", top: "64%", width: "33%", height: "6%" },
  },
];

type InkRunProps = {
  isPlaying: boolean;
  onTogglePlayback: () => void;
};

export const InkRun = ({ isPlaying, onTogglePlayback }: InkRunProps) => {
  const [phase, setPhase] = useState(0);
  const [isSkipped, setIsSkipped] = useState(false);
  const elapsedRef = useRef(0);
  const phaseRef = useRef(0);
  const skippedRef = useRef(false);
  const playingRef = useRef(isPlaying);
  playingRef.current = isPlaying;

  useEffect(() => {
    const skip = () => {
      if (skippedRef.current) return;
      skippedRef.current = true;
      setIsSkipped(true);
      setPhase(PHASE_TIMES.length);
      scrollState.runSweep = -1;
    };
    window.addEventListener("wheel", skip, { passive: true });
    window.addEventListener("touchstart", skip, { passive: true });
    window.addEventListener("keydown", skip);
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      // Jump straight to the settled state on the first frame.
      elapsedRef.current = RUN_END + 2;
    }

    let raf = 0;
    let last = performance.now();
    const frame = (now: number) => {
      const delta = (now - last) / 1000;
      last = now;
      if (!skippedRef.current) {
        if (playingRef.current) elapsedRef.current += delta;
        const elapsed = elapsedRef.current;

        let nextPhase = 0;
        for (const [index, phaseTime] of PHASE_TIMES.entries()) {
          if (elapsed >= phaseTime) nextPhase = index + 1;
        }
        if (nextPhase !== phaseRef.current) {
          phaseRef.current = nextPhase;
          setPhase(nextPhase);
        }

        // Drive the one-shot routing sweep on the 3D graph.
        scrollState.runSweep =
          elapsed >= SWEEP_START && elapsed <= SWEEP_START + SWEEP_DURATION
            ? (elapsed - SWEEP_START) / SWEEP_DURATION
            : -1;

        if (elapsed > RUN_END + 1.5) {
          skippedRef.current = true;
          setIsSkipped(true);
        }
      }
      raf = window.requestAnimationFrame(frame);
    };
    raf = window.requestAnimationFrame(frame);

    return () => {
      window.cancelAnimationFrame(raf);
      window.removeEventListener("wheel", skip);
      window.removeEventListener("touchstart", skip);
      window.removeEventListener("keydown", skip);
      scrollState.runSweep = -1;
    };
  }, []);

  const phaseClasses = Array.from({ length: phase }, (_, index) => `rp${String(index + 1)}`).join(
    " "
  );

  return (
    <div
      data-hero-fade
      className={`run ${phaseClasses} ${isSkipped ? "run-done" : ""} relative h-full`}
    >
      {/* The document under processing. */}
      <div aria-hidden="true" className="run-invoice">
        <Image
          src="/run-invoice.jpg"
          alt=""
          width={821}
          height={1100}
          priority
          className="block h-auto w-full"
        />
        <div className="run-scan" />
        {EXTRACTIONS.map((extraction, index) => (
          <div
            key={extraction.id}
            className="run-box"
            style={{ ...extraction.box, animationDelay: `${String(index * 0.18)}s` }}
          >
            <span className="run-box-label eyebrow">{extraction.label}</span>
          </div>
        ))}
      </div>

      {/* The run receipt: where the extracted mess lands as typed data. */}
      <div aria-hidden="true" className="run-receipt eyebrow">
        <p className="run-receipt-line" data-slot="vendor">
          NORDWIND SUPPLY
        </p>
        <p className="run-receipt-line" data-slot="amount">
          $48,250.00 · NET 30
        </p>
        <p className="run-receipt-status">
          <span className="run-status-reading">status: reading…</span>
          <span className="run-status-routing">status: routing…</span>
          <span className="run-status-approved">APPROVED · human in the loop</span>
        </p>
      </div>

      {isSkipped ? (
        <button
          type="button"
          onClick={() => {
            elapsedRef.current = 0;
            phaseRef.current = 0;
            skippedRef.current = false;
            setPhase(0);
            setIsSkipped(false);
          }}
          className="eyebrow border-paper/25 text-trace-dark hover:border-paper/60 hover:text-paper absolute right-6 bottom-[4.75rem] min-h-11 rounded-md border px-4 py-3 transition-colors max-md:hidden md:right-10"
        >
          replay run
        </button>
      ) : null}

      <HeroContent
        isPlaying={isPlaying}
        onTogglePlayback={onTogglePlayback}
        pauseLabel="Pause background animation"
        playLabel="Play background animation"
      />
    </div>
  );
};
