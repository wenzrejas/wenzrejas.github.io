import { Shadow } from '@react-three/drei'
import type { ContactBlob, IslandModelTuning } from './islandSpec'

interface IslandShadowProps {
  radius: number
  tuning: IslandModelTuning
  blob: ContactBlob
}

export default function IslandShadow({ radius, tuning, blob }: IslandShadowProps) {
  return (
    <Shadow
      position={[tuning.offsetX, blob.y, tuning.offsetZ]}
      scale={radius * 2 * tuning.scale * blob.spread}
      color={blob.color}
      opacity={blob.opacity}
      renderOrder={2}
    />
  )
}
