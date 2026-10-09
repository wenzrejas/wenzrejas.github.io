import { useMemo } from 'react'
import type * as THREE from 'three'
import { displayColorOf } from '@/utils/color'
import GroundGlow from '@/world/islands/shared/ground-glow/GroundGlow'
import type { HoverTimeline } from '@/world/islands/shared/hoverTimeline'
import { flareLevel } from '../cafeBreak'
import { FIRE_FLARE_GLOW, FLARE_GLOW_COLOR, FLARE_GLOW_RADIUS } from './constants'
import { fireGlow } from './fireGlow'

interface CampfireFlareProps {
  base: THREE.Vector3
  islandScale: number
  cafeBreak: HoverTimeline
}

export default function CampfireFlare({ base, islandScale, cafeBreak }: CampfireFlareProps) {
  const sites = useMemo(
    () => [{ center: base, radius: FLARE_GLOW_RADIUS, color: displayColorOf(FLARE_GLOW_COLOR) }],
    [base]
  )

  return (
    <GroundGlow
      sites={sites}
      tuning={FIRE_FLARE_GLOW}
      islandScale={islandScale}
      level={() => flareLevel(cafeBreak) * fireGlow()}
    />
  )
}
