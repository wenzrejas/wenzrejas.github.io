import { useEffect, useMemo, useRef } from 'react'
import { createPortal, useFrame } from '@react-three/fiber'
import type * as THREE from 'three'
import { RENDER_LAYER } from '@/app/experience/renderLayers'
import { uniformsOf } from '@/utils/meshes'
import { pixelsPerUnit } from '@/utils/screen'
import {
  buildSparkleGeometry,
  createSparkleMaterial,
  type GemSparkleTuning,
} from './gemSparklesModel'
import type { SparkleGem } from './sparkleSpots'

interface GemSparklesProps {
  gem: SparkleGem
  tuning: GemSparkleTuning
  size: number
  level?: () => number
}

export default function GemSparkles({ gem, tuning, size, level }: GemSparklesProps) {
  const pointsRef = useRef<THREE.Points>(null)
  const geometry = useMemo(() => buildSparkleGeometry(gem.sparkleSpots, tuning), [gem, tuning])
  const material = useMemo(() => createSparkleMaterial(gem.color, tuning), [gem, tuning])

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

    const glow = level?.() ?? 1
    points.visible = glow > 0
    if (!points.visible) return

    const uniforms = uniformsOf(points)
    uniforms.uTime.value = clock.getElapsedTime()
    uniforms.uGlow.value = glow
    uniforms.uSize.value = size * pixelsPerUnit(camera, gl)
  })

  return createPortal(
    <points
      ref={pointsRef}
      geometry={geometry}
      material={material}
      renderOrder={RENDER_LAYER.glow}
    />,
    gem.node
  )
}
