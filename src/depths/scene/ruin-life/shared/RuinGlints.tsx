import { useEffect, useMemo } from 'react'
import { createPortal, useFrame } from '@react-three/fiber'
import type * as THREE from 'three'
import { RENDER_LAYER } from '@/app/experience/renderLayers'
import type { WallClock } from '@/utils/time'
import {
  buildSparkleGeometry,
  createSparkleMaterial,
} from '@/world/islands/shared/gem-sparkles/gemSparklesModel'
import type {
  CornerSparkleTuning,
  SparkleGem,
} from '@/world/islands/shared/gem-sparkles/sparkleSpots'
import { RUIN_LIFE_FRAME_PRIORITY } from '@/depths/scene/constants'
import { flashGlints } from './glintFlash'

interface RuinGlintsProps {
  gem: SparkleGem
  tuning: CornerSparkleTuning
  clock: WallClock
  glow: () => number
}

export default function RuinGlints({ gem, tuning, clock, glow }: RuinGlintsProps) {
  const geometry = useMemo(() => buildSparkleGeometry(gem.sparkleSpots, tuning), [gem, tuning])
  const material = useMemo(() => createSparkleMaterial(gem.color, tuning), [gem, tuning])

  useEffect(
    () => () => {
      geometry.dispose()
      material.dispose()
    },
    [geometry, material]
  )

  useFrame(
    ({ camera, gl, size }) =>
      flashGlints(
        material,
        gem.node,
        tuning.size,
        glow(),
        clock.elapsed,
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
    gem.node
  )
}
