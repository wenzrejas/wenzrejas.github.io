import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import type * as THREE from 'three'
import { uniformsOf } from '@/utils/meshes'
import { dayNightGlow } from '@/world/islands/shared/nightGlow'
import type { HoverTimeline } from '@/world/islands/shared/hoverTimeline'
import { RENDER_LAYER } from '@/app/experience/renderLayers'
import { echoLevel } from '../awakening'
import {
  AWAKEN_DAY_SHARE,
  WHIRLPOOL_EYE_X,
  WHIRLPOOL_EYE_Z,
  WHIRLPOOL_FUNNEL_DEPTH,
} from '../constants'
import { VORTEX_BEAM_LAYERS } from './constants'
import { buildVortexBeamGeometry, createVortexBeamMaterial } from './vortexBeamModel'

interface VortexBeamProps {
  awakening: HoverTimeline
}

export default function VortexBeam({ awakening }: VortexBeamProps) {
  const groupRef = useRef<THREE.Group>(null)
  const geometry = useMemo(() => buildVortexBeamGeometry(), [])
  const materials = useMemo(() => VORTEX_BEAM_LAYERS.map(createVortexBeamMaterial), [])

  useEffect(
    () => () => {
      geometry.dispose()
      for (const material of materials) material.dispose()
    },
    [geometry, materials]
  )

  useFrame(({ clock }) => {
    const group = groupRef.current
    if (!group) return
    const level = echoLevel(awakening)
    group.visible = level > 0
    if (!group.visible) return
    const glow = level * dayNightGlow(AWAKEN_DAY_SHARE)
    for (const layer of group.children) {
      const uniforms = uniformsOf(layer as THREE.Mesh)
      uniforms.uGlow.value = glow
      uniforms.uTime.value = clock.getElapsedTime()
    }
  })

  return (
    <group
      ref={groupRef}
      position={[WHIRLPOOL_EYE_X, -WHIRLPOOL_FUNNEL_DEPTH, WHIRLPOOL_EYE_Z]}
      visible={false}
    >
      {VORTEX_BEAM_LAYERS.map((layer, i) => (
        <mesh
          key={i}
          geometry={geometry}
          material={materials[i]}
          scale={[layer.spread, layer.height, layer.spread]}
          renderOrder={RENDER_LAYER.glow}
        />
      ))}
    </group>
  )
}
