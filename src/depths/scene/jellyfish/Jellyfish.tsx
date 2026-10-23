import { useEffect, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { RENDER_LAYER } from '@/app/experience/renderLayers'
import type { WallClock } from '@/utils/time'
import { buildJellyfishGeometry, createJellyfishMaterial } from './jellyfishModel'
import { pulseJellyfish } from './jellyfishPulse'

interface JellyfishProps {
  clock: WallClock
}

export default function Jellyfish({ clock }: JellyfishProps) {
  const geometry = useMemo(() => buildJellyfishGeometry(), [])
  const material = useMemo(() => createJellyfishMaterial(), [])

  useEffect(
    () => () => {
      geometry.dispose()
      material.dispose()
    },
    [geometry, material]
  )

  useFrame(() => pulseJellyfish(material, clock.elapsed))

  return (
    <mesh
      geometry={geometry}
      material={material}
      frustumCulled={false}
      renderOrder={RENDER_LAYER.glow}
    />
  )
}
