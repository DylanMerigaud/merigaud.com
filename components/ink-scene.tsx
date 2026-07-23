"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { Bloom, EffectComposer, Noise, Vignette } from "@react-three/postprocessing";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";

import { scrollState } from "@/lib/scroll-state";
import { graphEdges, graphNodes, nodeById } from "@/lib/trace-graph";

const INK_BASE = new THREE.Color("#5d7263");
const INK_GLOW = new THREE.Color("#4cc38a");
const FOG_COLOR = "#0a0b0d";

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
uniform vec3 uBase;
uniform vec3 uGlow;
varying vec2 vUv;

void main() {
  float t = mix(uWindow.x, uWindow.y, vUv.x);
  if (uIsRing < 0.5 && t > uDraw) discard;
  if (uIsRing > 0.5 && uDraw < uWindow.x) discard;
  vec3 col = uBase;
  float fill = max(smoothstep(uFillAt, uFillAt + 0.05, uDraw) * uIsRing, uFill);
  float pulseDistance = abs(t - uPulse);
  float pulse = smoothstep(0.09, 0.0, pulseDistance);
  col += uGlow * (pulse * 1.1 + fill * 0.85);
  col *= 0.82 + 0.34 * sin(vUv.y * 6.2831853);
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
  uBase: { value: THREE.Color };
  uGlow: { value: THREE.Color };
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
    uBase: { value: INK_BASE.clone() },
    uGlow: { value: INK_GLOW.clone() },
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
      const geometry = new THREE.TubeGeometry(curve, 72, 0.016, 8, false);
      const { material, uniforms } = makeInkMaterial({ window: edge.draw });
      return { geometry, material, uniforms };
    });

    const ringMeshes = graphNodes.map((node) => {
      const inbound = graphEdges.filter((edge) => edge.to === node.id);
      const appearAt = inbound.length > 0 ? Math.min(...inbound.map((edge) => edge.draw[0])) : 0;
      const fillAt = inbound.length > 0 ? Math.max(...inbound.map((edge) => edge.draw[1])) : 0.05;
      const geometry = new THREE.TorusGeometry(0.085, 0.016, 8, 40);
      const { material, uniforms } = makeInkMaterial({
        window: [appearAt, appearAt],
        fillAt,
        isRing: true,
      });
      return { geometry, material, uniforms, position: node.position };
    });

    return { edgeMeshes, ringMeshes };
  }, []);

  useEffect(() => {
    const { edgeMeshes, ringMeshes } = parts;
    return () => {
      for (const part of [...edgeMeshes, ...ringMeshes]) {
        part.geometry.dispose();
        part.material.dispose();
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
        <mesh
          key={`ring-${String(index)}`}
          geometry={ring.geometry}
          material={ring.material}
          position={ring.position}
        />
      ))}
    </group>
  );
};

// ---------------------------------------------------------------------------
// The spine: the trace line as a camera-locked volumetric wire, aligned with
// the transparent gutter slit masked out of the paper sheet.
// ---------------------------------------------------------------------------

const SPINE_DEPTH = 6;

const SpineWire = () => {
  const groupRef = useRef<THREE.Group>(null);
  const tubeMeshRef = useRef<THREE.Mesh>(null);
  const trackMeshRef = useRef<THREE.Mesh>(null);
  const ringMeshesRef = useRef<(THREE.Mesh | null)[]>([]);
  const pulseTimeRef = useRef(0);
  const markerOffsetsRef = useRef<{ element: HTMLElement; ring: number }[]>([]);
  const ringFillsRef = useRef<number[]>([]);

  const parts = useMemo(() => {
    // A tall, slightly wavering vertical wire; uv.x runs top to bottom.
    const points: THREE.Vector3[] = [];
    const height = 9;
    for (let i = 0; i <= 24; i += 1) {
      const t = i / 24;
      points.push(
        new THREE.Vector3(Math.sin(t * 14) * 0.02, height / 2 - t * height, Math.sin(t * 9) * 0.02)
      );
    }
    const curve = new THREE.CatmullRomCurve3(points, false, "catmullrom", 0.6);
    const tubeGeometry = new THREE.TubeGeometry(curve, 96, 0.024, 8, false);
    const tube = makeInkMaterial({ window: [0, 1] });
    const track = makeInkMaterial({ window: [0, 1] });
    track.uniforms.uDraw.value = 1;
    track.uniforms.uBase.value = new THREE.Color("#26292a");

    const rings = Array.from({ length: 6 }, () => {
      const geometry = new THREE.TorusGeometry(0.07, 0.02, 8, 32);
      const ring = makeInkMaterial({ window: [0, 0], fillAt: 2, isRing: true });
      return { geometry, material: ring.material, uniforms: ring.uniforms };
    });

    return {
      tubeGeometry,
      tubeMaterial: tube.material,
      tubeUniforms: tube.uniforms,
      trackMaterial: track.material,
      rings,
    };
  }, []);

  useEffect(() => {
    const markers = [...document.querySelectorAll<HTMLElement>("[data-node]")];
    markerOffsetsRef.current = markers.map((element, index) => ({ element, ring: index }));
    ringFillsRef.current = markers.map(() => 0);
    return () => {
      parts.tubeGeometry.dispose();
      parts.tubeMaterial.dispose();
      parts.trackMaterial.dispose();
      for (const ring of parts.rings) {
        ring.geometry.dispose();
        ring.material.dispose();
      }
    };
  }, [parts]);

  useFrame((state, delta) => {
    const group = groupRef.current;
    if (group === null) return;
    const camera = state.camera;
    if (!(camera instanceof THREE.PerspectiveCamera)) return;

    // Lock the group to the camera, then place children in view space.
    group.position.copy(camera.position);
    group.quaternion.copy(camera.quaternion);

    const viewportHeight = window.innerHeight;
    const viewportWidth = window.innerWidth;
    const halfH = Math.tan(THREE.MathUtils.degToRad(camera.fov) * 0.5) * SPINE_DEPTH;
    const halfW = halfH * camera.aspect;

    // The slit center mirrors the CSS: max(2.5rem, (100vw - 72rem)/2 + 2.5rem).
    const slitPx = Math.max(40, (viewportWidth - 1152) / 2 + 40);
    const ndcX = (slitPx / viewportWidth) * 2 - 1;

    const spine = tubeMeshRef.current;
    if (spine !== null) {
      spine.position.set(ndcX * halfW, 0, -SPINE_DEPTH + 0.03);
      spine.scale.setScalar((halfH * 2) / 9);
      spine.scale.x *= 1.1;
      spine.scale.z *= 1.1;
    }
    const track = trackMeshRef.current;
    if (track !== null) {
      track.position.set(ndcX * halfW, 0, -SPINE_DEPTH);
      track.scale.setScalar((halfH * 2) / 9);
      track.scale.x *= 0.7;
      track.scale.z *= 0.7;
    }

    // The wire only exists once the sheet is over the hero.
    const isVisible = scrollState.progress > 0.055;
    group.visible = isVisible;
    if (!isVisible) return;

    if (!scrollState.paused) pulseTimeRef.current += delta;
    const pulse = (pulseTimeRef.current % 5.5) / 5.5;

    // The ink dives in at the seam and settles at the 72% line: the wire's tip
    // is the stamping edge the section rings cross.
    const draw = 0.72 * span(scrollState.progress, 0.055, 0.13);
    parts.tubeUniforms.uDraw.value = draw;
    parts.tubeUniforms.uFill.value = 0.5;
    parts.tubeUniforms.uPulse.value = pulse * draw;

    // Rings track their DOM markers and fill as the marker crosses 72svh.
    for (const marker of markerOffsetsRef.current) {
      const ring = ringMeshesRef.current[marker.ring];
      const mesh = parts.rings[marker.ring];
      if (ring === null || ring === undefined || mesh === undefined) continue;
      const rect = marker.element.getBoundingClientRect();
      const centerY = rect.top + rect.height / 2;
      const ndcY = 1 - (centerY / viewportHeight) * 2;
      ring.visible = ndcY > -1.15 && ndcY < 1.15;
      ring.position.set(ndcX * halfW, ndcY * halfH, -SPINE_DEPTH);
      const currentFill = ringFillsRef.current[marker.ring] ?? 0;
      const target = centerY < viewportHeight * 0.72 ? 1 : 0;
      const nextFill = THREE.MathUtils.damp(currentFill, target, 6, delta);
      ringFillsRef.current[marker.ring] = nextFill;
      mesh.uniforms.uDraw.value = 1;
      mesh.uniforms.uFill.value = nextFill;
      mesh.uniforms.uPulse.value = -1;
    }
  });

  return (
    <group ref={groupRef}>
      <mesh ref={trackMeshRef} geometry={parts.tubeGeometry} material={parts.trackMaterial} />
      <mesh ref={tubeMeshRef} geometry={parts.tubeGeometry} material={parts.tubeMaterial} />
      {parts.rings.map((ring, index) => (
        <mesh
          key={`spine-ring-${String(index)}`}
          ref={(mesh) => {
            ringMeshesRef.current[index] = mesh;
          }}
          geometry={ring.geometry}
          material={ring.material}
        />
      ))}
    </group>
  );
};

// ---------------------------------------------------------------------------
// Camera choreography: hero framing, then the pitch-down as the sheet rises.
// ---------------------------------------------------------------------------

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
      <SpineWire />
      <SealPress />
      <EffectComposer multisampling={0}>
        <Bloom intensity={0.55} luminanceThreshold={0.32} mipmapBlur />
        <Vignette darkness={0.55} />
        <Noise opacity={0.045} />
      </EffectComposer>
    </>
  );
};
