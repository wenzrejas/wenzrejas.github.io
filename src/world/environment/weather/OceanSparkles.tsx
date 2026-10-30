import { useEffect, useMemo, useRef, type RefObject } from 'react'
import { useFrame } from '@react-three/fiber'
import type * as THREE from 'three'
import { uniformsOf } from '@/utils/meshes'
import { MAX_FRAME_SECONDS } from '@/utils/time'
import { RENDER_LAYER } from '@/app/experience/renderLayers'
import { SPARKLE_VISIBLE_LEVEL } from './constants'
import { respawnSparkles, type SparkleField } from './sparkleField'
import { buildSparkleGeometry, createSparkleMaterial } from './sparkleFieldModel'

interface OceanSparklesProps {
  shipRef: RefObject<THREE.Group | null>
  field: SparkleField
  intensityOf: () => number
}

export default function OceanSparkles({ shipRef, field, intensityOf }: OceanSparklesProps) {
  const pointsRef = useRef<THREE.Points>(null)
  const geometry = useMemo(() => buildSparkleGeometry(field), [field])
  const material = useMemo(() => createSparkleMaterial(field), [field])

  useEffect(
    () => () => {
      geometry.dispose()
      material.dispose()
    },
    [geometry, material]
  )

  useFrame((_, delta) => {
    const points = pointsRef.current
    if (!points) return

    const intensity = intensityOf()
    uniformsOf(points).uIntensity.value = intensity
    points.visible = intensity > SPARKLE_VISIBLE_LEVEL
    if (!points.visible) return

    const ship = shipRef.current
    const dt = Math.min(delta, MAX_FRAME_SECONDS)
    respawnSparkles(points.geometry, field, ship?.position.x ?? 0, ship?.position.z ?? 0, dt)
  })

  return (
    <points
      ref={pointsRef}
      geometry={geometry}
      material={material}
      frustumCulled={false}
      renderOrder={RENDER_LAYER.waterSurface}
    />
  )
}
