"use client";

import { useEffect } from "react";

// Renders nothing. Drives the page's two scroll behaviors (hero dim under the
// paper sheet, trace spine draw) plus node fills, the stamp, and lazy playback
// of the figure loops. Everything degrades to static under reduced motion via
// the CSS fallbacks in globals.css.
export const TraceEffects = () => {
  useEffect(() => {
    const spine = document.querySelector<HTMLElement>("[data-spine]");
    const spineFill = document.querySelector<HTMLElement>("[data-spine-fill]");
    const heroDim = document.querySelector<HTMLElement>("[data-hero-dim]");
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

          entry.target.classList.add("is-stamped");
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
          void entry.target.play();
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
      if (heroDim !== null) {
        const progress = Math.min(Math.max(window.scrollY / viewportHeight, 0), 1);
        heroDim.style.opacity = String(progress * 0.6);
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
