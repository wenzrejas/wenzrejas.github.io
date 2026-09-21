import { useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import * as THREE from 'three'
import {
  CAMERA_FAR,
  CAMERA_NEAR,
  CAMERA_OFFSET,
  CAMERA_LOOK_Y_OFFSET,
  CAMERA_ZOOM,
  IS_DEBUG,
} from './constants'
import TopView from './TopView'
import World from '../World/World'
import DayNightCycle from '../World/DayNightCycle/DayNightCycle'
import { useDebugStore } from '../../store/debugStore'
import { useUIStore } from '../../store/uiStore'
import { useRevealStore } from '../../store/revealStore'
import { REVEAL_PAN, REVEAL_ZOOM } from '../World/Islands/constants'
import { mix } from '../../utils/math'
import { Perf } from 'r3f-perf'

function CameraRig({ shipRef }: { shipRef: React.RefObject<THREE.Group | null> }) {
  useFrame(({ camera }) => {
    if (!shipRef.current) return
    const { x, z } = shipRef.current.position
    const y = useDebugStore.getState().ship.baseY
    const { blend, target } = useRevealStore.getState()

    const dx = target.x - x
    const dz = target.z - z
    const gap = Math.hypot(dx, dz)
    const pan = gap > 0 ? (Math.min(REVEAL_PAN, gap) * blend) / gap : 0
    const fx = x + dx * pan
    const fz = z + dz * pan

    camera.position.set(fx + CAMERA_OFFSET[0], y + CAMERA_OFFSET[1], fz + CAMERA_OFFSET[2])
    camera.lookAt(fx, y + CAMERA_LOOK_Y_OFFSET, fz)

    const zoom = CAMERA_ZOOM * mix(1, REVEAL_ZOOM, blend)
    if (camera.zoom !== zoom) {
      camera.zoom = zoom
      camera.updateProjectionMatrix()
    }
  })
  return null
}

export default function Experience() {
  const shipRef = useRef<THREE.Group>(null)
  const orbitCamera = useDebugStore((s) => s.camera.orbitCamera)
  const topView = useDebugStore((s) => s.camera.topView)
  const selectIsland = useUIStore((s) => s.selectIsland)

  return (
    <Canvas
      orthographic
      flat
      camera={{
        zoom: CAMERA_ZOOM,
        position: CAMERA_OFFSET,
        near: CAMERA_NEAR,
        far: CAMERA_FAR,
      }}
      gl={{ antialias: true }}
      dpr={[1, 1.5]}
    >
      <color attach="background" args={['#1a7fa8']} />
      {IS_DEBUG && <Perf position="top-left" />}
      <DayNightCycle />
      <World ref={shipRef} onIslandSelect={selectIsland} />
      {topView ? (
        <TopView />
      ) : orbitCamera ? (
        <OrbitControls makeDefault />
      ) : (
        <CameraRig shipRef={shipRef} />
      )}
    </Canvas>
  )
}
