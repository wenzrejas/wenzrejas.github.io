import { useEffect, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { IS_DEBUG } from '../../Experience/constants'
import { useDebugStore } from '../../../store/debugStore'
import { useCycleStore } from '../../../store/cycleStore'
import VERT from './shaders/boundary.vert.glsl'
import FRAG from './shaders/boundary.frag.glsl'

function BoundaryFog() {
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        uniforms: {
          uTime: { value: 0 },
          uCenter: { value: new THREE.Vector2(0, 0) },
          uRadius: { value: 0 },
          uFalloff: { value: 0 },
          uColor: { value: new THREE.Color() },
        },
        vertexShader: VERT,
        fragmentShader: FRAG,
      }),
    []
  )

  useEffect(() => () => material.dispose(), [material])

  useFrame(({ clock }) => {
    const boundary = useDebugStore.getState().boundary
    const cycle = useCycleStore.getState()
    material.uniforms.uTime.value = clock.getElapsedTime()
    material.uniforms.uRadius.value = boundary.radius
    material.uniforms.uFalloff.value = boundary.falloff
    material.uniforms.uColor.value.copy(cycle.fogColor)
  })

  return (
    <mesh rotation-x={-Math.PI / 2} position-y={8} frustumCulled={false} renderOrder={10}>
      <circleGeometry args={[1500, 256]} />
      <primitive object={material} attach="material" />
    </mesh>
  )
}

function BoundaryRing() {
  const { radius } = useDebugStore((s) => s.boundary)
  return (
    <mesh rotation-x={-Math.PI / 2} position-y={3} renderOrder={1}>
      <ringGeometry args={[radius - 1, radius + 1, 128]} />
      <meshBasicMaterial
        color="#ff4444"
        transparent
        opacity={0.5}
        side={THREE.DoubleSide}
        depthWrite={false}
      />
    </mesh>
  )
}

export default function Boundary() {
  return (
    <>
      <BoundaryFog />
      {IS_DEBUG && <BoundaryRing />}
    </>
  )
}
