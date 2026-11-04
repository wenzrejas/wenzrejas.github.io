import { useEffect, useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import type * as THREE from 'three'
import { RENDER_LAYER } from '@/app/experience/renderLayers'
import { zoomedOutBoost } from '@/app/experience/worldZoom'
import { MAX_FRAME_SECONDS } from '@/utils/time'
import { LANTERN_CAPACITY, LANTERN_ZOOMED_OUT_BOOST_MAX } from './constants'
import { drawFlock } from './lanternDraw'
import { stepLanternEvent } from './lanternEvent'
import {
  buildLanternBody,
  buildLanternGlow,
  createLanternGlowMaterial,
  createLanternMaterial,
} from './lanternModel'

export default function LanternField() {
  const bodiesRef = useRef<THREE.InstancedMesh>(null)
  const glowsRef = useRef<THREE.InstancedMesh>(null)
  const bodyGeometry = useMemo(() => buildLanternBody(), [])
  const bodyMaterial = useMemo(() => createLanternMaterial(), [])
  const glowGeometry = useMemo(() => buildLanternGlow(), [])
  const glowMaterial = useMemo(() => createLanternGlowMaterial(), [])
  const size = useThree((state) => state.size)
  const boost = useMemo(
    () => zoomedOutBoost(size.width, size.height, LANTERN_ZOOMED_OUT_BOOST_MAX),
    [size]
  )

  useEffect(
    () => () => {
      bodyGeometry.dispose()
      bodyMaterial.dispose()
      glowGeometry.dispose()
      glowMaterial.dispose()
    },
    [bodyGeometry, bodyMaterial, glowGeometry, glowMaterial]
  )

  useFrame(({ clock, camera, size: view }, delta) => {
    const bodies = bodiesRef.current
    const glows = glowsRef.current
    if (!bodies || !glows) return

    const { zoom } = camera as THREE.OrthographicCamera
    stepLanternEvent(
      Math.min(delta, MAX_FRAME_SECONDS),
      { halfWidth: view.width / (2 * zoom), halfHeight: view.height / (2 * zoom), boost },
      camera
    )
    drawFlock({ bodies, glows }, camera, clock.getElapsedTime(), boost)
  })

  return (
    <>
      <instancedMesh
        ref={bodiesRef}
        args={[bodyGeometry, bodyMaterial, LANTERN_CAPACITY]}
        frustumCulled={false}
        visible={false}
        renderOrder={RENDER_LAYER.inWater}
      />
      <instancedMesh
        ref={glowsRef}
        args={[glowGeometry, glowMaterial, LANTERN_CAPACITY * 2]}
        frustumCulled={false}
        visible={false}
        renderOrder={RENDER_LAYER.effects}
      />
    </>
  )
}
