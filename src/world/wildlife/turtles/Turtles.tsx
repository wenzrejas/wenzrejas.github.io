import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import type * as THREE from 'three'
import { RENDER_LAYER } from '@/app/experience/renderLayers'
import { disposeAll } from '@/utils/dispose'
import { buildFlatQuad } from '@/utils/geometry'
import { MAX_FRAME_SECONDS } from '@/utils/time'
import { createRippleMaterial } from '@/world/effects/rippleModel'
import { MAX_TURTLES, RIPPLE_POOL } from './constants'
import { buildTurtleGeometry, createTurtleMaterial } from './turtleModel'
import { createTurtlePopulation, stepTurtlePopulation } from './turtlePopulation'

export default function Turtles() {
  const bodyRef = useRef<THREE.InstancedMesh>(null)
  const rippleRef = useRef<THREE.InstancedMesh>(null)

  const bodyGeometry = useMemo(() => buildTurtleGeometry(), [])
  const bodyMaterial = useMemo(() => createTurtleMaterial(), [])
  const rippleGeometry = useMemo(() => buildFlatQuad(), [])
  const rippleMaterial = useMemo(() => createRippleMaterial(), [])
  const population = useMemo(() => createTurtlePopulation(bodyGeometry), [bodyGeometry])

  useEffect(
    () => () => disposeAll(bodyGeometry, bodyMaterial, rippleGeometry, rippleMaterial),
    [bodyGeometry, bodyMaterial, rippleGeometry, rippleMaterial]
  )

  useFrame(({ clock, camera }, delta) => {
    const body = bodyRef.current
    const rippleMesh = rippleRef.current
    if (!body || !rippleMesh) return
    const dt = Math.min(delta, MAX_FRAME_SECONDS)
    stepTurtlePopulation(
      population,
      body,
      rippleMesh,
      rippleMaterial,
      camera,
      clock.getElapsedTime(),
      dt
    )
  })

  return (
    <>
      <instancedMesh
        ref={bodyRef}
        args={[bodyGeometry, bodyMaterial, MAX_TURTLES]}
        frustumCulled={false}
        visible={false}
      />
      <instancedMesh
        ref={rippleRef}
        args={[rippleGeometry, rippleMaterial, RIPPLE_POOL]}
        frustumCulled={false}
        visible={false}
        renderOrder={RENDER_LAYER.effects}
      />
    </>
  )
}
