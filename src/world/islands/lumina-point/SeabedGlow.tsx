import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import type * as THREE from 'three'
import { buildFlatQuad } from '@/utils/geometry'
import { uniformsOf } from '@/utils/meshes'
import { createDistanceTexture } from '@/world/shore/shorelineModel'
import { createSeabedGlowMaterial, traceSeabedGlow } from './seabedCircuitModel'

interface SeabedGlowProps {
  land: THREE.Object3D
  color: THREE.Color
  waterY: number
  seaLevel: number
  level: () => number
}

export default function SeabedGlow({ land, color, waterY, seaLevel, level }: SeabedGlowProps) {
  const meshRef = useRef<THREE.Mesh>(null)
  const field = useMemo(() => traceSeabedGlow(land, waterY), [land, waterY])
  const texture = useMemo(() => field && createDistanceTexture(field), [field])
  const geometry = useMemo(() => buildFlatQuad(), [])
  const material = useMemo(() => createSeabedGlowMaterial(color), [color])

  useEffect(() => () => texture?.dispose(), [texture])
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
    const glow = level()
    mesh.visible = glow > 0
    const uniforms = uniformsOf(mesh)
    uniforms.uField.value = texture
    uniforms.uGlow.value = glow
    uniforms.uTime.value = clock.getElapsedTime()
  })

  if (!field) return null

  return (
    <mesh
      ref={meshRef}
      geometry={geometry}
      material={material}
      position={[field.centerX, seaLevel, field.centerZ]}
      scale={[field.size, 1, field.size]}
      visible={false}
      renderOrder={3}
    />
  )
}
