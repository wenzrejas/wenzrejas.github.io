import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import type * as THREE from 'three'
import { uniformsOf } from '@/utils/meshes'
import FieldQuad from '@/world/shore/FieldQuad'
import { RENDER_LAYER } from '@/app/experience/renderLayers'
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
  const material = useMemo(() => createSeabedGlowMaterial(color), [color])

  useEffect(() => () => material.dispose(), [material])

  useFrame(({ clock }) => {
    const mesh = meshRef.current
    if (!mesh) return
    const glow = level()
    mesh.visible = glow > 0
    const uniforms = uniformsOf(mesh)
    uniforms.uGlow.value = glow
    uniforms.uTime.value = clock.getElapsedTime()
  })

  if (!field) return null

  return (
    <FieldQuad
      ref={meshRef}
      field={field}
      material={material}
      seaLevel={seaLevel}
      renderOrder={RENDER_LAYER.waterSurface}
    />
  )
}
