import { useEffect, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { RENDER_LAYER } from '@/app/experience/renderLayers'
import type { WallClock } from '@/utils/time'
import { surfaceDaylight } from '../surface-daylight/surfaceDaylight'
import { shimmerRays } from './rayShimmer'
import { buildRayGeometry, createRayMaterial } from './lightRaysModel'

interface LightRaysProps {
  clock: WallClock
}

export default function LightRays({ clock }: LightRaysProps) {
  const geometry = useMemo(() => buildRayGeometry(), [])
  const material = useMemo(() => createRayMaterial(), [])

  useEffect(
    () => () => {
      geometry.dispose()
      material.dispose()
    },
    [geometry, material]
  )

  useFrame(() => shimmerRays(material, clock.elapsed, surfaceDaylight()))

  return <mesh geometry={geometry} material={material} renderOrder={RENDER_LAYER.glow} />
}
