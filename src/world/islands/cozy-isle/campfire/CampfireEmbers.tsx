import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import type * as THREE from 'three'
import { uniformsOf } from '@/utils/meshes'
import { RENDER_LAYER } from '@/app/experience/renderLayers'
import { pixelsPerUnit } from '@/utils/screen'
import { buildEmberGeometry, createEmberMaterial } from './campfireModel'
import {
  EMBER_DRIFT,
  EMBER_RISE,
  EMBER_SIZE,
  EMBER_SPREAD,
  EMBER_SWAY,
  FIRE_VISIBLE_LEVEL,
  FLARE_EMBER_GROWTH,
  FLARE_EMBER_RISE,
  FLARE_BOOST,
} from './constants'
import { fireGlow } from './fireGlow'

interface CampfireEmbersProps {
  origin: THREE.Vector3
  width: number
  height: number
  islandScale: number
  flare: () => number
}

export default function CampfireEmbers({
  origin,
  width,
  height,
  islandScale,
  flare,
}: CampfireEmbersProps) {
  const pointsRef = useRef<THREE.Points>(null)
  const geometry = useMemo(() => buildEmberGeometry(width, height), [width, height])
  const material = useMemo(() => createEmberMaterial(), [])

  useEffect(
    () => () => {
      geometry.dispose()
      material.dispose()
    },
    [geometry, material]
  )

  useFrame(({ clock, camera, gl }) => {
    const points = pointsRef.current
    if (!points) return

    const intensity = fireGlow()
    points.visible = intensity > FIRE_VISIBLE_LEVEL
    if (!points.visible) return

    const flareLevel = flare()
    const uniforms = uniformsOf(points)
    uniforms.uTime.value = clock.getElapsedTime()
    uniforms.uIntensity.value = intensity * (1 + FLARE_BOOST * flareLevel)
    uniforms.uSize.value =
      EMBER_SIZE * islandScale * pixelsPerUnit(camera, gl) * (1 + FLARE_EMBER_GROWTH * flareLevel)
    uniforms.uRise.value = height * EMBER_RISE * (1 + FLARE_EMBER_RISE * flareLevel)
    uniforms.uSpread.value = width * EMBER_SPREAD
    uniforms.uDrift.value = width * EMBER_DRIFT
    uniforms.uSway.value = width * EMBER_SWAY
  })

  return (
    <points
      ref={pointsRef}
      geometry={geometry}
      material={material}
      position={origin}
      renderOrder={RENDER_LAYER.glow}
    />
  )
}
