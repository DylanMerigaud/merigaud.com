// Shared mutable scroll state, written once per frame by the page's scroll
// driver and read by the R3F scene without triggering React renders.

export const scrollState = {
  // Overall page progress 0-1 (scrollY / max scroll).
  progress: 0,
  // Progress through the first viewport only (the hero beat), 0-1.
  hero: 0,
  // Pointer position in [-1, 1], for the hero drift.
  pointerX: 0,
  pointerY: 0,
  // Set by the hero pause control; freezes ambient animation.
  paused: false,
  // One-shot routing sweep progress driven by the hero run; -1 when idle.
  runSweep: -1,
  // Set when the contact stamp enters view in ink3d mode; the 3D seal answers.
  sealRequest: false,
};
