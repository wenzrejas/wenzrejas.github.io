import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import type * as THREE from 'three'
import { disposeAll } from '@/utils/dispose'
import { MAX_FRAME_SECONDS } from '@/utils/time'
import Spray from '@/world/effects/Spray'
import { algaeUniforms } from '@/world/wildlife/algae/algaeField'
import { DROP_GRAVITY, POD_MAX } from './constants'
import { buildDolphinGeometry, createDolphinMaterial } from './dolphinModel'
import { createDolphinPopulation, stepDolphinPopulation } from './dolphinPopulation'

export default function Dolphins() {
  const bodyRef = useRef<THREE.InstancedMesh>(null)
  const bodyGeometry = useMemo(() => buildDolphinGeometry(), [])
  const bodyMaterial = useMemo(() => createDolphinMaterial(), [])
  const population = useMemo(() => createDolphinPopulation(bodyGeometry), [bodyGeometry])

  useEffect(() => () => disposeAll(bodyGeometry, bodyMaterial), [bodyGeometry, bodyMaterial])

  useFrame(({ clock }, delta) => {
    const body = bodyRef.current
    if (!body) return
    const dt = Math.min(delta, MAX_FRAME_SECONDS)
    stepDolphinPopulation(population, body, clock.getElapsedTime(), dt)
  })

  return (
    <>
      <instancedMesh
        ref={bodyRef}
        args={[bodyGeometry, bodyMaterial, POD_MAX]}
        frustumCulled={false}
        visible={false}
      />
      <Spray
        foam={population.foam}
        drops={population.drops}
        gravity={DROP_GRAVITY}
        glowTint={algaeUniforms.uAlgaeGlow.value}
      />
    </>
  )
}
