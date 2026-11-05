import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import type * as THREE from 'three'
import { RENDER_LAYER } from '@/app/experience/renderLayers'
import { disposeAll } from '@/utils/dispose'
import { MAX_FRAME_SECONDS } from '@/utils/time'
import { buildBirdGeometry, createBirdMaterial, createShadowMaterial } from './birdModel'
import { createBirdPopulation, silenceBirdCalls, stepBirdPopulation } from './birdPopulation'
import { MAX_BIRDS } from './constants'

export default function Birds() {
  const bodyRef = useRef<THREE.InstancedMesh>(null)
  const shadowRef = useRef<THREE.InstancedMesh>(null)
  const geometry = useMemo(() => buildBirdGeometry(), [])
  const material = useMemo(() => createBirdMaterial(), [])
  const shadowMaterial = useMemo(() => createShadowMaterial(), [])
  const population = useMemo(() => createBirdPopulation(geometry), [geometry])

  useEffect(
    () => () => disposeAll(geometry, material, shadowMaterial),
    [geometry, material, shadowMaterial]
  )
  useEffect(() => () => silenceBirdCalls(population), [population])

  useFrame(({ clock, camera }, delta) => {
    const body = bodyRef.current
    const shadow = shadowRef.current
    if (!body || !shadow) return
    const dt = Math.min(delta, MAX_FRAME_SECONDS)
    stepBirdPopulation(population, { body, shadow }, camera, clock.getElapsedTime(), dt)
  })

  return (
    <>
      <instancedMesh
        ref={bodyRef}
        args={[geometry, material, MAX_BIRDS]}
        frustumCulled={false}
        visible={false}
      />
      <instancedMesh
        ref={shadowRef}
        args={[geometry, shadowMaterial, MAX_BIRDS]}
        frustumCulled={false}
        visible={false}
        renderOrder={RENDER_LAYER.effects}
      />
    </>
  )
}
