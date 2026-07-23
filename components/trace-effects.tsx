"use client";

import { useEffect } from "react";

import { scrollState } from "@/lib/scroll-state";

// Renders nothing. Drives the page's two scroll behaviors (hero dim under the
// paper sheet, trace spine draw) plus node fills, the stamp, and lazy playback
// of the figure loops. Everything degrades to static under reduced motion via
// the CSS fallbacks in globals.css.
export const TraceEffects = () => {
  useEffect(() => {
    const spine = document.querySelector<HTMLElement>("[data-spine]");
    const spineFill = document.querySelector<HTMLElement>("[data-spine-fill]");
    let heroDim = document.querySelector<HTMLElement>("[data-hero-dim]");
    let heroFade = document.querySelector<HTMLElement>("[data-hero-fade]");
    const sheet = document.querySelector<HTMLElement>("[data-sheet]");
    const approveNode = document.querySelector<HTMLElement>('[data-node="approve"]');
    const nodes = document.querySelectorAll<HTMLElement>("[data-node]");
    const stamp = document.querySelector<HTMLElement>("[data-stamp]");
    const figures = document.querySelectorAll<HTMLVideoElement>("video[data-figure]");
    const isReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // The spine runs from the top of the paper sheet to the approve node.
    const measure = () => {
      if (spine === null || sheet === null || approveNode === null) return;
      const sheetTop = sheet.getBoundingClientRect().top + window.scrollY;
      const nodeTop = approveNode.getBoundingClientRect().top + window.scrollY;
      spine.style.height = `${String(nodeTop - sheetTop + 10)}px`;
    };
    measure();
    const resizeObserver = new ResizeObserver(measure);
    if (sheet !== null) resizeObserver.observe(sheet);

    const nodeObserver = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) {
            continue;
          }

          entry.target.classList.add("is-filled");
          nodeObserver.unobserve(entry.target);
        }
      },
      { rootMargin: "0px 0px -25% 0px" }
    );
    for (const node of nodes) nodeObserver.observe(node);

    const stampObserver = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) {
            continue;
          }

          if (document.documentElement.dataset["ink3d"] === "true") {
            // The 3D seal presses first and prints the stamp itself.
            scrollState.sealRequest = true;
          } else {
            entry.target.classList.add("is-stamped");
          }
          stampObserver.unobserve(entry.target);
        }
      },
      { threshold: 0.6 }
    );
    if (stamp !== null) stampObserver.observe(stamp);

    // Figure loops start only when visible, and never under reduced motion.
    const figureObserver = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!(entry.isIntersecting && entry.target instanceof HTMLVideoElement)) {
            continue;
          }

          entry.target.muted = true;
          const video = entry.target;
          void (async () => {
            try {
              await video.play();
            } catch {
              // Poster remains if playback is refused.
            }
          })();
          figureObserver.unobserve(entry.target);
        }
      },
      { threshold: 0.3 }
    );
    if (!isReduced) {
      for (const figure of figures) figureObserver.observe(figure);
    }

    let raf = 0;
    const frame = () => {
      const viewportHeight = window.innerHeight;
      // Shared scroll state for the ink3d scene.
      const maxScroll = document.documentElement.scrollHeight - viewportHeight;
      scrollState.progress = maxScroll > 0 ? Math.min(window.scrollY / maxScroll, 1) : 0;
      scrollState.hero = Math.min(Math.max(window.scrollY / viewportHeight, 0), 1);
      if (heroDim === null || !heroDim.isConnected) {
        heroDim = document.querySelector<HTMLElement>("[data-hero-dim]");
      }
      if (heroDim !== null) {
        // Dim through the seam, then release so the slit spine stays legible.
        const release = 1 - Math.min(Math.max((scrollState.progress - 0.18) / 0.12, 0), 1);
        heroDim.style.opacity = String(scrollState.hero * 0.6 * release);
      }
      if (heroFade === null || !heroFade.isConnected) {
        heroFade = document.querySelector<HTMLElement>("[data-hero-fade]");
      }
      if (heroFade !== null) {
        // The sticky hero text leaves before the sheet (and its slit) covers it.
        const fade = 1 - Math.min(Math.max((scrollState.hero - 0.2) / 0.3, 0), 1);
        heroFade.style.opacity = String(fade);
        // Once faded out it is behind the opaque sheet: inert removes its links
        // and controls from the tab order and the a11y tree, not just the mouse.
        heroFade.inert = fade < 0.1;
      }
      if (spineFill !== null && spine !== null) {
        const rect = spine.getBoundingClientRect();
        if (rect.height > 0) {
          const progress = Math.min(
            Math.max((viewportHeight * 0.72 - rect.top) / rect.height, 0),
            1
          );
          spineFill.style.transform = `scaleY(${String(progress)})`;
        }
      }
      raf = window.requestAnimationFrame(frame);
    };
    if (!isReduced) raf = window.requestAnimationFrame(frame);

    return () => {
      window.cancelAnimationFrame(raf);
      resizeObserver.disconnect();
      nodeObserver.disconnect();
      stampObserver.disconnect();
      figureObserver.disconnect();
    };
  }, []);

  return null;
};
