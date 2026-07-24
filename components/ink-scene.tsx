"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { Bloom, EffectComposer, SMAA, Vignette } from "@react-three/postprocessing";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";

import { scrollState } from "@/lib/scroll-state";
import { graphEdges, graphNodes, nodeById } from "@/lib/trace-graph";

const INK_BASE = new THREE.Color("#5d7263");
const INK_GLOW = new THREE.Color("#4cc38a");
const FOG_COLOR = "#0a0b0d";
// Opaque node core: the tube ends tuck into it so junctions never show a seam.
const CORE_COLOR = new THREE.Color("#3a4a41");

const VERTEX_SHADER = `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const FRAGMENT_SHADER = `
uniform float uDraw;
uniform float uPulse;
uniform vec2 uWindow;
uniform float uFillAt;
uniform float uFill;
uniform float uIsRing;
uniform float uTrackOn;
uniform vec3 uBase;
uniform vec3 uGlow;
uniform vec3 uTrackColor;
varying vec2 vUv;

void main() {
  float t = mix(uWindow.x, uWindow.y, vUv.x);
  // Barrel shading gives the fat tube its volumetric look, but on the small node
  // torus it just mottles the ring into a dull, uneven donut. Kept for the tube
  // and the grey track; flattened on the lit bead below.
  float shade = 0.82 + 0.34 * sin(vUv.y * 6.2831853);
  vec3 col;
  if (uIsRing > 0.5) {
    if (uDraw < uWindow.x) discard;
    // A node (spine or hero graph) is a bright bead on the wire: clean grey
    // (uTrackColor) while pending, the wire's glowing green once filled. Spine
    // nodes fill by scroll (uFill); hero graph nodes fill as the graph inks in,
    // reaching full green exactly as the inbound edge arrives (uFillAt is that
    // edge's draw end, so the window ends AT uFillAt, never after: a terminal node
    // whose edge finishes at draw 1.0 still fills). The thin torus catches far less
    // bloom than the fat tube, so it needs a high glow (0.95) AND an even, un-banded
    // fill to read as the same glowing green, not a dull matte olive donut.
    float fill = max(smoothstep(uFillAt - 0.06, uFillAt, uDraw), uFill);
    vec3 lit = uBase + uGlow * 0.95;
    col = mix(uTrackColor, lit, fill);
    // The routing pulse only rides an activated (green) node, so a pending grey
    // one never flashes bright and snaps back to grey as the pulse passes.
    float pulse = smoothstep(0.09, 0.0, abs(t - uPulse));
    col += uGlow * pulse * 1.1 * fill;
    // Lit bead is even; the unlit grey ring keeps the banding so it still reads
    // as a piece of the same track.
    shade = mix(shade, 1.0, fill);
  } else {
    bool undrawn = t > uDraw;
    // The undrawn part shows as a dim grey continuation on the SAME tube (one
    // line, not two); a plain wire just draws on and discards ahead.
    if (undrawn && uTrackOn < 0.5) discard;
    if (undrawn) {
      col = uTrackColor;
    } else {
      float pulse = smoothstep(0.09, 0.0, abs(t - uPulse));
      col = uBase + uGlow * (pulse * 1.1 + uFill * 0.85);
    }
  }
  col *= shade;
  gl_FragColor = vec4(col, 1.0);
}
`;

type InkUniforms = {
  uDraw: { value: number };
  uPulse: { value: number };
  uWindow: { value: THREE.Vector2 };
  uFillAt: { value: number };
  uFill: { value: number };
  uIsRing: { value: number };
  uTrackOn: { value: number };
  uBase: { value: THREE.Color };
  uGlow: { value: THREE.Color };
  uTrackColor: { value: THREE.Color };
};

const makeInkMaterial = (options: {
  window: [number, number];
  fillAt?: number;
  isRing?: boolean;
}): { material: THREE.ShaderMaterial; uniforms: InkUniforms } => {
  const uniforms: InkUniforms = {
    uDraw: { value: 0 },
    uPulse: { value: -1 },
    uWindow: { value: new THREE.Vector2(options.window[0], options.window[1]) },
    uFillAt: { value: options.fillAt ?? 2 },
    uFill: { value: 0 },
    uIsRing: { value: options.isRing === true ? 1 : 0 },
    uTrackOn: { value: 0 },
    uBase: { value: INK_BASE.clone() },
    uGlow: { value: INK_GLOW.clone() },
    uTrackColor: { value: new THREE.Color("#3f4c45") },
  };
  const material = new THREE.ShaderMaterial({
    uniforms,
    vertexShader: VERTEX_SHADER,
    fragmentShader: FRAGMENT_SHADER,
    side: THREE.DoubleSide,
  });
  return { material, uniforms };
};

const easeOutCubic = (t: number): number => 1 - (1 - t) ** 3;

const clamp01 = (value: number): number => Math.min(Math.max(value, 0), 1);

// Maps page progress p from [a, b] to [0, 1].
const span = (p: number, a: number, b: number): number => clamp01((p - a) / (b - a));

// ---------------------------------------------------------------------------
// The hero graph: the approval diagram as volumetric ink.
// ---------------------------------------------------------------------------

const HeroGraph = () => {
  const groupRef = useRef<THREE.Group>(null);
  const introStartRef = useRef<number | null>(null);
  const pulseTimeRef = useRef(0);

  const parts = useMemo(() => {
    const edgeMeshes = graphEdges.map((edge) => {
      const points = [nodeById(edge.from).position, ...edge.via, nodeById(edge.to).position].map(
        ([x, y, z]) => new THREE.Vector3(x, y, z)
      );
      const curve = new THREE.CatmullRomCurve3(points, false, "catmullrom", 0.35);
      // Dense tubular + radial segments keep the thin wire smooth under AA.
      const geometry = new THREE.TubeGeometry(curve, 140, 0.018, 16, false);
      const { material, uniforms } = makeInkMaterial({ window: edge.draw });
      return { geometry, material, uniforms };
    });

    const ringGeometry = new THREE.TorusGeometry(0.09, 0.017, 16, 72);
    // Opaque core under each ring: the converging edge tubes tuck into it, so
    // no open tube ends or overlap seams show at a junction.
    const coreGeometry = new THREE.SphereGeometry(0.072, 24, 24);
    const ringMeshes = graphNodes.map((node) => {
      const inbound = graphEdges.filter((edge) => edge.to === node.id);
      const appearAt = inbound.length > 0 ? Math.min(...inbound.map((edge) => edge.draw[0])) : 0;
      const fillAt = inbound.length > 0 ? Math.max(...inbound.map((edge) => edge.draw[1])) : 0.05;
      const { material, uniforms } = makeInkMaterial({
        window: [appearAt, appearAt],
        fillAt,
        isRing: true,
      });
      // The node sits ON TOP of the wires: skip depth so the ring is never
      // occluded by a tube's near surface at a junction.
      material.depthTest = false;
      material.depthWrite = false;
      const coreMaterial = new THREE.MeshBasicMaterial({
        color: CORE_COLOR,
        depthTest: false,
        depthWrite: false,
      });
      return { material, uniforms, coreMaterial, position: node.position };
    });

    return { edgeMeshes, ringGeometry, coreGeometry, ringMeshes };
  }, []);

  useEffect(() => {
    const { edgeMeshes, ringGeometry, coreGeometry, ringMeshes } = parts;
    return () => {
      for (const part of edgeMeshes) {
        part.geometry.dispose();
        part.material.dispose();
      }
      ringGeometry.dispose();
      coreGeometry.dispose();
      for (const ring of ringMeshes) {
        ring.material.dispose();
        ring.coreMaterial.dispose();
      }
    };
  }, [parts]);

  useFrame((state, delta) => {
    const group = groupRef.current;
    if (group === null) return;

    // Intro: the graph inks itself over ~2.4s after mount.
    introStartRef.current ??= state.clock.elapsedTime;
    const intro = easeOutCubic(clamp01((state.clock.elapsedTime - introStartRef.current) / 2.4));

    // Ambient pulse travels the drawn routes; the pause control freezes it.
    if (!scrollState.paused) pulseTimeRef.current += delta;
    const ambient = intro >= 1 ? (pulseTimeRef.current % 4.2) / 4.2 : -1;
    // The hero run's routing beat takes over the pulse for one bright pass.
    const pulse = scrollState.runSweep >= 0 ? scrollState.runSweep : ambient;

    for (const edge of parts.edgeMeshes) {
      edge.uniforms.uDraw.value = intro;
      edge.uniforms.uPulse.value = pulse;
    }
    for (const ring of parts.ringMeshes) {
      ring.uniforms.uDraw.value = intro;
      ring.uniforms.uPulse.value = pulse;
    }

    // Pointer drift while in the hero, then the dive under the paper seam.
    const p = scrollState.progress;
    const dive = span(p, 0.06, 0.2);
    const driftX = scrollState.paused ? 0 : scrollState.pointerX;
    const driftY = scrollState.paused ? 0 : scrollState.pointerY;
    group.rotation.y = THREE.MathUtils.damp(group.rotation.y, driftX * 0.09, 4, delta);
    group.rotation.x = THREE.MathUtils.damp(
      group.rotation.x,
      driftY * 0.05 - dive * 0.55,
      4,
      delta
    );
    group.position.y = THREE.MathUtils.damp(group.position.y, dive * 3.1, 5, delta);
    group.position.z = THREE.MathUtils.damp(group.position.z, dive * -1.6, 5, delta);
  });

  return (
    <group ref={groupRef} position={[2.35, 0.15, -1]} scale={0.82}>
      {parts.edgeMeshes.map((edge, index) => (
        <mesh key={`edge-${String(index)}`} geometry={edge.geometry} material={edge.material} />
      ))}
      {parts.ringMeshes.map((ring, index) => (
        <group key={`node-${String(index)}`} position={ring.position}>
          <mesh geometry={parts.coreGeometry} material={ring.coreMaterial} renderOrder={2} />
          <mesh geometry={parts.ringGeometry} material={ring.material} renderOrder={3} />
        </group>
      ))}
    </group>
  );
};

const CameraRig = () => {
  useFrame((state, delta) => {
    const camera = state.camera;
    const p = scrollState.progress;
    const heroBeat = span(p, 0, 0.06);
    const targetZ = 7.7 - heroBeat * 0.7;
    const targetY = -0.1 - span(p, 0.06, 0.2) * 0.5;
    camera.position.z = THREE.MathUtils.damp(camera.position.z, targetZ, 4, delta);
    camera.position.y = THREE.MathUtils.damp(camera.position.y, targetY, 4, delta);
    camera.lookAt(0.3, 0, 0);
  });
  return null;
};

// ---------------------------------------------------------------------------
// The seal: a volumetric hand-stamp that descends onto the contact section and
// physically prints the DOM APPROVED stamp. Fired once by TraceEffects when
// the stamp scrolls into view in ink3d mode.
// ---------------------------------------------------------------------------

const SEAL_DEPTH = 5;
const SEAL_DURATION = 1.05;

const SealPress = () => {
  const groupRef = useRef<THREE.Group>(null);
  const startRef = useRef<number | null>(null);
  const targetRef = useRef<{ x: number; y: number } | null>(null);
  const hasPrintedRef = useRef(false);

  const parts = useMemo(() => {
    // Handle profile lathed around Y: knob, waist, base disc.
    const profile: THREE.Vector2[] = [
      new THREE.Vector2(0.001, 1),
      new THREE.Vector2(0.1, 0.97),
      new THREE.Vector2(0.13, 0.85),
      new THREE.Vector2(0.07, 0.7),
      new THREE.Vector2(0.06, 0.34),
      new THREE.Vector2(0.11, 0.2),
      new THREE.Vector2(0.26, 0.11),
      new THREE.Vector2(0.28, 0.02),
      new THREE.Vector2(0.26, 0),
      new THREE.Vector2(0.001, 0),
    ];
    const bodyGeometry = new THREE.LatheGeometry(profile, 40);
    const body = makeInkMaterial({ window: [0, 1] });
    body.uniforms.uDraw.value = 1;
    body.uniforms.uBase.value = new THREE.Color("#2e3335");

    const faceGeometry = new THREE.TorusGeometry(0.23, 0.02, 8, 40);
    const face = makeInkMaterial({ window: [0, 0], isRing: true });
    face.uniforms.uDraw.value = 1;
    face.uniforms.uFill.value = 1;

    return { bodyGeometry, bodyMaterial: body.material, faceGeometry, faceMaterial: face.material };
  }, []);

  useEffect(
    () => () => {
      parts.bodyGeometry.dispose();
      parts.bodyMaterial.dispose();
      parts.faceGeometry.dispose();
      parts.faceMaterial.dispose();
    },
    [parts]
  );

  useFrame((state) => {
    const group = groupRef.current;
    if (group === null) return;
    const camera = state.camera;
    if (!(camera instanceof THREE.PerspectiveCamera)) return;

    if (startRef.current === null) {
      group.visible = false;
      if (!scrollState.sealRequest) return;
      const stampElement = document.querySelector<HTMLElement>("[data-stamp]");
      if (stampElement === null) {
        // No 3D press possible; print directly.
        scrollState.sealRequest = false;
        return;
      }
      const rect = stampElement.getBoundingClientRect();
      const ndcX = ((rect.left + rect.width / 2) / window.innerWidth) * 2 - 1;
      const ndcY = 1 - ((rect.top + rect.height / 2) / window.innerHeight) * 2;
      const halfH = Math.tan(THREE.MathUtils.degToRad(camera.fov) * 0.5) * SEAL_DEPTH;
      const halfW = halfH * camera.aspect;
      targetRef.current = { x: ndcX * halfW, y: ndcY * halfH };
      startRef.current = state.clock.elapsedTime;
    }

    const target = targetRef.current;
    if (target === null) return;
    const progress = (state.clock.elapsedTime - startRef.current) / SEAL_DURATION;

    // Lock to the camera, then articulate the press in view space.
    group.position.copy(camera.position);
    group.quaternion.copy(camera.quaternion);
    group.visible = true;

    const seal = group.children.at(0);
    if (seal === undefined) return;

    // Timeline: fall (0-0.38), impact squash (0.38-0.52), retreat (0.52-1).
    const fall = Math.min(progress / 0.38, 1);
    const drop = 1.6 * (1 - fall * fall);
    const squash =
      progress > 0.38 && progress < 0.52
        ? 1 - 0.16 * Math.sin(((progress - 0.38) / 0.14) * Math.PI)
        : 1;
    const retreat = progress > 0.52 ? (progress - 0.52) / 0.48 : 0;

    seal.position.set(target.x, target.y + drop + retreat * 2.2, -SEAL_DEPTH + retreat * -1.5);
    seal.scale.set(1, squash, 1);

    if (progress >= 0.4 && !hasPrintedRef.current) {
      hasPrintedRef.current = true;
      document.querySelector("[data-stamp]")?.classList.add("is-stamped");
    }

    if (progress >= 1) {
      group.visible = false;
      scrollState.sealRequest = false;
      // Done for good; keep startRef set so it never re-fires.
    }
  });

  return (
    <group ref={groupRef} visible={false}>
      <group>
        <mesh geometry={parts.bodyGeometry} material={parts.bodyMaterial} />
        <mesh
          geometry={parts.faceGeometry}
          material={parts.faceMaterial}
          rotation={[Math.PI / 2, 0, 0]}
          position={[0, 0.01, 0]}
        />
      </group>
    </group>
  );
};

export const InkScene = () => {
  const { scene } = useThree();

  useEffect(() => {
    scene.fog = new THREE.Fog(FOG_COLOR, 5.5, 11.5);
    scene.background = new THREE.Color(FOG_COLOR);
  }, [scene]);

  return (
    <>
      <CameraRig />
      <HeroGraph />
      <SealPress />
      {/* multisampling = WebGL2 MSAA on the geometry pass; SMAA cleans the
          remaining edges the thin bright wire leaves after bloom. The film grain
          is a static CSS overlay in ink-hero (see .ink-grain), not a per-frame
          Noise pass, so the composer does not redraw the full screen every frame
          just for texture. */}
      <EffectComposer multisampling={4}>
        <Bloom intensity={0.5} luminanceThreshold={0.3} luminanceSmoothing={0.4} mipmapBlur />
        {/* Light vignette only: a strong one darkened the wire toward the top and
            bottom of the viewport, so the green shifted with scroll position. */}
        <Vignette darkness={0.25} />
        <SMAA />
      </EffectComposer>
    </>
  );
};
