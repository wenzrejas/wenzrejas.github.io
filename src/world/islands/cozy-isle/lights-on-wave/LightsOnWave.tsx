import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import type * as THREE from 'three'
import { uniformsOf } from '@/utils/meshes'
import { nightGlow } from '@/world/islands/shared/nightGlow'
import { RENDER_LAYER } from '@/app/experience/renderLayers'
import { pixelsPerUnit } from '@/utils/screen'
import { buildBulbHaloGeometry, createBulbHaloMaterial } from './bulbHaloModel'
import type { HoverTimeline } from '@/world/islands/shared/hoverTimeline'
import type { Bulb } from '../cafeLights'
import { BULB_HALO_SIZE, BULB_HALO_VISIBLE_LEVEL } from './constants'

interface LightsOnWaveProps {
  bulbs: Bulb[]
  islandScale: number
  cafeBreak: HoverTimeline
}

export default function LightsOnWave({ bulbs, islandScale, cafeBreak }: LightsOnWaveProps) {
  const pointsRef = useRef<THREE.Points>(null)

  const geometry = useMemo(() => buildBulbHaloGeometry(bulbs), [bulbs])
  const material = useMemo(() => createBulbHaloMaterial(), [])

  useEffect(
    () => () => {
      geometry.dispose()
      material.dispose()
    },
    [geometry, material]
  )

  useFrame(({ camera, gl }) => {
    const points = pointsRef.current
    if (!points) return

    const glow = cafeBreak.presence * nightGlow()
    points.visible = glow > BULB_HALO_VISIBLE_LEVEL
    if (!points.visible) return

    const uniforms = uniformsOf(points)
    uniforms.uSeconds.value = cafeBreak.engagedSeconds
    uniforms.uSize.value = BULB_HALO_SIZE * islandScale * pixelsPerUnit(camera, gl)
    uniforms.uGlow.value = glow
  })

  return (
    <points
      ref={pointsRef}
      geometry={geometry}
      material={material}
      visible={false}
      renderOrder={RENDER_LAYER.glow}
    />
  )
}
