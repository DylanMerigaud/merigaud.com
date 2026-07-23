"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";

import { HeroContent } from "@/components/hero-content";
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

// The video hero: the default experience, and the fallback for the ink3d
// variant (mobile, reduced motion, no WebGL).
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

      <HeroContent
        isPlaying={isPlaying}
        onTogglePlayback={() => {
          setPlayingOverride(!isPlaying);
        }}
        pauseLabel={hero.videoPause}
        playLabel={hero.videoPlay}
      />
    </header>
  );
};
