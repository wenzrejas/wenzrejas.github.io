import { useEffect, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import type * as THREE from 'three'
import type { WallClock } from '@/utils/time'
import { advancePoints } from './pointMaterial'

interface DepthPointsProps {
  buildGeometry: () => THREE.BufferGeometry
  createMaterial: () => THREE.ShaderMaterial
  clock: WallClock
}

export default function DepthPoints({ buildGeometry, createMaterial, clock }: DepthPointsProps) {
  const geometry = useMemo(() => buildGeometry(), [buildGeometry])
  const material = useMemo(() => createMaterial(), [createMaterial])

  useEffect(
    () => () => {
      geometry.dispose()
      material.dispose()
    },
    [geometry, material]
  )

  useFrame(({ camera, gl, size }) =>
    advancePoints(
      material,
      camera as THREE.PerspectiveCamera,
      size.height * gl.getPixelRatio(),
      clock.elapsed
    )
  )

  return <points geometry={geometry} material={material} frustumCulled={false} />
}
