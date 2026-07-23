"use client";

import Image from "next/image";
import { useRef, useState } from "react";

import type { WorkItem } from "@/lib/copy";

// One art-directed figure per project: paper card, ink hairline, mono caption.
// Video figures autoplay muted when scrolled into view (driven by TraceEffects)
// and carry a pause/play control (WCAG 2.2.2). On mobile the desktop screenshots
// are cropped to a legible detail instead of shrinking to mush.
export const WorkFigure = ({ figure }: { figure: WorkItem["figure"] }) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(true);

  const toggle = () => {
    const video = videoRef.current;
    if (video === null) return;
    if (video.paused) {
      void video.play();
      setIsPlaying(true);
    } else {
      video.pause();
      setIsPlaying(false);
    }
  };

  return (
    <figure>
      <div className="figure-card">
        {figure.kind === "image" ? (
          <Image
            src={figure.src}
            width={figure.width}
            height={figure.height}
            alt={figure.alt}
            sizes="(min-width: 768px) 44rem, 100vw"
            className="figure-media block w-full"
          />
        ) : (
          <>
            <video
              ref={videoRef}
              data-figure
              loop
              muted
              playsInline
              preload="none"
              poster={figure.poster}
              width={figure.width}
              height={figure.height}
              className="figure-media block w-full"
              aria-label={figure.alt}
            >
              <source src={figure.src} type="video/mp4" />
            </video>
            <button
              type="button"
              onClick={toggle}
              aria-label={isPlaying ? "Pause this demo loop" : "Play this demo loop"}
              className="figure-pause eyebrow"
            >
              {isPlaying ? "Pause" : "Play"}
            </button>
          </>
        )}
      </div>
      <figcaption className="eyebrow text-trace mt-3 flex items-center gap-2">
        {figure.kind === "video" ? <span aria-hidden="true" className="figure-live" /> : null}
        {figure.caption}
      </figcaption>
    </figure>
  );
};
