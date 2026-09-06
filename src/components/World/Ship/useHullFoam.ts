import { useEffect, useMemo, useRef, type RefObject } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import FOAM_VERT from './shaders/foam.vert.glsl'
import FOAM_FRAG from './shaders/foam.frag.glsl'
import { FOAM_PLANE_SIZE, hullFoamBound } from './constants'
import { useDebugStore } from '../../../store/debugStore'
import { useCycleStore } from '../../../store/cycleStore'

const BOB_PULSE = 0.008

/**
 * Owns the foam plane's material and drives it from the ship's transform.
 * Must be called after useShipMovement so it reads this frame's position
 * rather than last frame's.
 */
export function useHullFoam(
  groupRef: RefObject<THREE.Group | null>,
  headingRef: RefObject<number>
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

    mesh.position.set(group.position.x, foamY, group.position.z)
    mesh.rotation.set(-Math.PI / 2, headingRef.current, 0, 'YXZ')

    material.uniforms.uTime.value = time
    material.uniforms.uFoamBound.value = bound - Math.sin(time * bobSpeed) * BOB_PULSE
    material.uniforms.uHullAspect.value = modelSize / (2 * bound * FOAM_PLANE_SIZE)
    material.uniforms.uColor.value.copy(cycle.foamColor)
  })

  return { meshRef, material }
}
