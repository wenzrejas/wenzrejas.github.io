import { useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import * as THREE from 'three'
import { CAMERA_OFFSET, CAMERA_LOOK_Y_OFFSET } from './constants'
import World from '../World/World'
import DayNightCycle from '../World/DayNightCycle/DayNightCycle'
import { useDebugStore } from '../../store/debugStore'
import { useUIStore } from '../../store/uiStore'
import { IS_DEBUG } from './constants'
import { Perf } from 'r3f-perf'

function CameraRig({ shipRef }: { shipRef: React.RefObject<THREE.Group | null> }) {
  useFrame(({ camera }) => {
    if (!shipRef.current) return
    const { x, y, z } = shipRef.current.position
    camera.position.set(x + CAMERA_OFFSET[0], y + CAMERA_OFFSET[1], z + CAMERA_OFFSET[2])
    camera.lookAt(x, y + CAMERA_LOOK_Y_OFFSET, z)
  })
  return null
}

export default function Experience() {
  const shipRef = useRef<THREE.Group>(null)
  const orbitCamera = useDebugStore((s) => s.camera.orbitCamera)
  const selectIsland = useUIStore((s) => s.selectIsland)

  return (
    <Canvas
      orthographic
      camera={{ zoom: 5, position: CAMERA_OFFSET, near: 0.1, far: 10000 }}
      gl={{ antialias: true }}
      dpr={[1, 1.5]}
    >
      <color attach="background" args={['#1a7fa8']} />
      {IS_DEBUG && <Perf position="top-left" />}
      <DayNightCycle />
      <World ref={shipRef} onIslandSelect={selectIsland} />
      {orbitCamera ? <OrbitControls makeDefault /> : <CameraRig shipRef={shipRef} />}
    </Canvas>
  )
}
