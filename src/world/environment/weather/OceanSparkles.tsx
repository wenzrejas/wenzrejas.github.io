import { useEffect, useMemo, useRef, type RefObject } from 'react'
import { useFrame } from '@react-three/fiber'
import type * as THREE from 'three'
import { uniformsOf } from '@/utils/meshes'
import { MAX_FRAME_SECONDS } from '@/utils/time'
import { SPARKLE_VISIBLE_LEVEL } from './constants'
import { respawnSparkles, sparkleIntensity } from './moonSparkles'
import { buildSparkleGeometry, createSparkleMaterial } from './moonSparklesModel'

interface OceanSparklesProps {
  shipRef: RefObject<THREE.Group | null>
}

export default function OceanSparkles({ shipRef }: OceanSparklesProps) {
  const pointsRef = useRef<THREE.Points>(null)
  const geometry = useMemo(() => buildSparkleGeometry(), [])
  const material = useMemo(() => createSparkleMaterial(), [])

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

    const intensity = sparkleIntensity()
    uniformsOf(points).uIntensity.value = intensity
    if (intensity <= SPARKLE_VISIBLE_LEVEL) return

    const ship = shipRef.current
    const dt = Math.min(delta, MAX_FRAME_SECONDS)
    respawnSparkles(points.geometry, ship?.position.x ?? 0, ship?.position.z ?? 0, dt)
  })

  return (
    <points
      ref={pointsRef}
      geometry={geometry}
      material={material}
      frustumCulled={false}
      renderOrder={3}
    />
  )
}
