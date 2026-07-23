# v2 deep plan: "the execution trace, in depth"

Direction from Dylan: award-winning, 3D objects moving with scroll instead of a passive video, explore the fal 3D catalog. Research: fal's full 3D lineup (July 2026) + how 2025-26 Awwwards winners actually ship scroll-3D. Four concepts ideated, one winner.

## What the research settled

**fal 3D catalog.** trellis-2 ($0.35, O-Voxel, only model that natively does thin/open geometry), hunyuan3d-v3/v3.1 ($0.375 + $0.15 PBR, best closed-volume quality), sketch-to-3d ($0.375, takes drawings but extrudes reliefs), rodin/tripo (fill hollow areas, wrong for wires), triposr/sf3d (draft tier). Hard verdict: **no image-to-3D model reliably turns a hand-drawn routing diagram into clean 3D wires.** Watertight models inflate tubes into sausages and fill ring holes; a flat drawing has no depth cues. Wire geometry must be procedural: the diagram IS a graph, so build it as TubeGeometry along authored curves. fal stays valuable for chunky sculptural objects (a seal, a stamp) and for stills.

**Award-site recipe (2025-26 winners: joseph-san, Trionn, Cartier W&W, Minh Pham).** One hard idea, not scattered effects. Camera travel over free rotation. Lenis + one scrubbed 0-1 progress driving a damped camera. DPR [1,2] (1.5 mobile), <=3 lights, fog, subtle bloom + vignette + grain, <100 draw calls. next/dynamic ssr:false, poster AVIF as Suspense/no-WebGL/reduced-motion fallback, DOM text over aria-hidden canvas, native scroll never hijacked. Degrade ladder: drop post, drop DPR, drop canvas.

## The four concepts

1. **INKWIRE** (pure procedural). The approval graph lifted off the paper: hand-inked luminous 3D wires (TubeGeometry, ~14 edges, torus ring nodes) that draw with scroll, a pulse traveling node to node, camera diving under the paper sheet at the seam, and the wire re-appearing through a transparent gutter slit as a genuinely volumetric trace spine down the whole page. Contact closes the final ring and the APPROVED stamp punches in. Risk 4/10 (seam handoff). Award 9, ship 8.
2. **THE SEAL** (fal used meaningfully). One obsidian hand-stamp GLB (hunyuan3d-v3 + PBR, ~$0.53/attempt) with the diagram engraved in its face; it presses the paper at the seam and physically prints the APPROVED stamp at contact. Risk 7/10 (generation roulette on engraving legibility, 3D-to-DOM press alignment). Award 8, ship 5.
3. **STRATA** (hybrid). A Z-dolly through nine floating paper sheets, one per pipeline stage, fal-generated stage textures as KTX2. Risk 6/10 (canvas-to-DOM handoff, transparency overdraw on mobile). Award 7, ship 5.
4. **DEEP INK** (2.5D). The v1 still on a parallax-occlusion quad with scroll-scrubbed ink drawing. Risk 2/10. Reads as an enhanced still; under-delivers the "3D objects" brief. Award 5, ship 9.

## Winner: INKWIRE

The only concept where the 3D IS the identity instead of illustrating it. Follows the fal research's own verdict (wires must be procedural: crisp tubes, tiny payload, zero dice), and every risk is engineering, not generation roulette. The fal work is not wasted: the nano-banana still stays as poster, OG image, and the video hero remains the full fallback experience (mobile, reduced motion, no WebGL). THE SEAL's press-payoff is the natural v2.1 flourish, buildable procedurally later.

## Build order

1. **Author the graph in code**: the routing diagram as typed polyline paths (lib/trace-graph.ts), sampled into CatmullRomCurve3 with slight Z undulation; single source of truth for hero drawing, spine, and node positions.
2. **Scene**: R3F fixed canvas behind the DOM. Merged tubes + ring nodes, one forked MeshStandardMaterial (uDraw draw-on progress via uv.x discard, uPulse traveling glow, per-node fill), ink #131316, emissive #4cc38a, fog #0a0b0d, 1 key light + ambient, bloom 0.35/vignette/grain, DPR clamp.
3. **Scroll clock**: Lenis smooth scroll; one rAF writes page progress 0-1 to a ref; useFrame damps the camera along a 5-beat path (hero, seam, work stations, approve). uDraw maps to the hero's first viewport; node fills fire from section positions.
4. **Integrate**: next/dynamic ssr:false; desktop + WebGL + motion-ok gets the canvas, everyone else gets the v1 video hero unchanged. The paper sheet gets a CSS-masked transparent gutter slit (md+) where the camera-parented volumetric spine replaces v1's 1px line. DOM stamp payoff unchanged.
5. **Degrade + audit**: tier ladder (drop post, DPR 1, unmount canvas), canvas aria-hidden, keyboard scroll intact, budgets (<20 draw calls, <60k verts), screenshot roast, Lighthouse, deploy.

## v2.1 candidates (after v2 ships)

- THE SEAL press beat at the seam and contact (procedural LatheGeometry stamp, normal map baked from the same graph, no fal roulette).
- trellis-2 LoRA fine-tuned on the ink-and-paper aesthetic for future 3D assets.
- /work/* case-study pages (the SEO plan's top future move).
