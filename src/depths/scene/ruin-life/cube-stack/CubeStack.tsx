import { useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { RUIN_LIFE_FRAME_PRIORITY } from '@/depths/scene/constants'
import type { MilestoneProps } from '../shared/milestone'
import RuinHalo from '../shared/RuinHalo'
import { wakeShare, wakeStrength } from '../shared/ruinWake'
import { CUBE_HALO } from './constants'
import { findCubeStack, glowCubes, lightRunes, sweepSeams } from './stackLight'

export default function CubeStack({ ruin, level, timeline, clock }: MilestoneProps) {
  const stack = useMemo(() => findCubeStack(ruin), [ruin])

  useFrame(() => {
    const wake = wakeShare(timeline, level)
    sweepSeams(stack, clock.elapsed, wake)
    lightRunes(stack, clock.elapsed, wake)
    glowCubes(stack, clock.elapsed, wake)
  }, RUIN_LIFE_FRAME_PRIORITY)

  return (
    <RuinHalo
      ruin={ruin}
      halos={stack.halos}
      tuning={CUBE_HALO}
      glow={() => wakeStrength(wakeShare(timeline, level))}
    />
  )
}
