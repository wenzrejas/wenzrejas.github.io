import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import type * as THREE from 'three'
import { disposeAll } from '@/utils/dispose'
import { MAX_FRAME_SECONDS } from '@/utils/time'
import Spray from '@/world/effects/Spray'
import { DROP_GRAVITY, WHALE_LENGTH } from './constants'
import { buildWhaleGeometry, createWhaleMaterial } from './whaleModel'
import { createWhaleSighting, stepWhaleSighting } from './whaleSighting'

export default function Whale() {
  const bodyRef = useRef<THREE.Mesh>(null)
  const bodyGeometry = useMemo(() => buildWhaleGeometry(), [])
  const bodyMaterial = useMemo(() => createWhaleMaterial(), [])
  const sighting = useMemo(() => createWhaleSighting(), [])

  useEffect(() => () => disposeAll(bodyGeometry, bodyMaterial), [bodyGeometry, bodyMaterial])

  useFrame(({ clock, camera }, delta) => {
    const body = bodyRef.current
    if (!body) return
    const dt = Math.min(delta, MAX_FRAME_SECONDS)
    stepWhaleSighting(sighting, body, camera, clock.getElapsedTime(), dt)
  })

  return (
    <>
      <mesh
        ref={bodyRef}
        args={[bodyGeometry, bodyMaterial]}
        scale={WHALE_LENGTH}
        frustumCulled={false}
        visible={false}
      />
      <Spray foam={sighting.foam} drops={sighting.drops} gravity={DROP_GRAVITY} />
    </>
  )
}
