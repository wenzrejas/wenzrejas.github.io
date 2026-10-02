import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import type * as THREE from 'three'
import { uniformsOf } from '@/utils/meshes'
import { MAX_FRAME_SECONDS } from '@/utils/time'
import { BEAM_LENGTH, BEAM_SPEED, BEAM_VISIBLE_LEVEL } from './constants'
import { aimHead, beamLevel } from './lighthouseBeam'
import {
  BEAM_TILT,
  buildLighthouseBeamGeometry,
  createLighthouseBeamMaterial,
} from './lighthouseBeamModel'

interface LuminaBeamProps {
  pivot: THREE.Vector3
  lensOffset: THREE.Vector3
  lensRadius: number
  restYaw: number
  head: THREE.Object3D
  headRest: number
}

export default function LuminaBeam({
  pivot,
  lensOffset,
  lensRadius,
  restYaw,
  head,
  headRest,
}: LuminaBeamProps) {
  const groupRef = useRef<THREE.Group>(null)
  const beamRef = useRef<THREE.Mesh>(null)
  const sweep = useRef(0)
  const geometry = useMemo(() => buildLighthouseBeamGeometry(lensRadius), [lensRadius])
  const material = useMemo(() => createLighthouseBeamMaterial(), [])

  useEffect(
    () => () => {
      geometry.dispose()
      material.dispose()
    },
    [geometry, material]
  )

  useFrame((_, delta) => {
    const group = groupRef.current
    const beam = beamRef.current
    if (!group || !beam) return

    const level = beamLevel()
    group.visible = level > BEAM_VISIBLE_LEVEL
    if (!group.visible) return

    sweep.current += Math.min(delta, MAX_FRAME_SECONDS) * BEAM_SPEED
    group.rotation.y = sweep.current
    aimHead(head, headRest + sweep.current)
    uniformsOf(beam).uIntensity.value = level
  })

  return (
    <group ref={groupRef} position={pivot}>
      <mesh
        ref={beamRef}
        geometry={geometry}
        material={material}
        position={lensOffset}
        scale={BEAM_LENGTH}
        rotation={[0, restYaw, -BEAM_TILT]}
        renderOrder={4}
      />
    </group>
  )
}
