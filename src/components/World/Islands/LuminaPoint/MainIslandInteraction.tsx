import { useMemo, useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import type * as THREE from 'three'
import ActionTooltip from '../../../Interaction/ActionTooltip'
import HitArea from '../../../Interaction/HitArea'
import SendIcon from '../../../Interaction/icons/SendIcon'
import GroundGlow from '../GroundGlow/GroundGlow'
import { SUMMIT_GLOW } from './constants'
import { easeHover } from './hover'
import { highlightGlow, type MainIsland } from './mainIsland'
import RisingGlow from './RisingGlow'

interface MainIslandInteractionProps {
  mainIsland: MainIsland
  islandScale: number
}

export default function MainIslandInteraction({
  mainIsland,
  islandScale,
}: MainIslandInteractionProps) {
  const [isIslandHovered, setIslandHovered] = useState(false)
  const [isTooltipHovered, setTooltipHovered] = useState(false)
  const isHovered = isIslandHovered || isTooltipHovered

  const summitSites = useMemo(() => [mainIsland.summit], [mainIsland])
  const effectsRef = useRef<THREE.Group>(null)

  useFrame((_, delta) => {
    easeHover(mainIsland, isHovered, delta)
    if (effectsRef.current) effectsRef.current.visible = mainIsland.hoverBlend > 0
  })

  return (
    <>
      <HitArea
        position={mainIsland.body.center}
        size={mainIsland.body.size}
        onHover={setIslandHovered}
      />
      <HitArea
        position={mainIsland.lighthouse.center}
        size={mainIsland.lighthouse.size}
        onHover={setIslandHovered}
      />
      <group ref={effectsRef}>
        <GroundGlow
          sites={summitSites}
          tuning={SUMMIT_GLOW}
          islandScale={islandScale}
          level={() => highlightGlow(mainIsland)}
        />
        <RisingGlow
          site={mainIsland.shore}
          level={() => highlightGlow(mainIsland)}
          rise={() => mainIsland.hoverBlend}
        />
      </group>
      <ActionTooltip
        position={mainIsland.body.center}
        icon={<SendIcon />}
        label="Send a message"
        isShown={isHovered}
        onHover={setTooltipHovered}
      />
    </>
  )
}
