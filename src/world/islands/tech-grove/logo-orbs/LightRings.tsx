import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import type * as THREE from 'three'
import { buildFlatQuad } from '@/utils/geometry'
import { uniformsOf } from '@/utils/meshes'
import { RENDER_LAYER } from '@/app/experience/renderLayers'
import { RING_LAYER_COUNT } from './constants'
import { createLightRingMaterial, ringLayerLift, ringLayerSize } from './lightRingModel'
import { ringReveal, type Orbit } from './orbits'
import { orbGlow } from '../sanctuaryGlow'

interface LightRingsProps {
  orbits: Orbit[]
}

const LAYERS = Array.from({ length: RING_LAYER_COUNT }, (_, layer) => layer)

export default function LightRings({ orbits }: LightRingsProps) {
  const meshes = useRef<(THREE.Mesh | null)[]>([])

  const rings = useMemo(
    () => orbits.flatMap((orbit) => LAYERS.map((layer) => ({ orbit, layer }))),
    [orbits]
  )
  const geometry = useMemo(() => buildFlatQuad(), [])
  const materials = useMemo(
    () =>
      rings.map(({ orbit, layer }) =>
        createLightRingMaterial(orbit.statue.pedestalGlow.color, layer)
      ),
    [rings]
  )

  useEffect(
    () => () => {
      geometry.dispose()
      for (const material of materials) material.dispose()
    },
    [geometry, materials]
  )

  useFrame(({ clock }) => {
    const time = clock.getElapsedTime()
    const glow = orbGlow()
    rings.forEach(({ orbit, layer }, i) => {
      const mesh = meshes.current[i]
      if (!mesh) return
      const reveal = ringReveal(orbit, layer)
      mesh.visible = reveal > 0
      if (!mesh.visible) return
      const uniforms = uniformsOf(mesh)
      uniforms.uReveal.value = reveal
      uniforms.uTime.value = time
      uniforms.uGlow.value = glow
    })
  })

  return rings.map(({ orbit, layer }, i) => {
    const { center, radius } = orbit.statue.pedestalGlow
    return (
      <mesh
        key={`${orbit.statue.grove}-${layer}`}
        ref={(mesh) => {
          meshes.current[i] = mesh
        }}
        position={[center.x, center.y + ringLayerLift(layer), center.z]}
        scale={ringLayerSize(radius, layer)}
        geometry={geometry}
        material={materials[i]}
        renderOrder={RENDER_LAYER.glow}
        visible={false}
      />
    )
  })
}
