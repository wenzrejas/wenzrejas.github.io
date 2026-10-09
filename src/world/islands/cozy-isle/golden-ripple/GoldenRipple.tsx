import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import type * as THREE from 'three'
import { uniformsOf } from '@/utils/meshes'
import { OCEAN_Y } from '@/world/environment/ocean/constants'
import { SHORE_Y } from '@/world/shore/constants'
import { islandLocalY } from '@/world/islands/shared/islandSpec'
import FieldQuad from '@/world/shore/FieldQuad'
import type { HoverTimeline } from '@/world/islands/shared/hoverTimeline'
import { RENDER_LAYER } from '@/app/experience/renderLayers'
import { createGoldenRippleMaterial, traceGoldenRippleField } from './goldenRippleModel'

interface GoldenRippleProps {
  land: THREE.Object3D
  islandScale: number
  offsetY: number
  cafeBreak: HoverTimeline
}

export default function GoldenRipple({ land, islandScale, offsetY, cafeBreak }: GoldenRippleProps) {
  const meshRef = useRef<THREE.Mesh>(null)
  const waterY = islandLocalY(OCEAN_Y, islandScale, offsetY)
  const field = useMemo(() => traceGoldenRippleField(land, waterY), [land, waterY])
  const material = useMemo(() => createGoldenRippleMaterial(), [])

  useEffect(() => () => material.dispose(), [material])

  useFrame(() => {
    const mesh = meshRef.current
    if (!mesh) return

    mesh.visible = cafeBreak.presence > 0
    if (!mesh.visible) return

    const uniforms = uniformsOf(mesh)
    uniforms.uSeconds.value = cafeBreak.engagedSeconds
    uniforms.uPresence.value = cafeBreak.presence
  })

  if (!field) return null

  return (
    <FieldQuad
      ref={meshRef}
      field={field}
      material={material}
      seaLevel={islandLocalY(SHORE_Y, islandScale, offsetY)}
      renderOrder={RENDER_LAYER.inWater}
    />
  )
}
