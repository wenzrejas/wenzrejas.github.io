import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import type * as THREE from 'three'
import { RENDER_LAYER } from '@/app/experience/renderLayers'
import { disposeAll } from '@/utils/dispose'
import { MAX_FRAME_SECONDS } from '@/utils/time'
import { MOST_GATES } from './checkpointRun'
import {
  buildArchGeometry,
  buildRingFoamGeometry,
  createArchMaterial,
  createRingFoamMaterial,
} from './courseModel'
import {
  createCourseRingsState,
  FOAM_PER_RING,
  startRingPulse,
  stepCourseRings,
} from './courseRingsLook'
import { onRingPass } from './ringFeedback'

export default function CourseRings() {
  const ringsRef = useRef<THREE.InstancedMesh>(null)
  const foamRef = useRef<THREE.InstancedMesh>(null)
  const geometry = useMemo(() => buildArchGeometry(MOST_GATES), [])
  const material = useMemo(() => createArchMaterial(), [])
  const foamGeometry = useMemo(() => buildRingFoamGeometry(MOST_GATES * FOAM_PER_RING), [])
  const foamMaterial = useMemo(() => createRingFoamMaterial(), [])
  const state = useMemo(() => createCourseRingsState(), [])

  useEffect(
    () => () => disposeAll(geometry, material, foamGeometry, foamMaterial),
    [geometry, material, foamGeometry, foamMaterial]
  )

  useEffect(() => onRingPass((pass) => startRingPulse(state, pass)), [state])

  useFrame((_, delta) => {
    const rings = ringsRef.current
    const foam = foamRef.current
    if (rings && foam) stepCourseRings(state, { rings, foam }, Math.min(delta, MAX_FRAME_SECONDS))
  })

  return (
    <>
      <instancedMesh
        ref={foamRef}
        args={[foamGeometry, foamMaterial, MOST_GATES * FOAM_PER_RING]}
        frustumCulled={false}
        renderOrder={RENDER_LAYER.waterSurface}
      />
      <instancedMesh
        ref={ringsRef}
        args={[geometry, material, MOST_GATES]}
        frustumCulled={false}
        renderOrder={RENDER_LAYER.effects}
      />
    </>
  )
}
