import { useEffect, useRef, useState, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { PerspectiveCamera, Environment, Lightformer } from '@react-three/drei';
import * as THREE from 'three';

/**
 * Crystal Glass Chain Hero Component
 * 
 * Design Philosophy:
 * - Thick oval links with rounded bevels (NOT metallic, NOT plastic)
 * - Crystal-clear glass with blue/amber refractions
 * - Premium studio lighting with realistic bloom and reflections
 * - Camera moves, not the chain (luxury watch commercial aesthetic)
 * - Very slow floating motion with tiny idle movement
 * - Mouse parallax for cinematic effect
 */

interface ChainLinkProps {
  position: [number, number, number];
  rotation: [number, number, number];
}

function ChainLink({ position, rotation }: ChainLinkProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const idleRotation = useRef({ x: 0, y: 0 });

  useFrame(({ clock }) => {
    if (!meshRef.current) return;

    // Very subtle idle floating motion
    const time = (clock as any).getElapsedTime?.() ?? Date.now() / 1000;
    idleRotation.current.x = Math.sin(time * 0.3) * 0.02;
    idleRotation.current.y = Math.cos(time * 0.25) * 0.02;

    meshRef.current.rotation.x = rotation[0] + idleRotation.current.x;
    meshRef.current.rotation.y = rotation[1] + idleRotation.current.y;
    meshRef.current.rotation.z = rotation[2];
  });

  return (
    <mesh ref={meshRef} position={position} castShadow receiveShadow>
      {/* Thick oval torus for chain link */}
      <torusGeometry args={[0.5, 0.15, 32, 100]} />
      <meshPhysicalMaterial
        color="#e8f0ff"
        metalness={0.1}
        roughness={0.15}
        transmission={0.95}
        thickness={0.5}
        ior={1.5}
        clearcoat={0.8}
        clearcoatRoughness={0.1}
        envMapIntensity={1.2}
        side={THREE.DoubleSide}
        wireframe={false}
      />
    </mesh>
  );
}

function ChainScene() {
  const { camera } = useThree();
  const cameraRef = useRef<THREE.PerspectiveCamera>(null);
  const mouseX = useRef(0);
  const mouseY = useRef(0);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseX.current = (e.clientX / window.innerWidth) * 2 - 1;
      mouseY.current = -(e.clientY / window.innerHeight) * 2 + 1;
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useFrame(({ clock }) => {
    if (!cameraRef.current) return;
    const time = (clock as any).getElapsedTime?.() ?? Date.now() / 1000;

    // Camera parallax movement (small cinematic effect)
    cameraRef.current.position.x = mouseX.current * 0.3;
    cameraRef.current.position.y = mouseY.current * 0.3 + 0.5;

    // Very slow camera orbit around chain
    const orbitSpeed = 0.1;
    cameraRef.current.position.z = 3 + Math.sin(time * orbitSpeed) * 0.3;

    cameraRef.current.lookAt(0, 0, 0);
  });

  // Generate chain links in a circular pattern
  const linkPositions: ChainLinkProps[] = [];
  const linkCount = 8;
  for (let i = 0; i < linkCount; i++) {
    const angle = (i / linkCount) * Math.PI * 2;
    const x = Math.cos(angle) * 1.5;
    const y = Math.sin(angle) * 1.5;
    const z = Math.cos(angle * 0.5) * 0.5;
    const rotX = angle;
    const rotY = angle * 0.5;
    const rotZ = Math.sin(angle) * 0.3;

    linkPositions.push({
      position: [x, y, z],
      rotation: [rotX, rotY, rotZ],
    });
  }

  return (
    <>
      {/* Premium studio lighting setup */}
      <PerspectiveCamera ref={cameraRef} makeDefault position={[0, 0.5, 3]} fov={50} />

      {/* Main key light - soft and warm */}
      <directionalLight
        position={[5, 5, 5]}
        intensity={1.2}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />

      {/* Fill light - cool blue edge lighting */}
      <directionalLight position={[-5, 3, -5]} intensity={0.6} color="#7FDBFF" />

      {/* Rim light - subtle backlight */}
      <directionalLight position={[0, -2, -5]} intensity={0.4} color="#e8f0ff" />

      {/* Ambient light for overall illumination */}
      <ambientLight intensity={0.3} />

      {/* Environment for realistic reflections */}
      <Environment preset="studio" />

      {/* Render crystal chain links */}
      {linkPositions.map((link, idx) => (
        <ChainLink
          key={idx}
          position={link.position}
          rotation={link.rotation}
        />
      ))}

      {/* Volumetric lighting effect using Lightformers */}
      <Lightformer
        intensity={0.5}
        rotation-x={Math.PI / 2}
        position={[0, 5, -9]}
        scale={[10, 10, 1]}
        color="#7FDBFF"
      />
    </>
  );
}

export function CrystalChain() {
  return (
    <div className="w-full h-full bg-gradient-to-b from-[#05070A] to-[#0D1117]">
      <Suspense fallback={<div className="w-full h-full bg-[#05070A]" />}>
        <Canvas
          shadows
          gl={{
            antialias: true,
            alpha: true,
            preserveDrawingBuffer: true,
            powerPreference: 'high-performance',
          }}
          onCreated={(state) => {
            state.gl.setClearColor(0x05070a, 0);
          }}
        >
          <ChainScene />
        </Canvas>
      </Suspense>
    </div>
  );
}
