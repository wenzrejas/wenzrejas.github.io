import { useEffect, useMemo, useRef, type RefObject } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { MODEL_BOW_OFFSET } from './constants'
import { useDebugStore } from '@/store/debugStore'
import { useCycleStore } from '@/store/cycleStore'
import { disposeAll } from '@/utils/dispose'
import { algaeAt, algaeUniforms } from '../wildlife/algae/algaeField'
import { whirlpoolDip } from '../islands/timewell-depth/whirlpoolFunnel'
import { createDistanceTexture } from '../shore/shorelineModel'
import { foamReachAt, type HullOutline } from './hullOutline'
import { buildHullFieldQuad, createHullFoamMaterial } from './hullFoamModel'
import type { ShipSailing } from './shipSailing'

const BOW_TURN = new THREE.Quaternion().setFromEuler(new THREE.Euler(0, MODEL_BOW_OFFSET, 0))

const _tilt = new THREE.Euler()

export function useHullFoam(
  groupRef: RefObject<THREE.Group | null>,
  sailing: ShipSailing,
  hullOutline: HullOutline | null
) {
  const meshRef = useRef<THREE.Mesh>(null)
  const material = useMemo(() => createHullFoamMaterial(), [])
  const geometry = useMemo(
    () => hullOutline && buildHullFieldQuad(hullOutline.field),
    [hullOutline]
  )
  const texture = useMemo(
    () => hullOutline && createDistanceTexture(hullOutline.field),
    [hullOutline]
  )

  useEffect(() => () => material.dispose(), [material])
  useEffect(() => () => disposeAll(geometry, texture), [geometry, texture])

  useFrame(({ clock }) => {
    const group = groupRef.current
    const mesh = meshRef.current
    if (!group || !mesh || !hullOutline) return

    const time = clock.getElapsedTime()
    const tuning = useDebugStore.getState().ship
    const cycle = useCycleStore.getState()

    const { x, z } = group.position
    const { lean, heading } = sailing
    mesh.position.set(x, tuning.foamY - whirlpoolDip(x, z), z)
    mesh.quaternion.setFromEuler(_tilt.set(lean.x, heading, lean.y, 'YXZ')).multiply(BOW_TURN)
    mesh.scale.setScalar(hullOutline.modelScale)

    const { uniforms } = mesh.material as THREE.ShaderMaterial
    uniforms.uTime.value = time
    uniforms.uHullField.value = texture
    uniforms.uModelScale.value = hullOutline.modelScale
    uniforms.uReach.value = foamReachAt(tuning, time)
    uniforms.uColor.value
      .copy(cycle.foamColor)
      .lerp(algaeUniforms.uAlgaeGlow.value, algaeAt(group.position.x, group.position.z))
  })

  return { meshRef, material, geometry }
}
