import { useEffect, useMemo, useRef, type RefObject } from 'react'
import { useFrame } from '@react-three/fiber'
import type * as THREE from 'three'
import { uniformsOf } from '@/utils/meshes'
import { SLIPSTREAM_HIDE_BELOW } from './constants'
import { buildSlipstreamGeometry, createSlipstreamMaterial } from './slipstreamModel'

interface SlipstreamProps {
  tailwindRef: RefObject<number>
}

export default function Slipstream({ tailwindRef }: SlipstreamProps) {
  const meshRef = useRef<THREE.Mesh>(null)
  const geometry = useMemo(() => buildSlipstreamGeometry(), [])
  const material = useMemo(() => createSlipstreamMaterial(), [])

  useEffect(
    () => () => {
      geometry.dispose()
      material.dispose()
    },
    [geometry, material]
  )

  useFrame(({ clock }) => {
    const mesh = meshRef.current
    if (!mesh) return
    mesh.visible = tailwindRef.current > SLIPSTREAM_HIDE_BELOW
    const uniforms = uniformsOf(mesh)
    uniforms.uTime.value = clock.getElapsedTime()
    uniforms.uStrength.value = tailwindRef.current
  })

  return (
    <mesh
      ref={meshRef}
      geometry={geometry}
      material={material}
      visible={false}
      frustumCulled={false}
      renderOrder={5}
    />
  )
}
