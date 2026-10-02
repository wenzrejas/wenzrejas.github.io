import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import type * as THREE from 'three'
import { uniformsOf } from '@/utils/meshes'
import { buildFlameGeometry, createFlameMaterial } from './campfireModel'
import { FIRE_VISIBLE_LEVEL, FLAME_SCALE } from './constants'
import { fireGlow } from './fireGlow'

interface CampfireFlamesProps {
  base: THREE.Vector3
  height: number
  islandScale: number
}

export default function CampfireFlames({ base, height, islandScale }: CampfireFlamesProps) {
  const meshRef = useRef<THREE.Mesh>(null)
  const geometry = useMemo(() => buildFlameGeometry(height * FLAME_SCALE), [height])
  const material = useMemo(() => createFlameMaterial(), [])

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

    const intensity = fireGlow()
    mesh.visible = intensity > FIRE_VISIBLE_LEVEL
    if (!mesh.visible) return

    const uniforms = uniformsOf(mesh)
    uniforms.uTime.value = clock.getElapsedTime()
    uniforms.uIntensity.value = intensity
    uniforms.uSize.value = height * islandScale * FLAME_SCALE
  })

  return (
    <mesh ref={meshRef} geometry={geometry} material={material} position={base} renderOrder={4} />
  )
}
