import { useEffect, useMemo } from 'react'
import { createPortal, useFrame } from '@react-three/fiber'
import type * as THREE from 'three'
import { RENDER_LAYER } from '@/app/experience/renderLayers'
import {
  buildGemHaloGeometry,
  createGemHaloMaterial,
  type GemHaloTuning,
  type HaloGem,
} from '@/world/islands/shared/gem-halo/gemHaloModel'
import { RUIN_LIFE_FRAME_PRIORITY } from '@/depths/scene/constants'
import { shineHalo } from './haloGlow'

interface RuinHaloProps {
  ruin: THREE.Object3D
  halos: HaloGem[]
  tuning: GemHaloTuning
  glow: () => number
}

export default function RuinHalo({ ruin, halos, tuning, glow }: RuinHaloProps) {
  const geometry = useMemo(() => buildGemHaloGeometry(halos, tuning), [halos, tuning])
  const material = useMemo(() => createGemHaloMaterial(tuning), [tuning])

  useEffect(
    () => () => {
      geometry.dispose()
      material.dispose()
    },
    [geometry, material]
  )

  useFrame(
    ({ camera, gl, size }) =>
      shineHalo(
        material,
        ruin,
        glow(),
        camera as THREE.PerspectiveCamera,
        size.height * gl.getPixelRatio()
      ),
    RUIN_LIFE_FRAME_PRIORITY
  )

  return createPortal(
    <points
      geometry={geometry}
      material={material}
      frustumCulled={false}
      renderOrder={RENDER_LAYER.glow}
    />,
    ruin
  )
}
