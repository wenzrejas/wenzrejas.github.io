import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import type * as THREE from 'three'
import type { GlowSite } from '../GroundGlow/glowSites'
import { buildRisingGlowGeometry, createRisingGlowMaterial } from './risingGlowModel'

interface RisingGlowProps {
  site: GlowSite
  level: () => number
  rise: () => number
}

export default function RisingGlow({ site, level, rise }: RisingGlowProps) {
  const meshRef = useRef<THREE.Mesh>(null)
  const geometry = useMemo(() => buildRisingGlowGeometry(site), [site])
  const material = useMemo(() => createRisingGlowMaterial(site), [site])

  useEffect(
    () => () => {
      geometry.dispose()
      material.dispose()
    },
    [geometry, material]
  )

  useFrame(({ clock }) => {
    const mesh = meshRef.current
    if (!mesh) return

    mesh.scale.y = rise()
    const { uniforms } = mesh.material as THREE.ShaderMaterial
    uniforms.uGlow.value = level()
    uniforms.uTime.value = clock.getElapsedTime()
  })

  return (
    <mesh
      ref={meshRef}
      geometry={geometry}
      material={material}
      position={site.center}
      renderOrder={5}
    />
  )
}
