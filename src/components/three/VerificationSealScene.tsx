'use client';

import React, { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import HeroDocumentStack from '@/components/ui/HeroDocumentStack';

/**
 * Phase 1 prototype: a draggable Three.js scene for the homepage hero.
 * Falls back to HeroDocumentStack when WebGL is unavailable, and respects
 * prefers-reduced-motion (no entrance animation / auto-rotate).
 */

const SAFFRON = 0xe8620a;
const SAFFRON_LIGHT = 0xffb066;
const GREEN = 0x1f6d42;
const GREEN_LIGHT = 0x4fbf88;
const INK = 0x16150f;
const INK_SOFT = 0x211f17;
const IVORY = 0xfaf6ec;

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

// --- WebGL support as an external, client-only value -------------------------
// null = unknown (server render / hydration), true/false = real client value.
// Cached so we only ever create one throwaway canvas context.
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

function easeOutBack(t: number) {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
}

function buildDocumentStack(): THREE.Group {
  const group = new THREE.Group();
  const layerCount = 6;
  const paperMat = new THREE.MeshStandardMaterial({ color: IVORY, roughness: 0.92, metalness: 0.02 });
  const jitter = [
    { x: 0.015, z: -0.02, r: 0.01 },
    { x: -0.02, z: 0.015, r: -0.015 },
    { x: 0.01, z: 0.025, r: 0.02 },
    { x: -0.015, z: -0.01, r: -0.01 },
    { x: 0.02, z: -0.02, r: 0.015 },
    { x: -0.01, z: 0.01, r: -0.02 },
  ];

  for (let i = 0; i < layerCount; i++) {
    const geo = new THREE.BoxGeometry(2.1, 0.055, 1.5);
    const mesh = new THREE.Mesh(geo, paperMat);
    const j = jitter[i % jitter.length];
    mesh.position.set(j.x, i * 0.058, j.z);
    mesh.rotation.y = j.r;
    group.add(mesh);
  }

  const ribbonGeo = new THREE.BoxGeometry(0.35, 0.02, 1.56);
  const ribbonMat = new THREE.MeshStandardMaterial({ color: SAFFRON, roughness: 0.5, metalness: 0.1 });
  const ribbon = new THREE.Mesh(ribbonGeo, ribbonMat);
  ribbon.position.set(0.85, layerCount * 0.058 + 0.01, 0);
  group.add(ribbon);

  return group;
}

function buildSeal(): THREE.Group {
  const group = new THREE.Group();

  const ringMat = new THREE.MeshStandardMaterial({ color: SAFFRON, roughness: 0.35, metalness: 0.6 });
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.56, 0.09, 16, 48), ringMat);
  ring.rotation.x = Math.PI / 2;
  group.add(ring);

  const faceMat = new THREE.MeshStandardMaterial({ color: INK, roughness: 0.55, metalness: 0.25 });
  const face = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 0.14, 48), faceMat);
  group.add(face);

  const emblemMat = new THREE.MeshStandardMaterial({ color: GREEN, roughness: 0.4, metalness: 0.35 });
  const emblem = new THREE.Mesh(new THREE.TorusGeometry(0.26, 0.045, 12, 32), emblemMat);
  emblem.rotation.x = Math.PI / 2;
  emblem.position.y = 0.075;
  group.add(emblem);

  const dotMat = new THREE.MeshStandardMaterial({ color: GREEN_LIGHT, roughness: 0.4, metalness: 0.3 });
  const dot = new THREE.Mesh(new THREE.SphereGeometry(0.07, 24, 24), dotMat);
  dot.position.y = 0.09;
  group.add(dot);

  const handleMat = new THREE.MeshStandardMaterial({ color: INK_SOFT, roughness: 0.6, metalness: 0.2 });
  const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.09, 0.5, 24), handleMat);
  stem.position.y = 0.32;
  group.add(stem);

  const grip = new THREE.Mesh(new THREE.SphereGeometry(0.16, 24, 24), handleMat);
  grip.position.y = 0.58;
  grip.scale.set(1, 0.7, 1);
  group.add(grip);

  return group;
}

export default function VerificationSealScene() {
  const containerRef = useRef<HTMLDivElement>(null);
  const webglSupported = useSyncExternalStore(subscribeNoop, getWebGLSnapshot, getServerSnapshot);
  const [sceneReady, setSceneReady] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !webglSupported) return;

    const reducedMotion = prefersReducedMotion();

    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 50);
    camera.position.set(2.3, 1.7, 2.9);
    camera.lookAt(0, 0.35, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    scene.add(new THREE.AmbientLight(0xfff4e6, 0.6));

    const key = new THREE.DirectionalLight(0xffffff, 1.1);
    key.position.set(3, 5, 2);
    scene.add(key);

    const saffronLight = new THREE.PointLight(SAFFRON_LIGHT, 18, 12);
    saffronLight.position.set(0, 2.2, 1.6);
    scene.add(saffronLight);

    const greenRim = new THREE.PointLight(GREEN_LIGHT, 8, 10);
    greenRim.position.set(-2.2, 1, -2);
    scene.add(greenRim);

    const base = new THREE.Mesh(
      new THREE.CylinderGeometry(1.7, 1.7, 0.05, 48),
      new THREE.MeshStandardMaterial({ color: INK_SOFT, roughness: 0.85, metalness: 0.1 })
    );
    base.position.y = -0.03;
    scene.add(base);

    const stack = buildDocumentStack();
    scene.add(stack);

    const stackTopY = 6 * 0.058;
    const sealRestY = stackTopY + 0.16;

    const seal = buildSeal();
    const sealStartY = reducedMotion ? sealRestY : sealRestY + 1.8;
    seal.position.set(0, sealStartY, 0);
    seal.rotation.y = reducedMotion ? 0 : -0.6;
    scene.add(seal);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(0, 0.35, 0);
    controls.enableZoom = false;
    controls.enablePan = false;
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.minPolarAngle = Math.PI / 3.4;
    controls.maxPolarAngle = Math.PI / 2.05;
    controls.autoRotate = !reducedMotion;
    controls.autoRotateSpeed = 0.6;
    container.tabIndex = 0;
    controls.listenToKeyEvents(container);

    let resumeTimer: ReturnType<typeof setTimeout> | null = null;
    const handleStart = () => {
      controls.autoRotate = false;
      if (resumeTimer) clearTimeout(resumeTimer);
    };
    const handleEnd = () => {
      if (reducedMotion) return;
      if (resumeTimer) clearTimeout(resumeTimer);
      resumeTimer = setTimeout(() => {
        controls.autoRotate = true;
      }, 2600);
    };
    controls.addEventListener('start', handleStart);
    controls.addEventListener('end', handleEnd);

    const resize = () => {
      const { clientWidth, clientHeight } = container;
      if (clientWidth === 0 || clientHeight === 0) return;
      camera.aspect = clientWidth / clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(clientWidth, clientHeight, false);
    };
    resize();
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(container);

    const startTime = performance.now();
    const entranceDurationMs = 1100;
    let animationFrameId = 0;
    let entranceDone = reducedMotion;
    let announcedReady = false;

    const tick = (now: number) => {
      animationFrameId = requestAnimationFrame(tick);
      const elapsed = now - startTime;

      if (!entranceDone) {
        const t = Math.min(elapsed / entranceDurationMs, 1);
        const eased = easeOutBack(t);
        seal.position.y = sealStartY + (sealRestY - sealStartY) * easeOutCubic(t);
        seal.rotation.y = -0.6 * (1 - eased);
        if (t >= 1) {
          entranceDone = true;
          seal.position.y = sealRestY;
          seal.rotation.y = 0;
        }
      } else if (!reducedMotion) {
        seal.position.y = sealRestY + Math.sin(elapsed * 0.0009) * 0.02;
      }

      controls.update();
      renderer.render(scene, camera);

      // Tell React the scene is on screen (from inside the frame callback,
      // not synchronously in the effect body).
      if (!announcedReady) {
        announcedReady = true;
        setSceneReady(true);
      }
    };
    animationFrameId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(animationFrameId);
      if (resumeTimer) clearTimeout(resumeTimer);
      controls.removeEventListener('start', handleStart);
      controls.removeEventListener('end', handleEnd);
      controls.dispose();
      resizeObserver.disconnect();
      scene.traverse((obj) => {
        if (obj instanceof THREE.Mesh) {
          obj.geometry.dispose();
          if (Array.isArray(obj.material)) {
            obj.material.forEach((m) => m.dispose());
          } else {
            obj.material.dispose();
          }
        }
      });
      renderer.dispose();
      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [webglSupported]);

  const isReady = webglSupported === true && sceneReady;

  return (
    <div className="relative w-full h-[320px] sm:h-[380px] lg:h-[440px] rounded-panel overflow-hidden">
      {!isReady && (
        <div className="absolute inset-0">
          <HeroDocumentStack />
        </div>
      )}
      <div
        ref={containerRef}
        role="img"
        aria-label="Interactive 3D scene of a verification seal settling onto a stack of application documents. Drag or use arrow keys to rotate."
        className={`absolute inset-0 outline-none focus-visible:ring-2 focus-visible:ring-saffron/70 rounded-panel transition-opacity duration-500 ${
          isReady ? 'opacity-100 cursor-grab active:cursor-grabbing' : 'opacity-0'
        }`}
      />
    </div>
  );
}