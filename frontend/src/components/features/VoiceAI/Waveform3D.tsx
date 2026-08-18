'use client';

import { useRef, useMemo, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { cn } from '@/lib/utils';

interface Waveform3DProps {
  audioData: number[];
  isRecording: boolean;
  className?: string;
  barCount?: number;
}

const BAR_COUNT_DEFAULT = 32;

function AnimatedBars({
  audioData,
  isRecording,
  barCount = BAR_COUNT_DEFAULT,
}: {
  audioData: number[];
  isRecording: boolean;
  barCount: number;
}) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const barData = useRef(
    Array.from({ length: barCount }, () => ({
      scaleY: 1,
      targetScaleY: 1,
      glowIntensity: 0,
    }))
  );

  const colorA = useMemo(() => new THREE.Color('#3b82f6'), []);
  const colorB = useMemo(() => new THREE.Color('#22d3ee'), []);

  useFrame((_, delta) => {
    if (!meshRef.current) return;

    for (let i = 0; i < barCount; i++) {
      const data = barData.current[i];
      const normalizedIndex = i / barCount;
      const audioIndex = Math.floor(normalizedIndex * audioData.length);
      const rawValue = audioData[audioIndex] ?? 0;

      data.targetScaleY = isRecording ? 0.3 + rawValue * 3.5 : 0.3 + Math.sin(Date.now() * 0.002 + i * 0.3) * 0.15;
      data.scaleY += (data.targetScaleY - data.scaleY) * Math.min(delta * 12, 1);
      data.glowIntensity = isRecording ? rawValue * 0.8 : 0.2;

      const x = (i - barCount / 2) * 0.35;
      const z = Math.sin(normalizedIndex * Math.PI) * 0.5;

      dummy.position.set(x, 0, z);
      dummy.scale.set(0.2, data.scaleY, 0.2);
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);

      const color = new THREE.Color().lerpColors(colorA, colorB, normalizedIndex);
      meshRef.current.setColorAt(i, color);
    }

    meshRef.current.instanceMatrix.needsUpdate = true;
    if (meshRef.current.instanceColor) meshRef.current.instanceColor.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, barCount]}>
      <cylinderGeometry args={[1, 1, 1, 8]} />
      <meshStandardMaterial
        emissiveIntensity={0.6}
        toneMapped={false}
        transparent
        opacity={0.9}
      />
    </instancedMesh>
  );
}

export default function Waveform3D({
  audioData,
  isRecording,
  className,
  barCount = BAR_COUNT_DEFAULT,
}: Waveform3DProps) {
  return (
    <div className={cn('relative w-full h-full rounded-2xl overflow-hidden', className)}>
      <Canvas
        camera={{ position: [0, 3, 8], fov: 50 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: 'transparent' }}
      >
        <ambientLight intensity={0.4} />
        <directionalLight position={[5, 10, 5]} intensity={1.2} />
        <pointLight position={[0, 2, 3]} intensity={0.8} color="#60a5fa" />
        <AnimatedBars audioData={audioData} isRecording={isRecording} barCount={barCount} />
      </Canvas>
      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
    </div>
  );
}
