import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useCycleStore } from '@/store/cycleStore'
import { useDebugStore } from '@/store/debugStore'
import type { IslandKey } from '../islands/shared/constants'
import { ISLAND_KEYS } from '../islands/shared/islandSpecs'
import {
  createIslandTransform,
  islandTransform,
  toWorld,
  type IslandTransform,
} from '../islands/shared/islandTransform'
import { SHORE_Y } from './constants'
import { buildShoreRipples } from './shoreRippleModel'

const _transforms = Object.fromEntries(
  ISLAND_KEYS.map((key) => [key, createIslandTransform()])
) as Record<IslandKey, IslandTransform>
const _position = new THREE.Vector2()

export default function ShoreRipples() {
  const ripples = useMemo(() => buildShoreRipples(), [])
  const meshes = useRef<(THREE.Mesh | null)[]>([])

  useEffect(
    () => () => {
      for (const { material, texture } of ripples) {
        material.dispose()
        texture.dispose()
      }
    },
    [ripples]
  )

  useFrame(({ clock }) => {
    const time = clock.getElapsedTime()
    const foam = useCycleStore.getState().foamColor
    const tuning = useDebugStore.getState().islands
    for (const key of ISLAND_KEYS) islandTransform(key, tuning[key], _transforms[key])

    ripples.forEach(({ key, ring, peak, material }, i) => {
      const transform = _transforms[key]
      const uniforms = material.uniforms
      uniforms.uTime.value = time
      uniforms.uColor.value.copy(foam)
      uniforms.uScale.value = peak * transform.scale
      uniforms.uRotation.value = transform.facing

      const mesh = meshes.current[i]
      if (!mesh) return
      toWorld(transform, ring.x, ring.z, _position)
      mesh.position.set(_position.x, SHORE_Y, _position.y)
    })
  })

  return (
    <>
      {ripples.map(({ id, span, material }, i) => (
        <mesh
          key={id}
          ref={(mesh) => {
            meshes.current[i] = mesh
          }}
          material={material}
          rotation-x={-Math.PI / 2}
          renderOrder={3}
        >
          <planeGeometry args={[span, span]} />
        </mesh>
      ))}
    </>
  )
}
