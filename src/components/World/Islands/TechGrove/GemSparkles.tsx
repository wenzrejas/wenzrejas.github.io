import { useEffect, useMemo, useRef } from 'react'
import { createPortal, useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { SPARKLE_SIZE } from './constants'
import { buildSparkleGeometry, createSparkleMaterial } from './gemSparkleModel'
import type { ShrineGem } from './shrines'

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
    const zoom = (camera as THREE.OrthographicCamera).zoom
    uniforms.uTime.value = clock.getElapsedTime()
    uniforms.uSize.value = SPARKLE_SIZE * zoom * gl.getPixelRatio()
  })

  return createPortal(
    <points
      ref={pointsRef}
      geometry={geometry}
      material={material}
      frustumCulled={false}
      renderOrder={5}
    />,
    gem.node
  )
}
