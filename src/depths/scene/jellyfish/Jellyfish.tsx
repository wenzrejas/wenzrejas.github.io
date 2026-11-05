import { useEffect, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { RENDER_LAYER } from '@/app/experience/renderLayers'
import type { WallClock } from '@/utils/time'
import { disposeAll } from '@/utils/dispose'
import { buildJellyfishGeometry, createJellyfishMaterial } from './jellyfishModel'
import { pulseJellyfish } from './jellyfishPulse'

interface JellyfishProps {
  clock: WallClock
}

export default function Jellyfish({ clock }: JellyfishProps) {
  const geometry = useMemo(() => buildJellyfishGeometry(), [])
  const material = useMemo(() => createJellyfishMaterial(), [])

  useEffect(() => () => disposeAll(geometry, material), [geometry, material])

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
