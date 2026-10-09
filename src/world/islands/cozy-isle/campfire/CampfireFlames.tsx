import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import type * as THREE from 'three'
import { uniformsOf } from '@/utils/meshes'
import { RENDER_LAYER } from '@/app/experience/renderLayers'
import { buildFlameGeometry, createFlameMaterial } from './campfireModel'
import { FIRE_VISIBLE_LEVEL, FLAME_SCALE, FLARE_BOOST, FLARE_FLAME_GROWTH } from './constants'
import { fireGlow } from './fireGlow'

interface CampfireFlamesProps {
  base: THREE.Vector3
  height: number
  islandScale: number
  flare: () => number
}

export default function CampfireFlames({ base, height, islandScale, flare }: CampfireFlamesProps) {
  const meshRef = useRef<THREE.Mesh>(null)
  const geometry = useMemo(
    () => buildFlameGeometry(height * FLAME_SCALE * (1 + FLARE_FLAME_GROWTH)),
    [height]
  )
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

    const flareLevel = flare()
    const uniforms = uniformsOf(mesh)
    uniforms.uTime.value = clock.getElapsedTime()
    uniforms.uIntensity.value = intensity * (1 + FLARE_BOOST * flareLevel)
    uniforms.uSize.value =
      height * islandScale * FLAME_SCALE * (1 + FLARE_FLAME_GROWTH * flareLevel)
  })

  return (
    <mesh
      ref={meshRef}
      geometry={geometry}
      material={material}
      position={base}
      renderOrder={RENDER_LAYER.effects}
    />
  )
}
