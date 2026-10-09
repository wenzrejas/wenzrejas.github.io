import { useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { ISLAND_COPY } from '@/data/islandCopy'
import { openPanel } from '@/store/panelStore'
import { useSkyBeamStore } from '@/store/skyBeamStore'
import InteractionMarker from '@/interaction/InteractionMarker'
import { easeHover, setHovered } from '@/interaction/hover'
import GroundGlow from '../shared/ground-glow/GroundGlow'
import { MAIN_ISLAND_TOUCH_REACH, SUMMIT_GLOW } from './constants'
import { highlightGlow, isMainIslandEngaged, type MainIsland } from './mainIsland'

interface MainIslandInteractionProps {
  mainIsland: MainIsland
  islandScale: number
}

export default function MainIslandInteraction({
  mainIsland,
  islandScale,
}: MainIslandInteractionProps) {
  const isSkyBeamActive = useSkyBeamStore((s) => s.isActive)

  const summitSites = useMemo(() => [mainIsland.summit], [mainIsland])

  useFrame((_, delta) => easeHover(mainIsland, isMainIslandEngaged(mainIsland), delta))

  return (
    <>
      <GroundGlow
        sites={summitSites}
        tuning={SUMMIT_GLOW}
        islandScale={islandScale}
        level={() => highlightGlow(mainIsland)}
      />
      {!isSkyBeamActive && (
        <InteractionMarker
          position={mainIsland.marker}
          label={ISLAND_COPY.lumina.marker}
          onHover={(isHovered) => setHovered(mainIsland, isHovered)}
          onActivate={(markerSpot) => openPanel('contact', markerSpot)}
          shipReach={MAIN_ISLAND_TOUCH_REACH}
          baseGap={mainIsland.baseGap}
        />
      )}
    </>
  )
}
