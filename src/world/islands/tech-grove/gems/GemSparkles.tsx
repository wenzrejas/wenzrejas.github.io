import { useEffect, useMemo, useRef } from 'react'
import { createPortal, useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { RENDER_LAYER } from '@/app/experience/renderLayers'
import { pixelsPerUnit } from '@/utils/screen'
import { SPARKLE_SIZE } from './constants'
import { buildSparkleGeometry, createSparkleMaterial } from './gemSparkleModel'
import type { ShrineGem } from '../shrines'

export default function GemSparkles({ gem }: { gem: ShrineGem }) {
  const pointsRef = useRef<THREE.Points>(null)

  const geometry = useMemo(() => buildSparkleGeometry(gem), [gem])
  const material = useMemo(() => createSparkleMaterial(gem), [gem])

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

    const { uniforms } = points.material as THREE.ShaderMaterial
    uniforms.uTime.value = clock.getElapsedTime()
    uniforms.uSize.value = SPARKLE_SIZE * pixelsPerUnit(camera, gl)
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
