import { useFrame } from '@react-three/fiber'
import { openInNewTab } from '@/utils/links'
import { setHovered } from '@/interaction/hover'
import InteractionMarker from '@/interaction/InteractionMarker'
import { MONOLITH_SHIP_REACH } from './constants'
import { easeHovers, type Monolith } from './monoliths'

interface MonolithLinksProps {
  monoliths: Monolith[]
}

export default function MonolithLinks({ monoliths }: MonolithLinksProps) {
  useFrame((_, delta) => easeHovers(monoliths, delta))

  return monoliths.map((monolith, i) => (
    <InteractionMarker
      key={i}
      position={monolith.marker}
      label={monolith.label}
      onHover={(isHovered) => setHovered(monolith, isHovered)}
      onActivate={() => openInNewTab(monolith.link)}
      shipReach={MONOLITH_SHIP_REACH}
    />
  ))
}
