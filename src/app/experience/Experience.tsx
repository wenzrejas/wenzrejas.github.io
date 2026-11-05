import { lazy, Suspense, useRef } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import type * as THREE from 'three'
import { CAMERA_FAR, CAMERA_NEAR, CAMERA_OFFSET, IS_DEBUG, PIXEL_RATIOS } from './constants'
import Bloom from './bloom/Bloom'
import FramePacer from './frame-pacer/FramePacer'
import CameraRig from './CameraRig'
import { baseZoom } from './worldZoom'
import TopView from './TopView'
import SceneRenderer from './SceneRenderer'
import WorldPause from './WorldPause'
import DepthsStage from '@/depths/DepthsStage'
import DiveTransition from '@/depths/dive/DiveTransition'
import InteractionLayer from '@/interaction/InteractionLayer'
import CloudDeck from '@/loading/cloud-descent/CloudDeck'
import MistDissolve from '@/loading/mist-dissolve/MistDissolve'
import SceneWarmup from '@/loading/SceneWarmup'
import World from '@/world/World'
import DayNightCycle from '@/world/environment/day-night-cycle/DayNightCycle'
import { useDebugStore } from '@/store/debugStore'
import { useLoadingStore } from '@/store/loadingStore'
import { useSettingsStore } from '@/store/settingsStore'
import './Experience.scss'

const Perf =
  (import.meta.env.DEV && IS_DEBUG) || import.meta.env.MODE === 'perf'
    ? lazy(() => import('r3f-perf').then((module) => ({ default: module.Perf })))
    : null

export default function Experience() {
  const shipRef = useRef<THREE.Group>(null)
  const orbitCamera = useDebugStore((state) => state.camera.orbitCamera)
  const topView = useDebugStore((state) => state.camera.topView)
  const isLoaderGone = useLoadingStore((state) => state.isLoaderGone)
  const graphicsQuality = useSettingsStore((state) => state.graphicsQuality)

  return (
    <Canvas
      className="experience"
      orthographic
      flat
      camera={{
        zoom: baseZoom(window.innerWidth, window.innerHeight),
        position: CAMERA_OFFSET,
        near: CAMERA_NEAR,
        far: CAMERA_FAR,
      }}
      gl={{ antialias: true, stencil: true }}
      dpr={PIXEL_RATIOS[graphicsQuality]}
      frameloop="demand"
    >
      <FramePacer />
      <Suspense fallback={null}>
        <color attach="background" args={['#1a7fa8']} />
        {Perf && (
          <Suspense fallback={null}>
            <Perf position="bottom-right" />
          </Suspense>
        )}
        <DayNightCycle />
        <InteractionLayer />
        <SceneRenderer />
        <Bloom />
        <DiveTransition />
        <WorldPause />
        <World shipRef={shipRef} />
        <DepthsStage />
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
