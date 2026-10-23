import { useEffect, useMemo } from 'react'
import { createPortal, useFrame } from '@react-three/fiber'
import type * as THREE from 'three'
import { RENDER_LAYER } from '@/app/experience/renderLayers'
import type { WallClock } from '@/utils/time'
import { RUIN_LIFE_FRAME_PRIORITY } from '@/depths/scene/constants'
import { driftParticles, type DriftTuning } from './particleDrift'
import { buildDriftGeometry, createDriftMaterial } from './driftPointsModel'

interface DriftPointsProps {
  node: THREE.Object3D
  origin: [number, number, number]
  tuning: DriftTuning
  clock: WallClock
  glow: () => number
}

export default function DriftPoints({ node, origin, tuning, clock, glow }: DriftPointsProps) {
  const geometry = useMemo(() => buildDriftGeometry(tuning), [tuning])
  const material = useMemo(() => createDriftMaterial(tuning), [tuning])

  useEffect(
    () => () => {
      geometry.dispose()
      material.dispose()
    },
    [geometry, material]
  )

  useFrame(
    ({ camera, gl, size }) =>
      driftParticles(
        material,
        clock.elapsed,
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
      position={origin}
      frustumCulled={false}
      renderOrder={RENDER_LAYER.glow}
    />,
    node
  )
}
