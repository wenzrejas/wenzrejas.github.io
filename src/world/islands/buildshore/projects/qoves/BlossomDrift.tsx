import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import type * as THREE from 'three'
import { RENDER_LAYER } from '@/app/experience/renderLayers'
import { uniformsOf } from '@/utils/meshes'
import { pixelsPerUnit } from '@/utils/screen'
import type { HoverTimeline } from '@/world/islands/shared/hoverTimeline'
import { buildBlossomGeometry, createBlossomMaterial } from './blossomDriftModel'
import { BLOSSOM_SIZE } from './constants'

interface BlossomDriftProps {
  hover: HoverTimeline
  islandScale: number
}

export default function BlossomDrift({ hover, islandScale }: BlossomDriftProps) {
  const pointsRef = useRef<THREE.Points>(null)
  const geometry = useMemo(() => buildBlossomGeometry(), [])
  const material = useMemo(() => createBlossomMaterial(), [])

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

    points.visible = hover.presence > 0
    if (!points.visible) return

    const uniforms = uniformsOf(points)
    uniforms.uClock.value = hover.engagedSeconds
    uniforms.uPresence.value = hover.presence
    uniforms.uSize.value = BLOSSOM_SIZE * islandScale * pixelsPerUnit(camera, gl)
  })

  return (
    <points
      ref={pointsRef}
      geometry={geometry}
      material={material}
      frustumCulled={false}
      visible={false}
      renderOrder={RENDER_LAYER.effects}
    />
  )
}
