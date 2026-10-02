import { useMemo, useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import type * as THREE from 'three'
import { startSkyBeam, useSkyBeamStore } from '@/store/skyBeamStore'
import InteractionMarker from '@/interaction/InteractionMarker'
import { easeHover } from '@/interaction/hover'
import GroundGlow from '../shared/ground-glow/GroundGlow'
import { SUMMIT_GLOW } from './constants'
import { highlightGlow, type MainIsland } from './mainIsland'

interface MainIslandInteractionProps {
  mainIsland: MainIsland
  islandScale: number
}

export default function MainIslandInteraction({
  mainIsland,
  islandScale,
}: MainIslandInteractionProps) {
  const [isHovered, setHovered] = useState(false)
  const isSkyBeamActive = useSkyBeamStore((s) => s.isActive)

  const summitSites = useMemo(() => [mainIsland.summit], [mainIsland])
  const effectsRef = useRef<THREE.Group>(null)

  useFrame((_, delta) => {
    easeHover(mainIsland, isHovered, delta)
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
          label="Send A Message"
          onHover={setHovered}
          onActivate={startSkyBeam}
        />
      )}
    </>
  )
}
