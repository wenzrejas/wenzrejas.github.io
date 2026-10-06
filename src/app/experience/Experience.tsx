import { lazy, Suspense, useRef } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import type * as THREE from 'three'
import { CAMERA_FAR, CAMERA_NEAR, CAMERA_OFFSET, CAMERA_ZOOM, IS_DEBUG } from './constants'
import CameraRig from './CameraRig'
import TopView from './TopView'
import WorldRenderer from './WorldRenderer'
import InteractionLayer from '@/interaction/InteractionLayer'
import CloudDeck from '@/loading/cloud-descent/CloudDeck'
import MistDissolve from '@/loading/mist-dissolve/MistDissolve'
import SceneWarmup from '@/loading/SceneWarmup'
import World from '@/world/World'
import DayNightCycle from '@/world/environment/day-night-cycle/DayNightCycle'
import { useDebugStore } from '@/store/debugStore'
import { useLoadingStore } from '@/store/loadingStore'

const Perf = lazy(() => import('r3f-perf').then((module) => ({ default: module.Perf })))

export default function Experience() {
  const shipRef = useRef<THREE.Group>(null)
  const orbitCamera = useDebugStore((s) => s.camera.orbitCamera)
  const topView = useDebugStore((s) => s.camera.topView)
  const isLoaderGone = useLoadingStore((state) => state.isLoaderGone)

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
      <Suspense fallback={null}>
        <color attach="background" args={['#1a7fa8']} />
        {IS_DEBUG && (
          <Suspense fallback={null}>
            <Perf position="bottom-right" />
          </Suspense>
        )}
        <DayNightCycle />
        <InteractionLayer />
        <WorldRenderer />
        <World ref={shipRef} />
        {topView ? (
          <TopView />
        ) : orbitCamera ? (
          <OrbitControls makeDefault />
        ) : (
          <CameraRig shipRef={shipRef} />
        )}
        {!isLoaderGone && (
          <>
            <CloudDeck />
            <MistDissolve />
          </>
        )}
        <SceneWarmup />
      </Suspense>
    </Canvas>
  )
}
