"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { Bloom, EffectComposer, Noise, SMAA, Vignette } from "@react-three/postprocessing";
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
  if (uIsRing > 0.5 && uDraw < uWindow.x) discard;
  bool undrawn = uIsRing < 0.5 && t > uDraw;
  // A wire with a track shows the undrawn part as a dim grey continuation on the
  // SAME tube (one line, not two); a plain wire just draws on and discards ahead.
  if (undrawn && uTrackOn < 0.5) discard;
  vec3 col;
  if (undrawn) {
    col = uTrackColor;
  } else {
    col = uBase;
    float fill = max(smoothstep(uFillAt, uFillAt + 0.05, uDraw) * uIsRing, uFill);
    float pulseDistance = abs(t - uPulse);
    float pulse = smoothstep(0.09, 0.0, pulseDistance);
    col += uGlow * (pulse * 1.1 + fill * 0.85);
  }
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

// ---------------------------------------------------------------------------
// The spine: the trace line as a volumetric wire anchored to the document. It
// draws itself downward at a fixed reading head as you scroll (it does not just
// slide with the viewport); the already-inked part scrolls up with the content.
// Section rings pop and fill as the drawing head reaches their DOM markers.
// ---------------------------------------------------------------------------

const SPINE_DEPTH = 6;
const SPINE_LOCAL_HEIGHT = 9;
// The screen line (fraction of viewport height) where the wire is being drawn.
const DRAW_HEAD = 0.66;

const SpineWire = () => {
  const groupRef = useRef<THREE.Group>(null);
  const tubeMeshRef = useRef<THREE.Mesh>(null);
  const ringMeshesRef = useRef<(THREE.Mesh | null)[]>([]);
  const coreMeshesRef = useRef<(THREE.Mesh | null)[]>([]);
  const pulseTimeRef = useRef(0);
  const markerOffsetsRef = useRef<{ element: HTMLElement; ring: number }[]>([]);
  const ringFillsRef = useRef<number[]>([]);

  const parts = useMemo(() => {
    // A tall vertical wire with only the faintest waver so it stays centered in
    // the gutter slit and never touches its edges. uv.x runs top (0) to bottom.
    const points: THREE.Vector3[] = [];
    for (let i = 0; i <= 32; i += 1) {
      const t = i / 32;
      points.push(
        new THREE.Vector3(
          Math.sin(t * 11) * 0.008,
          SPINE_LOCAL_HEIGHT / 2 - t * SPINE_LOCAL_HEIGHT,
          Math.sin(t * 7) * 0.008
        )
      );
    }
    const curve = new THREE.CatmullRomCurve3(points, false, "catmullrom", 0.5);
    // Higher radial + tubular segments so the thin wire holds up under AA.
    const tubeGeometry = new THREE.TubeGeometry(curve, 220, 0.02, 16, false);
    // ONE tube: the green ink fills up to the drawing head, the rest shows as a
    // dim grey track on the same wire (a single line, never two).
    const tube = makeInkMaterial({ window: [0, 1] });
    tube.uniforms.uTrackOn.value = 1;

    // Ring sized to sit inside the slit (its outer edge stays clear of the paper).
    const ringGeometry = new THREE.TorusGeometry(0.058, 0.014, 16, 64);
    // A solid core sphere sits under each ring so the tube passing through never
    // shows an open end or a seam at the junction.
    const coreGeometry = new THREE.SphereGeometry(0.05, 24, 24);
    const rings = Array.from({ length: 6 }, () => {
      const ring = makeInkMaterial({ window: [0, 0], fillAt: 2, isRing: true });
      // Node draws over the wire it rides, never occluded by the tube surface.
      ring.material.depthTest = false;
      ring.material.depthWrite = false;
      const core = new THREE.MeshBasicMaterial({
        color: CORE_COLOR,
        depthTest: false,
        depthWrite: false,
      });
      return { ringMaterial: ring.material, ringUniforms: ring.uniforms, coreMaterial: core };
    });

    return {
      tubeGeometry,
      tubeMaterial: tube.material,
      tubeUniforms: tube.uniforms,
      ringGeometry,
      coreGeometry,
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
      parts.ringGeometry.dispose();
      parts.coreGeometry.dispose();
      for (const ring of parts.rings) {
        ring.ringMaterial.dispose();
        ring.coreMaterial.dispose();
      }
    };
  }, [parts]);

  useFrame((state, delta) => {
    const group = groupRef.current;
    if (group === null) return;
    const camera = state.camera;
    if (!(camera instanceof THREE.PerspectiveCamera)) return;

    // The group is camera-locked so children are placed in view space, but the
    // wire's vertical extent is pinned to document anchors so it scrolls with
    // the page rather than floating at a fixed screen position.
    group.position.copy(camera.position);
    group.quaternion.copy(camera.quaternion);

    const viewportHeight = window.innerHeight;
    const viewportWidth = window.innerWidth;
    const halfH = Math.tan(THREE.MathUtils.degToRad(camera.fov) * 0.5) * SPINE_DEPTH;
    const halfW = halfH * camera.aspect;

    // The slit center mirrors the CSS: max(2.5rem, (100vw - 72rem)/2 + 2.5rem).
    const slitPx = Math.max(40, (viewportWidth - 1152) / 2 + 40);
    const ndcX = (slitPx / viewportWidth) * 2 - 1;
    const worldX = ndcX * halfW;

    // Screen Y -> world Y in the spine plane.
    const toWorldY = (screenY: number) => (1 - (screenY / viewportHeight) * 2) * halfH;

    const isVisible = scrollState.progress > 0.05;
    group.visible = isVisible;
    if (!isVisible) return;

    // Anchor the wire between the top of the paper sheet and the last marker.
    const sheet = document.querySelector<HTMLElement>("[data-sheet]");
    const markers = markerOffsetsRef.current;
    const lastMarker = markers.at(-1)?.element;
    if (sheet === null || lastMarker === undefined) return;
    const topScreenY = sheet.getBoundingClientRect().top;
    const lastRect = lastMarker.getBoundingClientRect();
    const bottomScreenY = lastRect.top + lastRect.height / 2;
    const headScreenY = viewportHeight * DRAW_HEAD;

    const topWorldY = toWorldY(topScreenY);

    if (!scrollState.paused) pulseTimeRef.current += delta;
    const pulse = (pulseTimeRef.current % 5) / 5;

    // One tube spans the whole page (sheet top to the very bottom). The green ink
    // fills to the reading head but never past the approve node, and the rest of
    // the tube shows its grey track, so the gutter always holds a single wire.
    const end = document.querySelector<HTMLElement>("[data-spine-end]");
    const endScreenY = end === null ? bottomScreenY : end.getBoundingClientRect().top;
    const endWorldY = toWorldY(endScreenY);
    const pageSpan = Math.max(endScreenY - topScreenY, 1);
    const headUv = clamp01((headScreenY - topScreenY) / pageSpan);
    const approveUv = clamp01((bottomScreenY - topScreenY) / pageSpan);
    const drawFrac = Math.min(headUv, approveUv);
    const fullSpanWorld = topWorldY - endWorldY;

    const tube = tubeMeshRef.current;
    if (tube !== null && fullSpanWorld > 0) {
      tube.position.set(worldX, (topWorldY + endWorldY) / 2, -SPINE_DEPTH);
      tube.scale.set(1.15, fullSpanWorld / SPINE_LOCAL_HEIGHT, 1.15);
      parts.tubeUniforms.uDraw.value = drawFrac;
      parts.tubeUniforms.uFill.value = 0.55;
      parts.tubeUniforms.uPulse.value = pulse * drawFrac;
    }

    // Rings + cores ride their DOM markers; they appear only once the drawing
    // head has reached them, then fill in.
    for (const marker of markers) {
      const ring = ringMeshesRef.current[marker.ring];
      const core = coreMeshesRef.current[marker.ring];
      const mesh = parts.rings[marker.ring];
      if (ring === null || ring === undefined || mesh === undefined) continue;
      const rect = marker.element.getBoundingClientRect();
      const centerY = rect.top + rect.height / 2;
      const worldY = toWorldY(centerY);
      const isReached = centerY <= headScreenY + 4;
      const isOnScreen = centerY > -40 && centerY < viewportHeight + 40;
      ring.visible = isReached && isOnScreen;
      ring.position.set(worldX, worldY, -SPINE_DEPTH + 0.01);
      if (core !== null && core !== undefined) {
        core.visible = isReached && isOnScreen;
        core.position.set(worldX, worldY, -SPINE_DEPTH);
      }
      const currentFill = ringFillsRef.current[marker.ring] ?? 0;
      const target = isReached ? 1 : 0;
      const nextFill = THREE.MathUtils.damp(currentFill, target, 7, delta);
      ringFillsRef.current[marker.ring] = nextFill;
      mesh.ringUniforms.uDraw.value = 1;
      mesh.ringUniforms.uFill.value = nextFill;
      mesh.ringUniforms.uPulse.value = -1;
    }
  });

  return (
    <group ref={groupRef}>
      <mesh ref={tubeMeshRef} geometry={parts.tubeGeometry} material={parts.tubeMaterial} />
      {parts.rings.map((ring, index) => (
        <group key={`spine-node-${String(index)}`}>
          <mesh
            ref={(mesh) => {
              coreMeshesRef.current[index] = mesh;
            }}
            geometry={parts.coreGeometry}
            material={ring.coreMaterial}
            renderOrder={2}
          />
          <mesh
            ref={(mesh) => {
              ringMeshesRef.current[index] = mesh;
            }}
            geometry={parts.ringGeometry}
            material={ring.ringMaterial}
            renderOrder={3}
          />
        </group>
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
      {/* multisampling = WebGL2 MSAA on the geometry pass; SMAA cleans the
          remaining edges the thin bright wire leaves after bloom. 4x MSAA is
          plenty next to SMAA, half the cost of the 8x default. */}
      <EffectComposer multisampling={4}>
        <Bloom intensity={0.5} luminanceThreshold={0.34} luminanceSmoothing={0.4} mipmapBlur />
        <Vignette darkness={0.55} />
        <Noise opacity={0.045} />
        <SMAA />
      </EffectComposer>
    </>
  );
};
