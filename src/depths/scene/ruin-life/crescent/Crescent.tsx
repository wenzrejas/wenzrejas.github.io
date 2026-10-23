import { useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { RUIN_LIFE_FRAME_PRIORITY } from '@/depths/scene/constants'
import type { MilestoneProps } from '../shared/milestone'
import RuinGlints from '../shared/RuinGlints'
import RuinHalo from '../shared/RuinHalo'
import { wakeShare, wakeStrength } from '../shared/ruinWake'
import { CRESCENT_GLINTS, SAPPHIRE_HALO } from './constants'
import { findSapphireMoon, pulseSapphire } from './sapphireGlow'

export default function Crescent({ ruin, level, timeline, clock }: MilestoneProps) {
  const moon = useMemo(() => findSapphireMoon(ruin), [ruin])
  const strength = () => wakeStrength(wakeShare(timeline, level))

  useFrame(
    () => pulseSapphire(moon, clock.elapsed, wakeShare(timeline, level)),
    RUIN_LIFE_FRAME_PRIORITY
  )

  return (
    <>
      <RuinHalo ruin={ruin} halos={moon.halos} tuning={SAPPHIRE_HALO} glow={strength} />
      <RuinGlints gem={moon.glintGem} tuning={CRESCENT_GLINTS} clock={clock} glow={strength} />
    </>
  )
}
