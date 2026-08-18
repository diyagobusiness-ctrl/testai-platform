'use client'

import { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Float, MeshDistortMaterial, Sphere, Environment } from '@react-three/drei'
import * as THREE from 'three'

function AnimatedSphere() {
  const meshRef = useRef<THREE.Mesh>(null)
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.elapsedTime * 0.2
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.3
    }
  })

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
      <Sphere ref={meshRef} args={[1, 100, 100]} position={[0, 0, 0]}>
        <MeshDistortMaterial
          color="#6366f1"
          attach="material"
          distort={0.4}
          speed={2}
          roughness={0.2}
          metalness={0.8}
        />
      </Sphere>
    </Float>
  )
}

function FloatingEducationElements() {
  const elements = useMemo(() => {
    const items = []
    for (let i = 0; i < 15; i++) {
      items.push({
        position: [
          (Math.random() - 0.5) * 10,
          (Math.random() - 0.5) * 10,
          (Math.random() - 0.5) * 10,
        ] as [number, number, number],
        scale: Math.random() * 0.5 + 0.3,
        speed: Math.random() * 2 + 1,
      })
    }
    return items
  }, [])

  return (
    <>
      {elements.map((el, i) => (
        <Float key={i} speed={el.speed} floatIntensity={0.5}>
          <mesh position={el.position} scale={el.scale}>
            <octahedronGeometry args={[1, 0]} />
            <meshStandardMaterial
              color={i % 3 === 0 ? '#6366f1' : i % 3 === 1 ? '#14b8a6' : '#c084fc'}
              emissive={i % 3 === 0 ? '#4f46e5' : i % 3 === 1 ? '#0d9488' : '#a855f7'}
              emissiveIntensity={0.3}
              metalness={0.8}
              roughness={0.2}
            />
          </mesh>
        </Float>
      ))}
    </>
  )
}

function Particles({ count = 200 }: { count?: number }) {
  const particles = useMemo(() => {
    const positions = new Float32Array(count * 3)
    const colors = new Float32Array(count * 3)
    
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 20
      positions[i * 3 + 1] = (Math.random() - 0.5) * 20
      positions[i * 3 + 2] = (Math.random() - 0.5) * 20
      
      const color = new THREE.Color()
      color.setHSL(0.6 + Math.random() * 0.2, 0.8, 0.6)
      colors[i * 3] = color.r
      colors[i * 3 + 1] = color.g
      colors[i * 3 + 2] = color.b
    }
    
    return { positions, colors }
  }, [count])

  const pointsRef = useRef<THREE.Points>(null)

  useFrame((state) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.x = state.clock.elapsedTime * 0.05
      pointsRef.current.rotation.y = state.clock.elapsedTime * 0.1
    }
  })

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={particles.positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={count}
          array={particles.colors}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.05}
        vertexColors
        transparent
        opacity={0.8}
        sizeAttenuation
      />
    </points>
  )
}

export interface SceneProps {
  className?: string
  showParticles?: boolean
  showElements?: boolean
  showSphere?: boolean
}

export function Scene({
  className = '',
  showParticles = true,
  showElements = true,
  showSphere = true,
}: SceneProps) {
  return (
    <div className={`absolute inset-0 ${className}`}>
      <Canvas
        camera={{ position: [0, 0, 8], fov: 50 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true }}
        style={{ background: 'transparent' }}
      >
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <pointLight position={[-10, -10, -5]} intensity={0.5} />
        
        {showSphere && <AnimatedSphere />}
        {showElements && <FloatingEducationElements />}
        {showParticles && <Particles count={300} />}
        
        <Environment preset="city" />
      </Canvas>
    </div>
  )
}

export default Scene
