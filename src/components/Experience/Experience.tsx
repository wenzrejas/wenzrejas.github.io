import { useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import * as THREE from 'three'
import {
  CAMERA_FAR,
  CAMERA_NEAR,
  CAMERA_OFFSET,
  CAMERA_LOOK_Y_OFFSET,
  CAMERA_SHAKE_RATE_ACROSS,
  CAMERA_SHAKE_RATE_UP,
  CAMERA_ZOOM,
  IS_DEBUG,
} from './constants'
import TopView from './TopView'
import InteractionLayer from '../Interaction/InteractionLayer'
import World from '../World/World'
import DayNightCycle from '../World/DayNightCycle/DayNightCycle'
import { useCinematicStore } from '../../store/cinematicStore'
import { useDebugStore } from '../../store/debugStore'
import { useRevealStore } from '../../store/revealStore'
import { REVEAL_PAN, REVEAL_ZOOM } from '../World/Islands/constants'
import { mix } from '../../utils/math'
import { Perf } from 'r3f-perf'

function shakeCamera(camera: THREE.Camera, strength: number, time: number) {
  if (strength <= 0) return
  camera.translateX(strength * Math.sin(time * CAMERA_SHAKE_RATE_ACROSS))
  camera.translateY(strength * Math.sin(time * CAMERA_SHAKE_RATE_UP))
}

function CameraRig({ shipRef }: { shipRef: React.RefObject<THREE.Group | null> }) {
  useFrame(({ camera, clock }) => {
    if (!shipRef.current) return
    const { x, z } = shipRef.current.position
    const y = useDebugStore.getState().ship.baseY
    const { blend, target } = useRevealStore.getState()
    const { focus, focusBlend, focusZoom, shake } = useCinematicStore.getState()

    const dx = target.x - x
    const dz = target.z - z
    const gap = Math.hypot(dx, dz)
    const pan = gap > 0 ? (Math.min(REVEAL_PAN, gap) * blend) / gap : 0
    const lookY = y + CAMERA_LOOK_Y_OFFSET
    const focusLift = (focus.y - lookY) / (CAMERA_OFFSET[1] - CAMERA_LOOK_Y_OFFSET)
    const fx = mix(x + dx * pan, focus.x - CAMERA_OFFSET[0] * focusLift, focusBlend)
    const fz = mix(z + dz * pan, focus.z - CAMERA_OFFSET[2] * focusLift, focusBlend)

    camera.position.set(fx + CAMERA_OFFSET[0], y + CAMERA_OFFSET[1], fz + CAMERA_OFFSET[2])
    camera.lookAt(fx, lookY, fz)
    shakeCamera(camera, shake, clock.getElapsedTime())

    const zoom = CAMERA_ZOOM * mix(1, REVEAL_ZOOM, blend) * mix(1, focusZoom, focusBlend)
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
      <InteractionLayer />
      <World ref={shipRef} />
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
