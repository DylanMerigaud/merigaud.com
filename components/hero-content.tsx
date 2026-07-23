"use client";

import { hero } from "@/lib/copy";

type HeroContentProps = {
  isPlaying: boolean;
  onTogglePlayback: () => void;
  pauseLabel: string;
  playLabel: string;
  onReplay?: () => void;
};

// The DOM layer of the hero, shared by the video and ink3d variants. Real text
// over an aria-hidden media layer; the media never carries meaning.
export const HeroContent = ({
  isPlaying,
  onTogglePlayback,
  pauseLabel,
  playLabel,
  onReplay,
}: HeroContentProps) => (
  <div
    data-hero-fade
    className="relative mx-auto flex h-full max-w-6xl flex-col justify-center px-6 md:px-10"
  >
    <p className="eyebrow hero-rise text-trace-dark" style={{ animationDelay: "0.15s" }}>
      {hero.eyebrow}
    </p>
    <h1 className="h1-display text-paper mt-6">
      <span className="h1-wide hero-rise block" style={{ animationDelay: "0.25s" }}>
        {hero.h1Line1}
      </span>
      <span className="h1-narrow hero-rise block" style={{ animationDelay: "0.33s" }}>
        {hero.h1Line2}
      </span>
    </h1>
    <p
      className="hero-rise text-paper/85 mt-8 max-w-xl text-lg leading-relaxed"
      style={{ animationDelay: "0.45s" }}
    >
      {hero.sub}
    </p>
    <div
      className="hero-rise mt-10 flex flex-wrap items-center gap-4"
      style={{ animationDelay: "0.55s" }}
    >
      <a
        href="#work"
        className="link-arrow bg-paper text-ink hover:bg-paper-dim inline-flex min-h-11 items-center rounded-md px-6 py-3 font-medium transition-colors"
      >
        {hero.ctaWorkLabel}
      </a>
      <a
        href={`mailto:${hero.ctaEmailLabel}`}
        className="border-paper/35 text-paper hover:border-paper/70 inline-flex min-h-11 items-center rounded-md border px-6 py-3 font-medium transition-colors"
      >
        {hero.ctaEmailLabel}
      </a>
    </div>

    <p className="eyebrow text-trace-dark absolute bottom-8 left-6 max-md:hidden md:left-10">
      {hero.scrollCue}
    </p>
    <div className="absolute right-6 bottom-6 flex items-center gap-3 md:right-10">
      {onReplay === undefined ? null : (
        <button
          type="button"
          onClick={onReplay}
          className="eyebrow border-paper/25 text-trace-dark hover:border-paper/60 hover:text-paper min-h-11 rounded-md border px-4 py-3 transition-colors max-md:hidden"
        >
          replay run
        </button>
      )}
      <button
        type="button"
        onClick={onTogglePlayback}
        aria-label={isPlaying ? pauseLabel : playLabel}
        className="eyebrow border-paper/25 text-trace-dark hover:border-paper/60 hover:text-paper min-h-11 min-w-11 rounded-md border px-4 py-3 transition-colors"
      >
        <span className="max-md:hidden">{isPlaying ? pauseLabel : playLabel}</span>
        <span className="md:hidden">{isPlaying ? "Pause" : "Play"}</span>
      </button>
    </div>
  </div>
);
