import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import type * as THREE from 'three'
import { RENDER_LAYER } from '@/app/experience/renderLayers'
import type { WallClock } from '@/utils/time'
import { plungeShare, type Arrival } from '../arrival/arrival'
import { BUBBLE_CAPACITY, FOAM_CAPACITY } from './constants'
import { createSplashEmitter, emitSplash, shadeSpray } from './splashEmitter'
import { buildSprayGeometry, createBubbleMaterial, createFoamMaterial } from './splashModel'

interface PlungeSplashProps {
  arrival: Arrival
  shipSpot: THREE.Vector3
  clock: WallClock
}

export default function PlungeSplash({ arrival, shipSpot, clock }: PlungeSplashProps) {
  const foamRef = useRef<THREE.Points>(null)
  const bubblesRef = useRef<THREE.Points>(null)
  const foamGeometry = useMemo(() => buildSprayGeometry(FOAM_CAPACITY), [])
  const bubbleGeometry = useMemo(() => buildSprayGeometry(BUBBLE_CAPACITY), [])
  const foamMaterial = useMemo(() => createFoamMaterial(), [])
  const bubbleMaterial = useMemo(() => createBubbleMaterial(), [])
  const emitter = useMemo(() => createSplashEmitter(), [])

  useEffect(
    () => () => {
      for (const resource of [foamGeometry, bubbleGeometry, foamMaterial, bubbleMaterial]) {
        resource.dispose()
      }
    },
    [foamGeometry, bubbleGeometry, foamMaterial, bubbleMaterial]
  )

  useFrame(({ camera, gl, size }) => {
    const foam = foamRef.current
    const bubbles = bubblesRef.current
    if (!foam || !bubbles) return
    const plunge = plungeShare(arrival)
    const lens = camera as THREE.PerspectiveCamera
    const drawingHeight = size.height * gl.getPixelRatio()
    emitSplash(emitter, foamGeometry, bubbleGeometry, shipSpot, plunge, clock)
    shadeSpray(foam, emitter.foam, plunge, lens, drawingHeight, clock.elapsed)
    shadeSpray(bubbles, emitter.bubbles, plunge, lens, drawingHeight, clock.elapsed)
  })

  return (
    <>
      <points
        ref={foamRef}
        geometry={foamGeometry}
        material={foamMaterial}
        frustumCulled={false}
        renderOrder={RENDER_LAYER.depthsFoam}
      />
      <points
        ref={bubblesRef}
        geometry={bubbleGeometry}
        material={bubbleMaterial}
        frustumCulled={false}
        renderOrder={RENDER_LAYER.depthsBubbles}
      />
    </>
  )
}
