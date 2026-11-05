import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import type * as THREE from 'three'
import { disposeAll } from '@/utils/dispose'
import { MAX_FRAME_SECONDS } from '@/utils/time'
import { MAX_FISH } from './constants'
import { buildFishGeometry, createFishMaterial } from './fishModel'
import { createFishPopulation, stepFishPopulation } from './fishPopulation'

export default function Fish() {
  const meshRef = useRef<THREE.InstancedMesh>(null)
  const geometry = useMemo(() => buildFishGeometry(), [])
  const material = useMemo(() => createFishMaterial(), [])
  const population = useMemo(() => createFishPopulation(geometry), [geometry])

  useEffect(() => () => disposeAll(geometry, material), [geometry, material])

  useFrame(({ clock, camera }, delta) => {
    const mesh = meshRef.current
    if (!mesh) return
    const dt = Math.min(delta, MAX_FRAME_SECONDS)
    stepFishPopulation(population, mesh, camera, clock.getElapsedTime(), dt)
  })

  return (
    <instancedMesh
      ref={meshRef}
      args={[geometry, material, MAX_FISH]}
      frustumCulled={false}
      visible={false}
    />
  )
}
