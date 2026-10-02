import { useEffect, useMemo, useRef, type RefObject } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import FOAM_VERT from './shaders/foam.vert.glsl'
import FOAM_FRAG from './shaders/foam.frag.glsl'
import { FOAM_PLANE_SIZE, HULL_BOB_PULSE, hullFoamBound } from './constants'
import { useDebugStore } from '@/store/debugStore'
import { useCycleStore } from '@/store/cycleStore'
import { algaeAt, algaeUniforms } from '../wildlife/algae/algaeField'
import { whirlpoolDip } from '../islands/timewell-depth/whirlpoolFunnel'

const LYING_FLAT = new THREE.Quaternion().setFromEuler(new THREE.Euler(-Math.PI / 2, 0, 0))

const _tilt = new THREE.Euler()

/**
 * Owns the foam plane's material and drives it from the ship's transform.
 * Must be called after useShipMovement so it reads this frame's position
 * rather than last frame's.
 */
export function useHullFoam(
  groupRef: RefObject<THREE.Group | null>,
  headingRef: RefObject<number>,
  leanRef: RefObject<THREE.Vector2>
) {
  const meshRef = useRef<THREE.Mesh>(null)

  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        side: THREE.DoubleSide,
        uniforms: {
          uTime: { value: 0 },
          uFoamBound: { value: 0.13 },
          uHullAspect: { value: 1.0 },
          uColor: { value: new THREE.Color(1, 1, 1) },
        },
        vertexShader: FOAM_VERT,
        fragmentShader: FOAM_FRAG,
      }),
    []
  )

  useEffect(() => () => material.dispose(), [material])

  useFrame(({ clock }) => {
    const group = groupRef.current
    const mesh = meshRef.current
    if (!group || !mesh) return

    const time = clock.getElapsedTime()
    const { modelSize, foamWidth, foamY, bobSpeed } = useDebugStore.getState().ship
    const cycle = useCycleStore.getState()
    const bound = hullFoamBound(modelSize, foamWidth)

    const { x, z } = group.position
    const lean = leanRef.current
    mesh.position.set(x, foamY - whirlpoolDip(x, z), z)
    mesh.quaternion
      .setFromEuler(_tilt.set(lean.x, headingRef.current, lean.y, 'YXZ'))
      .multiply(LYING_FLAT)

    const { uniforms } = mesh.material as THREE.ShaderMaterial
    uniforms.uTime.value = time
    uniforms.uFoamBound.value = bound - Math.sin(time * bobSpeed) * HULL_BOB_PULSE
    uniforms.uHullAspect.value = modelSize / (2 * bound * FOAM_PLANE_SIZE)
    uniforms.uColor.value
      .copy(cycle.foamColor)
      .lerp(algaeUniforms.uAlgaeGlow.value, algaeAt(group.position.x, group.position.z))
  })

  return { meshRef, material }
}
