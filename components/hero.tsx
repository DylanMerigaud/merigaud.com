"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";

import { hero } from "@/lib/copy";

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

const subscribeToReducedMotion = (onChange: () => void) => {
  const mediaQuery = window.matchMedia(REDUCED_MOTION_QUERY);
  mediaQuery.addEventListener("change", onChange);
  return () => {
    mediaQuery.removeEventListener("change", onChange);
  };
};

const useShouldReduceMotion = () =>
  useSyncExternalStore(
    subscribeToReducedMotion,
    () => window.matchMedia(REDUCED_MOTION_QUERY).matches,
    () => false
  );

export const Hero = () => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const shouldReduceMotion = useShouldReduceMotion();
  // null = the visitor has not touched the control; motion preference decides.
  const [playingOverride, setPlayingOverride] = useState<boolean | null>(null);
  const isPlaying = playingOverride ?? !shouldReduceMotion;

  useEffect(() => {
    const video = videoRef.current;
    if (video === null) return;
    if (isPlaying) {
      void video.play();
    } else {
      video.pause();
    }
  }, [isPlaying]);

  const toggleVideo = () => {
    setPlayingOverride(!isPlaying);
  };

  return (
    <header className="on-dark bg-ink-deep sticky top-0 z-0 h-svh overflow-hidden">
      {/* Poster paints as the LCP; the video swaps in over it. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url(/hero-poster.jpg)" }}
      />
      <video
        ref={videoRef}
        aria-hidden="true"
        autoPlay
        loop
        muted
        playsInline
        preload="metadata"
        poster="/hero-poster.jpg"
        tabIndex={-1}
        className="hero-video absolute inset-0 size-full object-cover"
      >
        <source src="/hero.mp4" type="video/mp4" />
      </video>
      {/* Base scrim for headline contrast, then the scroll-driven dim. */}
      <div
        aria-hidden="true"
        className="from-ink-deep/70 via-ink-deep/35 to-ink-deep/55 absolute inset-0 bg-gradient-to-b"
      />
      <div aria-hidden="true" data-hero-dim className="bg-ink-deep absolute inset-0 opacity-0" />

      <div className="relative mx-auto flex h-full max-w-6xl flex-col justify-center px-6 md:px-10">
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
            href={`mailto:${hero.ctaEmailLabel}`}
            className="bg-paper text-ink hover:bg-paper-dim inline-flex min-h-11 items-center rounded-md px-6 py-3 font-medium transition-colors"
          >
            {hero.ctaEmailLabel}
          </a>
          <a
            href="#work"
            className="link-arrow border-paper/35 text-paper hover:border-paper/70 inline-flex min-h-11 items-center rounded-md border px-6 py-3 font-medium transition-colors"
          >
            {hero.ctaWorkLabel}
          </a>
        </div>

        <p className="eyebrow text-trace-dark absolute bottom-8 left-6 md:left-10">
          {hero.scrollCue}
        </p>
        <button
          type="button"
          onClick={toggleVideo}
          className="eyebrow border-paper/25 text-trace-dark hover:border-paper/60 hover:text-paper absolute right-6 bottom-6 min-h-11 min-w-11 rounded-md border px-4 py-3 transition-colors md:right-10"
        >
          {isPlaying ? hero.videoPause : hero.videoPlay}
        </button>
      </div>
    </header>
  );
};
