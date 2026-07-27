import { useEffect, useRef, useState, useMemo, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { PerspectiveCamera, Environment, Lightformer } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import * as THREE from 'three';

/**
 * Crystal Chain Hero Animation (right half only)
 *
 * Two large, interlocked crystal-glass torus links.
 * - Independent slow rotation per link + shared gentle downward drift.
 * - Camera slowly pushes in, drifts for cinematic parallax, then travels
 *   through one link's glass body before settling back to the hero view.
 * - Subtle mouse parallax only (no orbit/drag controls).
 * - Rendering pauses when the tab is hidden.
 */

const BG = '#05070A';
const LINK_RADIUS = 1.15;
const LINK_TUBE = 0.34;

// One full push-in / travel-through-glass / settle-back cycle, in seconds.
const CYCLE_SECONDS = 32;

function smoothWindow(t: number, start: number, end: number) {
  if (t <= start) return 0;
  if (t >= end) return 1;
  return THREE.MathUtils.smootherstep(t, start, end);
}

interface ChainLinkProps {
  position: [number, number, number];
  rotation: [number, number, number];
  spinSpeed: number;
  spinAxis: 'x' | 'y';
}

function ChainLink({ position, rotation, spinSpeed, spinAxis }: ChainLinkProps) {
  const groupRef = useRef<THREE.Group>(null);
  const phase = useMemo(() => Math.random() * Math.PI * 2, []);

  useFrame(({ clock }) => {
    const g = groupRef.current;
    if (!g) return;
    const t = clock.getElapsedTime();

    // Independent, very slow rotation around the link's own axis.
    if (spinAxis === 'x') {
      g.rotation.x = rotation[0] + t * spinSpeed;
    } else {
      g.rotation.y = rotation[1] + t * spinSpeed;
    }

    // Tiny perpetual micro-movement so it never reads as static.
    g.rotation.z = rotation[2] + Math.sin(t * 0.35 + phase) * 0.015;
    g.position.y = position[1] + Math.sin(t * 0.22 + phase) * 0.02;
  });

  return (
    <group ref={groupRef} position={position} rotation={rotation}>
      <mesh castShadow receiveShadow>
        <torusGeometry args={[LINK_RADIUS, LINK_TUBE, 64, 160]} />
        <meshPhysicalMaterial
          color="#eaf3ff"
          transmission={1}
          thickness={1.3}
          roughness={0.045}
          metalness={0}
          ior={1.55}
          clearcoat={1}
          clearcoatRoughness={0.06}
          iridescence={0.55}
          iridescenceIOR={1.3}
          iridescenceThicknessRange={[120, 420]}
          attenuationColor="#bfe0ff"
          attenuationDistance={1.4}
          envMapIntensity={1.6}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
}

function ChainScene() {
  const cameraRef = useRef<THREE.PerspectiveCamera>(null);
  const driftRef = useRef<THREE.Group>(null);

  // Mouse target, damped toward smoothly (never snaps).
  const mouseTarget = useRef({ x: 0, y: 0 });
  const mouseDamped = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseTarget.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouseTarget.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // World position of link B's center, updated each frame as the group drifts.
  const linkBOffset = new THREE.Vector3(LINK_RADIUS * 0.9, 0, 0.1);
  const linkBWorld = useRef(new THREE.Vector3());

  useFrame(({ clock }, delta) => {
    const camera = cameraRef.current;
    const drift = driftRef.current;
    if (!camera || !drift) return;

    const t = clock.getElapsedTime();

    // Damp the mouse value so parallax is smooth, never sudden.
    mouseDamped.current.x = THREE.MathUtils.damp(mouseDamped.current.x, mouseTarget.current.x, 2.2, delta);
    mouseDamped.current.y = THREE.MathUtils.damp(mouseDamped.current.y, mouseTarget.current.y, 2.2, delta);

    // Shared vertical drift: a slow, heavy "floating underwater" breath,
    // biased downward, that eases back up rather than resetting/jumping.
    drift.position.y = -0.35 + Math.sin(t * 0.055) * 0.55;
    drift.rotation.z = Math.sin(t * 0.05) * 0.04;

    linkBWorld.current.copy(linkBOffset).add(drift.position);

    // --- Camera arc, looped seamlessly over CYCLE_SECONDS ---
    const cycle = (t % CYCLE_SECONDS) / CYCLE_SECONDS; // 0..1

    // Base hero framing.
    const homePos = new THREE.Vector3(0, 0.3, 6.4);
    const homeFov = 42;
    // Mid push-in, with occasional cinematic left/right shift baked into
    // the keyframe via a slow independent sine (not user-driven).
    const cinematicShift = Math.sin(t * 0.07) * 0.5;
    const pushPos = new THREE.Vector3(cinematicShift, 0.15, 3.5);
    const pushFov = 40;
    // Deep inside link B's glass body.
    const insidePos = linkBWorld.current.clone().add(new THREE.Vector3(0, 0, 0.18));
    const insideFov = 72;

    const wPush = smoothWindow(cycle, 0.0, 0.55);
    const wInside = smoothWindow(cycle, 0.55, 0.8);
    const wReturn = smoothWindow(cycle, 0.8, 1.0);

    const pos = new THREE.Vector3().copy(homePos).lerp(pushPos, wPush);
    pos.lerp(insidePos, wInside);
    pos.lerp(homePos, wReturn);

    let fov = THREE.MathUtils.lerp(homeFov, pushFov, wPush);
    fov = THREE.MathUtils.lerp(fov, insideFov, wInside);
    fov = THREE.MathUtils.lerp(fov, homeFov, wReturn);

    const lookAt = new THREE.Vector3(0, drift.position.y * 0.3, 0).lerp(linkBWorld.current, wInside);

    // Subtle mouse parallax, faded out while traveling through the glass
    // so the "inside crystal" moment stays calm and centered.
    const parallaxStrength = 0.35 * (1 - wInside);
    pos.x += mouseDamped.current.x * parallaxStrength;
    pos.y += mouseDamped.current.y * parallaxStrength * 0.6;

    // Links themselves react a hair to the cursor too.
    drift.rotation.x = mouseDamped.current.y * 0.03;
    drift.rotation.y += (mouseDamped.current.x * 0.02 - drift.rotation.y) * 0.02;

    camera.position.copy(pos);
    camera.fov = fov;
    camera.updateProjectionMatrix();
    camera.lookAt(lookAt);
  });

  return (
    <>
      <PerspectiveCamera ref={cameraRef} makeDefault position={[0, 0.3, 6.4]} fov={42} near={0.01} far={50} />

      {/* Key light */}
      <directionalLight position={[5, 6, 5]} intensity={1.4} castShadow />
      {/* Cool blue fill / rim */}
      <directionalLight position={[-6, 2, -4]} intensity={0.8} color="#7FDBFF" />
      <directionalLight position={[0, -3, -5]} intensity={0.5} color="#dfe9ff" />
      <ambientLight intensity={0.18} />

      {/* Studio reflections for realistic glass refraction/highlights */}
      <Environment preset="studio" />
      <Lightformer
        intensity={0.6}
        rotation-x={Math.PI / 2}
        position={[0, 5, -8]}
        scale={[10, 10, 1]}
        color="#7FDBFF"
      />
      <Lightformer
        intensity={0.35}
        position={[4, -2, 3]}
        scale={[4, 4, 1]}
        color="#ffe9d6"
      />

      <group ref={driftRef}>
        <ChainLink
          position={[0, 0, 0]}
          rotation={[0, 0, 0]}
          spinSpeed={0.045}
          spinAxis="y"
        />
        <ChainLink
          position={[LINK_RADIUS * 0.9, 0, 0.1]}
          rotation={[0, Math.PI / 2, 0]}
          spinSpeed={-0.035}
          spinAxis="x"
        />
      </group>
    </>
  );
}

export function CrystalChain() {
  const [active, setActive] = useState(!document.hidden);

  // Pause rendering entirely when the tab isn't visible.
  useEffect(() => {
    const handleVisibility = () => setActive(!document.hidden);
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, []);

  return (
    <div className="w-full h-full bg-gradient-to-b from-[#05070A] to-[#0D1117]">
      <Suspense fallback={<div className="w-full h-full bg-[#05070A]" />}>
        <Canvas
          shadows
          dpr={[1, 1.5]}
          frameloop={active ? 'always' : 'never'}
          gl={{
            antialias: true,
            alpha: true,
            powerPreference: 'high-performance',
          }}
          onCreated={(state) => {
            state.gl.setClearColor(0x05070a, 0);
          }}
        >
          <ChainScene />
          <EffectComposer>
            <Bloom
              luminanceThreshold={0.25}
              luminanceSmoothing={0.9}
              intensity={0.55}
              mipmapBlur
            />
          </EffectComposer>
        </Canvas>
      </Suspense>
    </div>
  );
}
