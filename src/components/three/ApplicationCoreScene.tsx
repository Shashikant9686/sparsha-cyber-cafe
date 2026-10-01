'use client';

import React, { useMemo, useRef, useState, useSyncExternalStore } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import HeroDocumentStack from '@/components/ui/HeroDocumentStack';

/**
 * "Application Core" — the premium 3D hero centerpiece.
 * Layered translucent panes (an application moving through stages) with a
 * tilted champagne orbital ring and small emerald nodes orbiting at a
 * different angle, per the approved design brief. Replaces the Phase 1
 * VerificationSealScene prototype (the "joystick"-looking object).
 *
 * Built with @react-three/fiber + drei instead of vanilla Three.js (Phase 1)
 * — React owns the scene graph and cleans it up automatically on unmount,
 * which is less manual lifecycle code to maintain than Phase 1 had.
 *
 * NOT run through a real npm install/build in the environment this was
 * written in — verify with `npm run build` and in the browser before
 * trusting it.
 */

const GOLD = '#c9a227';
const GOLD_LIGHT = '#e8c65a';
const CHAMPAGNE = '#8a6d3a';
const GREEN = '#155c3e';
const GREEN_LIGHT = '#3fae7e';
const PANE = '#f2f1ec';

function prefersReducedMotion() {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function isWebGLAvailable() {
  try {
    const canvas = document.createElement('canvas');
    return !!(canvas.getContext('webgl2') || canvas.getContext('webgl'));
  } catch {
    return false;
  }
}

let webglSupportCache: boolean | null = null;
const subscribeNoop = () => () => {};
const getWebGLSnapshot = () => {
  if (webglSupportCache === null) webglSupportCache = isWebGLAvailable();
  return webglSupportCache;
};
const getServerSnapshot = () => null;

function easeOutCubic(t: number) {
  return 1 - Math.pow(1 - t, 3);
}

// --- The layered panes: a tapering stack, each slightly smaller and offset,
// reading as distinct stages rather than a solid block. -------------------
function Panes() {
  const layers = useMemo(
    () => [
      { y: 0, scale: 1, rot: 0.02 },
      { y: 0.09, scale: 0.94, rot: -0.03 },
      { y: 0.18, scale: 0.88, rot: 0.025 },
      { y: 0.27, scale: 0.82, rot: -0.02 },
      { y: 0.36, scale: 0.76, rot: 0.015 },
    ],
    []
  );

  return (
    <group>
      {layers.map((layer, i) => (
        <mesh key={i} position={[0, layer.y, 0]} rotation={[0, layer.rot, 0]} scale={[layer.scale, 1, layer.scale]}>
          <boxGeometry args={[1.8, 0.04, 1.3]} />
          <meshStandardMaterial color={PANE} roughness={0.85} metalness={0.04} transparent opacity={0.93} />
        </mesh>
      ))}
    </group>
  );
}

// --- The tilted orbital ring: encircles the stack at an angle, not sitting
// flat on top (that flat-on-top look was the old "joystick hat" problem). It
// counter-rotates slowly against the stack once idle. ---------------------
function OrbitalRing({ reducedMotion }: { reducedMotion: boolean }) {
  const ringRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (reducedMotion || !ringRef.current) return;
    ringRef.current.rotation.z -= delta * 0.12;
  });

  return (
    <group ref={ringRef} position={[0, 0.3, 0]} rotation={[1.25, 0, 0.38]}>
      <mesh>
        <torusGeometry args={[0.95, 0.045, 16, 64]} />
        <meshStandardMaterial color={CHAMPAGNE} roughness={0.25} metalness={0.85} />
      </mesh>
    </group>
  );
}

// --- Small emerald nodes orbiting at a wider radius, a different plane than
// the ring, each at its own speed/phase so they don't feel mechanical. ----
function OrbitingNodes({ reducedMotion }: { reducedMotion: boolean }) {
  const groupRef = useRef<THREE.Group>(null);
  const nodes = useMemo(
    () => [
      { radius: 1.35, speed: 0.22, phase: 0, size: 0.055 },
      { radius: 1.55, speed: -0.16, phase: 2.1, size: 0.045 },
      { radius: 1.25, speed: 0.19, phase: 4.2, size: 0.05 },
    ],
    []
  );
  const refs = useRef<(THREE.Mesh | null)[]>([]);

  useFrame((state) => {
    if (reducedMotion) return;
    const t = state.clock.elapsedTime;
    nodes.forEach((n, i) => {
      const mesh = refs.current[i];
      if (!mesh) return;
      const angle = t * n.speed + n.phase;
      mesh.position.set(Math.cos(angle) * n.radius, 0.3 + Math.sin(angle * 0.7) * 0.08, Math.sin(angle) * n.radius);
    });
  });

  return (
    <group ref={groupRef}>
      {nodes.map((n, i) => (
        <mesh
          key={i}
          ref={(el) => {
            refs.current[i] = el;
          }}
          position={[n.radius, 0.3, 0]}
        >
          <sphereGeometry args={[n.size, 20, 20]} />
          <meshStandardMaterial color={GREEN} roughness={0.3} metalness={0.4} emissive={GREEN_LIGHT} emissiveIntensity={0.25} />
        </mesh>
      ))}
    </group>
  );
}

// --- The whole composition: entrance animation + idle pointer-follow tilt.
function Core({ reducedMotion, onSettled }: { reducedMotion: boolean; onSettled: () => void }) {
  const outerRef = useRef<THREE.Group>(null);
  const startTime = useRef<number | null>(null);
  const settledRef = useRef(reducedMotion);
  const entranceDurationS = 1.1;

  useFrame((state) => {
    const group = outerRef.current;
    if (!group) return;

    if (startTime.current === null) startTime.current = state.clock.elapsedTime;
    const elapsed = state.clock.elapsedTime - (startTime.current ?? state.clock.elapsedTime); 
    if (!settledRef.current) {
      const t = Math.min(elapsed / entranceDurationS, 1);
      const eased = easeOutCubic(t);
      group.position.y = -0.4 * (1 - eased);
      group.scale.setScalar(0.85 + 0.15 * eased);
      if (t >= 1) {
        settledRef.current = true;
        group.position.y = 0;
        group.scale.setScalar(1);
        onSettled();
      }
      return;
    }

    if (reducedMotion) return;

    // Gentle pointer-follow tilt, damped toward the cursor position.
    const targetX = state.pointer.y * 0.12;
    const targetY = state.pointer.x * 0.18;
    group.rotation.x = THREE.MathUtils.lerp(group.rotation.x, targetX, 0.04);
    group.rotation.y = THREE.MathUtils.lerp(group.rotation.y, targetY, 0.04);
  });

  return (
    <group ref={outerRef}>
      <Panes />
      <OrbitalRing reducedMotion={reducedMotion} />
      <OrbitingNodes reducedMotion={reducedMotion} />
    </group>
  );
}

function Scene({ reducedMotion, onReady }: { reducedMotion: boolean; onReady: () => void }) {
  const [settled, setSettled] = useState(false);

  return (
    <>
      <ambientLight color="#fff4e0" intensity={0.5} />
      <directionalLight color="#ffffff" position={[3, 5, 2]} intensity={1.05} />
      <pointLight color={GOLD_LIGHT} position={[0, 2, 1.6]} intensity={14} distance={10} />
      <pointLight color={CHAMPAGNE} position={[-2, 0.8, -1.8]} intensity={6} distance={9} />

      <Core
        reducedMotion={reducedMotion}
        onSettled={() => {
          setSettled(true);
          if (!reducedMotion) onReady();
        }}
      />

      <OrbitControls
        enableZoom={false}
        enablePan={false}
        enableDamping
        dampingFactor={0.08}
        minPolarAngle={Math.PI / 3.4}
        maxPolarAngle={Math.PI / 2.05}
        autoRotate={!reducedMotion && settled}
        autoRotateSpeed={0.5}
      />
    </>
  );
}

export default function ApplicationCoreScene() {
  const webglSupported = useSyncExternalStore(subscribeNoop, getWebGLSnapshot, getServerSnapshot);
  const [canvasReady, setCanvasReady] = useState(false);
  const reducedMotion = prefersReducedMotion();
  const isReady = webglSupported === true && canvasReady;

  return (
    <div className="relative w-full h-[320px] sm:h-[380px] lg:h-[460px] rounded-panel overflow-hidden">
      {!isReady && (
        <div className="absolute inset-0">
          <HeroDocumentStack />
        </div>
      )}
      {webglSupported && (
        <div
          role="img"
          aria-label="Interactive 3D 'Application Core' — layered application panes with an orbiting verification ring. Drag to rotate."
          className={`absolute inset-0 transition-opacity duration-500 ${isReady ? 'opacity-100' : 'opacity-0'}`}
        >
          <Canvas
            camera={{ position: [2.4, 1.3, 2.9], fov: 36 }}
            dpr={[1, 2]}
            gl={{ antialias: true, alpha: true }}
            onCreated={() => {
              if (reducedMotion) setCanvasReady(true);
            }}
          >
            <Scene reducedMotion={reducedMotion} onReady={() => setCanvasReady(true)} />
          </Canvas>
        </div>
      )}
    </div>
  );
}