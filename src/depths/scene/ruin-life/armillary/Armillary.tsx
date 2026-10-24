import { useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { RUIN_LIFE_FRAME_PRIORITY } from '@/depths/scene/constants'
import type { MilestoneProps } from '../shared/milestone'
import RuinHalo from '../shared/RuinHalo'
import { wakeShare } from '../shared/ruinWake'
import { beaconGlow, findArmillaryOrb, findBeaconHalos, pulseOrb } from './armillaryGlow'
import { BEACON_HALO } from './constants'
import { findGimbalRings, turnGimbal } from './ringGimbal'

export default function Armillary({ ruin, level, timeline, clock }: MilestoneProps) {
  const orb = useMemo(() => findArmillaryOrb(ruin), [ruin])
  const rings = useMemo(() => findGimbalRings(ruin), [ruin])
  const beacon = useMemo(() => findBeaconHalos(ruin), [ruin])

  useFrame(() => {
    pulseOrb(orb, clock.elapsed, wakeShare(timeline, level))
    turnGimbal(rings, clock.elapsed)
  }, RUIN_LIFE_FRAME_PRIORITY)

  return (
    <RuinHalo
      ruin={ruin}
      halos={beacon}
      tuning={BEACON_HALO}
      glow={() => beaconGlow(clock.elapsed, wakeShare(timeline, level))}
    />
  )
}
