import { useEffect, useRef, useState, useMemo, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { PerspectiveCamera, Environment, Lightformer } from '@react-three/drei';
import { EffectComposer, Bloom, DepthOfField } from '@react-three/postprocessing';
import * as THREE from 'three';

/**
 * Crystal Chain Hero Animation (right half only)
 *
 * Macro-jewelry-photography look: a diagonal run of thick, chunky glass
 * links, two of them large and in sharp focus, with the chain cropped
 * and softly defocused at both ends (shallow depth of field). Colorful
 * streaky reflections come from a "light stage" of colored panels, plus
 * a few tight point lights for sharp starburst sparkle highlights.
 */

const LINK_RADIUS = 0.95;
const LINK_TUBE = 0.4; // chunky profile, closer to the reference photo

// One full push-in / travel-through-glass / settle-back cycle, in seconds.
const CYCLE_SECONDS = 32;

function smoothWindow(t: number, start: number, end: number) {
  if (t <= start) return 0;
  if (t >= end) return 1;
  return THREE.MathUtils.smootherstep(t, start, end);
}

const GLASS_PROPS = {
  color: '#f4f8ff',
  transmission: 1,
  thickness: 1.6,
  roughness: 0.02,
  metalness: 0,
  ior: 1.5,
  clearcoat: 1,
  clearcoatRoughness: 0.02,
  iridescence: 0.7,
  iridescenceIOR: 1.25,
  iridescenceThicknessRange: [100, 500] as [number, number],
  attenuationColor: '#d9ecff',
  attenuationDistance: 1.1,
  envMapIntensity: 2.2,
  side: THREE.DoubleSide,
};

interface ChainLinkProps {
  position: [number, number, number];
  rotation: [number, number, number];
  spinSpeed: number;
  spinAxis: 'x' | 'y';
  scale?: number;
}

function ChainLink({ position, rotation, spinSpeed, spinAxis, scale = 1 }: ChainLinkProps) {
  const groupRef = useRef<THREE.Group>(null);
  const phase = useMemo(() => Math.random() * Math.PI * 2, []);

  useFrame(({ clock }) => {
    const g = groupRef.current;
    if (!g) return;
    const t = clock.getElapsedTime();

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
    <group ref={groupRef} position={position} rotation={rotation} scale={scale}>
      <mesh castShadow receiveShadow>
        <torusGeometry args={[LINK_RADIUS, LINK_TUBE, 64, 160]} />
        <meshPhysicalMaterial {...GLASS_PROPS} />
      </mesh>
    </group>
  );
}

function ChainScene() {
  const cameraRef = useRef<THREE.PerspectiveCamera>(null);
  const driftRef = useRef<THREE.Group>(null);

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

  const linkBOffset = new THREE.Vector3(LINK_RADIUS * 0.85, 0, 0.1);
  const linkBWorld = useRef(new THREE.Vector3());

  // Chain rests anchored toward the right edge of the full-bleed screen,
  // then travels toward center as the camera zooms into the glass.
  const GROUP_X_HOME = 2.7;
  const GROUP_X_PUSH = 1.3;
  const GROUP_X_INSIDE = 0;

  useFrame(({ clock }, delta) => {
    const camera = cameraRef.current;
    const drift = driftRef.current;
    if (!camera || !drift) return;

    const t = clock.getElapsedTime();

    mouseDamped.current.x = THREE.MathUtils.damp(mouseDamped.current.x, mouseTarget.current.x, 2.2, delta);
    mouseDamped.current.y = THREE.MathUtils.damp(mouseDamped.current.y, mouseTarget.current.y, 2.2, delta);

    // --- Cycle windows, computed first since the group's horizontal
    // travel (right -> center) depends on them, seamlessly looped. ---
    const cycle = (t % CYCLE_SECONDS) / CYCLE_SECONDS;
    const wPush = smoothWindow(cycle, 0.0, 0.55);
    const wInside = smoothWindow(cycle, 0.55, 0.8);
    const wReturn = smoothWindow(cycle, 0.8, 1.0);

    // Shared vertical drift: slow, heavy "floating underwater" breath,
    // biased downward, easing back up rather than resetting/jumping.
    drift.position.y = -0.3 + Math.sin(t * 0.055) * 0.5;
    drift.rotation.z = -0.38 + Math.sin(t * 0.05) * 0.03; // diagonal composition

    // Right-anchored at rest -> drifts toward center as it zooms in ->
    // eases back out to the right for a seamless loop. One continuous,
    // fluid horizontal + rotational + zoom motion.
    let groupX = GROUP_X_HOME;
    groupX = THREE.MathUtils.lerp(groupX, GROUP_X_PUSH, wPush);
    groupX = THREE.MathUtils.lerp(groupX, GROUP_X_INSIDE, wInside);
    groupX = THREE.MathUtils.lerp(groupX, GROUP_X_HOME, wReturn);
    drift.position.x = groupX;

    linkBWorld.current.copy(linkBOffset).applyEuler(drift.rotation).add(drift.position);

    // --- Camera arc, looped seamlessly over CYCLE_SECONDS ---
    const homePos = new THREE.Vector3(0, 0.15, 5.2);
    const homeFov = 36;
    const cinematicShift = Math.sin(t * 0.07) * 0.3;
    const pushPos = new THREE.Vector3(cinematicShift, 0.1, 3.0);
    const pushFov = 34;
    const insidePos = linkBWorld.current.clone().add(new THREE.Vector3(0, 0, 0.16));
    const insideFov = 72;

    const pos = new THREE.Vector3().copy(homePos).lerp(pushPos, wPush);
    pos.lerp(insidePos, wInside);
    pos.lerp(homePos, wReturn);

    let fov = THREE.MathUtils.lerp(homeFov, pushFov, wPush);
    fov = THREE.MathUtils.lerp(fov, insideFov, wInside);
    fov = THREE.MathUtils.lerp(fov, homeFov, wReturn);

    // At rest, look slightly toward the right-anchored chain; as it zooms
    // in, the look target eases onto the glass surface it's traveling into.
    const restLookAt = new THREE.Vector3(GROUP_X_HOME * 0.35, drift.position.y * 0.3, 0);
    const lookAt = restLookAt.lerp(linkBWorld.current, wInside + wPush * 0.3);

    const parallaxStrength = 0.3 * (1 - wInside);
    pos.x += mouseDamped.current.x * parallaxStrength;
    pos.y += mouseDamped.current.y * parallaxStrength * 0.6;

    drift.rotation.x = mouseDamped.current.y * 0.025;

    camera.position.copy(pos);
    camera.fov = fov;
    camera.updateProjectionMatrix();
    camera.lookAt(lookAt);
  });

  return (
    <>
      <PerspectiveCamera ref={cameraRef} makeDefault position={[0, 0.15, 5.2]} fov={36} near={0.01} far={50} />

      {/* Key + rim lighting */}
      <directionalLight position={[4, 5, 4]} intensity={1.6} castShadow />
      <directionalLight position={[-5, 2, -3]} intensity={0.9} color="#7FDBFF" />
      <directionalLight position={[0, -3, -4]} intensity={0.5} color="#e9d9ff" />
      <ambientLight intensity={0.12} />

      {/* Tight, very bright points for sharp starburst sparkle highlights */}
      <pointLight position={[1.1, 1.4, 2.2]} intensity={12} distance={4} color="#ffffff" />
      <pointLight position={[-1.3, -0.6, 1.8]} intensity={8} distance={4} color="#bfe4ff" />

      {/* Colored "light stage" panels — gives the glass streaky, multi-hue
          reflections instead of a flat single-tone highlight */}
      <Environment preset="studio" />
      <Lightformer intensity={2} position={[3, 2, 2]} scale={[3, 1, 1]} color="#ff8a3d" />
      <Lightformer intensity={2} position={[-3, 1, 1]} scale={[3, 1, 1]} color="#2fd0ff" />
      <Lightformer intensity={1.6} position={[0, -2.5, 2]} scale={[4, 1, 1]} color="#ff3df0" />
      <Lightformer intensity={1.4} position={[1, 3, -2]} scale={[5, 1.2, 1]} color="#9fffb0" />
      <Lightformer
        intensity={0.7}
        rotation-x={Math.PI / 2}
        position={[0, 5, -8]}
        scale={[10, 10, 1]}
        color="#7FDBFF"
      />

      <group ref={driftRef}>
        {/* Main two interlocked links — sharp focus, hero of the shot */}
        <ChainLink position={[0, 0, 0]} rotation={[0, 0, 0]} spinSpeed={0.045} spinAxis="y" />
        <ChainLink
          position={[LINK_RADIUS * 0.85, 0, 0.1]}
          rotation={[0, Math.PI / 2, 0]}
          spinSpeed={-0.035}
          spinAxis="x"
        />

        {/* Chain continuing out of frame, softly defocused — reads as an
            ongoing chain rather than two links floating in isolation */}
        <ChainLink
          position={[-1.55, 1.9, -1.3]}
          rotation={[0, Math.PI / 2, 0]}
          spinSpeed={0.03}
          spinAxis="y"
          scale={0.85}
        />
        <ChainLink
          position={[1.5, -2.0, -1.4]}
          rotation={[0, 0, 0]}
          spinSpeed={-0.04}
          spinAxis="x"
          scale={0.8}
        />
      </group>
    </>
  );
}

export function CrystalChain() {
  const [active, setActive] = useState(!document.hidden);

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
            <DepthOfField focusDistance={0.015} focalLength={0.04} bokehScale={4} height={480} />
            <Bloom luminanceThreshold={0.15} luminanceSmoothing={0.85} intensity={0.85} mipmapBlur />
          </EffectComposer>
        </Canvas>
      </Suspense>
    </div>
  );
}
