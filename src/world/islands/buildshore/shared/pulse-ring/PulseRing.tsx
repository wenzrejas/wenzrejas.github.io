import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { RENDER_LAYER } from '@/app/experience/renderLayers'
import { buildFlatQuad } from '@/utils/geometry'
import {
  createPulseGlowMaterial,
  createPulseRingMaterial,
  updatePulseRing,
  type PulseRingTuning,
} from './pulseRingModel'

const UP = new THREE.Vector3(0, 1, 0)

interface PulseRingProps {
  centre: THREE.Vector3
  normal: THREE.Vector3
  reach: number
  tuning: PulseRingTuning
  clock: () => number
  presence: () => number
}

export default function PulseRing({
  centre,
  normal,
  reach,
  tuning,
  clock,
  presence,
}: PulseRingProps) {
  const groupRef = useRef<THREE.Group>(null)
  const geometry = useMemo(() => buildFlatQuad(), [])
  const materials = useMemo(
    () =>
      tuning.glow > 0
        ? [createPulseRingMaterial(tuning), createPulseGlowMaterial(tuning)]
        : [createPulseRingMaterial(tuning)],
    [tuning]
  )
  const position = useMemo(
    () => centre.clone().addScaledVector(normal, tuning.lift),
    [centre, normal, tuning]
  )
  const quaternion = useMemo(() => new THREE.Quaternion().setFromUnitVectors(UP, normal), [normal])

  useEffect(
    () => () => {
      geometry.dispose()
      for (const material of materials) material.dispose()
    },
    [geometry, materials]
  )

  useFrame(() => {
    const group = groupRef.current
    if (!group) return

    const level = presence()
    group.visible = level > 0
    if (group.visible) updatePulseRing(materials, level, clock())
  })

  return (
    <group
      ref={groupRef}
      position={position}
      quaternion={quaternion}
      scale={reach * 2}
      visible={false}
    >
      {materials.map((material, layer) => (
        <mesh
          key={material.uuid}
          geometry={geometry}
          material={material}
          renderOrder={layer === 0 ? RENDER_LAYER.effects : RENDER_LAYER.glow}
        />
      ))}
    </group>
  )
}
