import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import type * as THREE from 'three'
import { ISLAND_COPY } from '@/data/islandCopy'
import { openPanel } from '@/store/panelStore'
import { useSkyBeamStore } from '@/store/skyBeamStore'
import InteractionMarker from '@/interaction/InteractionMarker'
import { easeHover } from '@/interaction/hover'
import GroundGlow from '../shared/ground-glow/GroundGlow'
import { MAIN_ISLAND_TOUCH_REACH, SUMMIT_GLOW } from './constants'
import {
  highlightGlow,
  isMainIslandEngaged,
  setMainIslandHovered,
  type MainIsland,
} from './mainIsland'

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
  const effectsRef = useRef<THREE.Group>(null)

  useFrame((_, delta) => {
    easeHover(mainIsland, isMainIslandEngaged(mainIsland), delta)
    if (effectsRef.current) effectsRef.current.visible = mainIsland.hoverBlend > 0
  })

  return (
    <>
      <group ref={effectsRef}>
        <GroundGlow
          sites={summitSites}
          tuning={SUMMIT_GLOW}
          islandScale={islandScale}
          level={() => highlightGlow(mainIsland)}
        />
      </group>
      {!isSkyBeamActive && (
        <InteractionMarker
          position={mainIsland.marker}
          label={ISLAND_COPY.lumina.marker}
          onHover={(isHovered) => setMainIslandHovered(mainIsland, isHovered)}
          onActivate={(markerSpot) => openPanel('contact', markerSpot)}
          shipReach={MAIN_ISLAND_TOUCH_REACH}
          baseGap={mainIsland.baseGap}
        />
      )}
    </>
  )
}
