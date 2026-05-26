import { useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import * as THREE from 'three'
import { CAMERA_OFFSET, IS_DEBUG } from './constants'
import type { IslandKey } from '../World/Islands/constants'
import Lighting from '../Lighting/Lighting'
import World from '../World/World'

function CameraRig({ shipRef }: { shipRef: React.RefObject<THREE.Group | null> }) {
  useFrame(({ camera }) => {
    if (!shipRef.current) return
    const { x, y, z } = shipRef.current.position
    camera.position.set(x + CAMERA_OFFSET[0], y + CAMERA_OFFSET[1], z + CAMERA_OFFSET[2])
    camera.lookAt(x, y, z)
  })
  return null
}

interface ExperienceProps {
  onIslandSelect: (key: IslandKey) => void
}

export default function Experience({ onIslandSelect }: ExperienceProps) {
  const shipRef = useRef<THREE.Group>(null)

  return (
    <Canvas
      orthographic
      camera={{ zoom: 5, position: CAMERA_OFFSET, near: 0.1, far: 10000 }}
      gl={{ antialias: true }}
      dpr={[1, 2]}
    >
      <color attach="background" args={['#1a7fa8']} />
      {IS_DEBUG ? <OrbitControls makeDefault /> : <CameraRig shipRef={shipRef} />}
      <Lighting />
      <World ref={shipRef} onIslandSelect={onIslandSelect} />
    </Canvas>
  )
}
