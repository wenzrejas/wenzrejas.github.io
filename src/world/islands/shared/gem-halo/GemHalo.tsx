import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import type * as THREE from 'three'
import { RENDER_LAYER } from '@/app/experience/renderLayers'
import { pixelsPerUnit } from '@/utils/screen'
import {
  buildGemHaloGeometry,
  createGemHaloMaterial,
  type GemHaloTuning,
  type HaloGem,
} from './gemHaloModel'

interface GemHaloProps {
  gems: HaloGem[]
  tuning: GemHaloTuning
  islandScale: number
  level: () => number
}

export default function GemHalo({ gems, tuning, islandScale, level }: GemHaloProps) {
  const haloRef = useRef<THREE.Points>(null)
  const geometry = useMemo(() => buildGemHaloGeometry(gems, tuning), [gems, tuning])
  const material = useMemo(() => createGemHaloMaterial(tuning), [tuning])

  useEffect(
    () => () => {
      geometry.dispose()
      material.dispose()
    },
    [geometry, material]
  )

  useFrame(({ camera, gl }) => {
    const halo = haloRef.current
    if (!halo) return

    const { uniforms } = halo.material as THREE.ShaderMaterial
    uniforms.uGlow.value = level()
    uniforms.uPixelsPerUnit.value = pixelsPerUnit(camera, gl) * islandScale
  })

  return (
    <points ref={haloRef} geometry={geometry} material={material} renderOrder={RENDER_LAYER.glow} />
  )
}
