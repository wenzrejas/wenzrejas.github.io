import { useFrame } from '@react-three/fiber'
import HitArea from '../../../Interaction/HitArea'
import { HIT_AREA_WIDTH } from './constants'
import { easeHovers, type Monolith } from './monoliths'

interface MonolithLinksProps {
  monoliths: Monolith[]
}

export default function MonolithLinks({ monoliths }: MonolithLinksProps) {
  useFrame((_, delta) => easeHovers(monoliths, delta))

  return monoliths.map((monolith, i) => (
    <group key={i} position={monolith.origin}>
      <HitArea
        position={[0, monolith.hitHeight / 2, 0]}
        size={[HIT_AREA_WIDTH, monolith.hitHeight, HIT_AREA_WIDTH]}
        onHover={(isHovered) => {
          monolith.isHovered = isHovered
        }}
        onActivate={() => window.open(monolith.link, '_blank', 'noopener,noreferrer')}
      />
    </group>
  ))
}
