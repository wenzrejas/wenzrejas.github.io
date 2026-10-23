import { useEffect, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import type * as THREE from 'three'
import type { WallClock } from '@/utils/time'
import { driftMotes } from './depthMotes'
import { buildMoteGeometry, createMoteMaterial } from './depthParticlesModel'

interface DepthParticlesProps {
  clock: WallClock
}

export default function DepthParticles({ clock }: DepthParticlesProps) {
  const geometry = useMemo(() => buildMoteGeometry(), [])
  const material = useMemo(() => createMoteMaterial(), [])

  useEffect(
    () => () => {
      geometry.dispose()
      material.dispose()
    },
    [geometry, material]
  )

  useFrame(({ camera, gl, size }) =>
    driftMotes(
      material,
      camera as THREE.PerspectiveCamera,
      size.height * gl.getPixelRatio(),
      clock.elapsed
    )
  )

  return <points geometry={geometry} material={material} frustumCulled={false} />
}
