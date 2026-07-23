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

const COMPACT_QUERY = "(max-width: 767px)";

const subscribeToCompact = (onChange: () => void) => {
  const mediaQuery = window.matchMedia(COMPACT_QUERY);
  mediaQuery.addEventListener("change", onChange);
  return () => {
    mediaQuery.removeEventListener("change", onChange);
  };
};

// Phones get a portrait re-crop of the loop centered on the inked graph; the
// landscape master would show mostly empty desk in a tall viewport.
const useIsCompact = () =>
  useSyncExternalStore(
    subscribeToCompact,
    () => window.matchMedia(COMPACT_QUERY).matches,
    () => false
  );

// The video hero: the default experience, and the fallback for the ink3d
// variant (mobile, reduced motion, no WebGL).
export const Hero = () => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const shouldReduceMotion = useShouldReduceMotion();
  const isCompact = useIsCompact();
  const videoSrc = isCompact ? "/hero-mobile.mp4" : "/hero.mp4";
  const posterSrc = isCompact ? "/hero-poster-mobile.jpg" : "/hero-poster.jpg";
  // null = the visitor has not touched the control; motion preference decides.
  const [playingOverride, setPlayingOverride] = useState<boolean | null>(null);
  const isPlaying = playingOverride ?? !shouldReduceMotion;

  useEffect(() => {
    const video = videoRef.current;
    if (video === null) return;
    if (isPlaying) {
      // The gate may unmount this hero mid-play (ink3d upgrade); swallow the
      // resulting AbortError so it never hits the console.
      void (async () => {
        try {
          await video.play();
        } catch {
          // Unmounted or autoplay-blocked; the poster stays.
        }
      })();
    } else {
      video.pause();
    }
    // videoSrc is a dep so the effect re-applies play/pause after the responsive
    // source swap remounts the <video> (autoPlay would otherwise resume a paused
    // clip when the viewport crosses the mobile breakpoint).
  }, [isPlaying, videoSrc]);

  return (
    <header className="on-dark bg-ink-deep sticky top-0 z-0 h-svh overflow-hidden">
      {/* Poster paints as the LCP; the video swaps in over it. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${posterSrc})` }}
      />
      <video
        key={videoSrc}
        ref={videoRef}
        aria-hidden="true"
        autoPlay
        loop
        muted
        playsInline
        preload="metadata"
        poster={posterSrc}
        tabIndex={-1}
        className="hero-video absolute inset-0 size-full object-cover"
      >
        <source src={videoSrc} type="video/mp4" />
      </video>
      {/* Base scrim for headline contrast, then the scroll-driven dim. Stronger
          at top and bottom (where the text and CTAs sit) so a bright wire
          passing behind grey copy never drops below AA. */}
      <div
        aria-hidden="true"
        className="from-ink-deep/85 via-ink-deep/50 to-ink-deep/85 absolute inset-0 bg-gradient-to-b"
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
