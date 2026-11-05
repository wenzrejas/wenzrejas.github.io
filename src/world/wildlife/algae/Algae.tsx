import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { RENDER_LAYER } from '@/app/experience/renderLayers'
import { disposeAll } from '@/utils/dispose'
import { buildFlatQuad } from '@/utils/geometry'
import { MAX_FRAME_SECONDS } from '@/utils/time'
import { createAlgaeMaterial, createSparkMaterial } from './algaeMaterial'
import { PLANE_SEGMENTS, PLANE_SIZE, SPARK_POOL, SPLASH_POOL } from './constants'
import { createPatchField, stepPatchField } from './patchField'

export default function Algae() {
  const planeRef = useRef<THREE.Mesh>(null)
  const sparksRef = useRef<THREE.InstancedMesh>(null)
  const splashRef = useRef<THREE.InstancedMesh>(null)

  const planeMaterial = useMemo(() => createAlgaeMaterial(), [])
  const sparkMaterial = useMemo(() => createSparkMaterial(), [])
  const sparkGeometry = useMemo(() => buildFlatQuad(), [])
  const splashGeometry = useMemo(() => new THREE.BoxGeometry(1, 1, 1), [])
  const field = useMemo(() => createPatchField(), [])

  useEffect(
    () => () => disposeAll(planeMaterial, sparkMaterial, sparkGeometry, splashGeometry),
    [planeMaterial, sparkMaterial, sparkGeometry, splashGeometry]
  )

  useFrame(({ clock, camera }, delta) => {
    const plane = planeRef.current
    const sparkMesh = sparksRef.current
    const splashMesh = splashRef.current
    if (!plane || !sparkMesh || !splashMesh) return
    const dt = Math.min(delta, MAX_FRAME_SECONDS)
    stepPatchField(field, { plane, sparkMesh, splashMesh }, camera, clock.getElapsedTime(), dt)
  })

  return (
    <>
      <mesh
        ref={planeRef}
        rotation-x={-Math.PI / 2}
        material={planeMaterial}
        frustumCulled={false}
        visible={false}
        renderOrder={RENDER_LAYER.surfaceBloom}
      >
        <planeGeometry args={[PLANE_SIZE, PLANE_SIZE, PLANE_SEGMENTS, PLANE_SEGMENTS]} />
      </mesh>
      <instancedMesh
        ref={sparksRef}
        args={[sparkGeometry, sparkMaterial, SPARK_POOL]}
        frustumCulled={false}
        visible={false}
        renderOrder={RENDER_LAYER.effectSparks}
      />
      <instancedMesh
        ref={splashRef}
        args={[splashGeometry, sparkMaterial, SPLASH_POOL]}
        frustumCulled={false}
        visible={false}
        renderOrder={RENDER_LAYER.effectSparks}
      />
    </>
  )
}
