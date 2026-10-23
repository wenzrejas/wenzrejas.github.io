import { useEffect, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { useDebugStore } from '@/store/debugStore'
import type { WallClock } from '@/utils/time'
import { useIslandModel } from '@/world/islands/shared/islandModel'
import RuinLife from '../ruin-life/RuinLife'
import SurfaceCaption from '../surface-caption/SurfaceCaption'
import type { Surfacing } from '../surfacing/surfacing'
import { DEEPEST_LEVEL, type Timeline } from '../timeline/timeline'
import TorchFire from '../torch-fire/TorchFire'
import { turnClockwork } from './clockwork'
import { RUIN_BRIGHTNESS, SUNKEN_RUINS_URL } from './constants'
import { floatRuins } from './ruinFloat'
import { disposeRuinMaterials, prepareRuins } from './sunkenRuinsModel'

interface SunkenRuinsProps {
  timeline: Timeline
  surfacing: Surfacing
  clock: WallClock
}

export default function SunkenRuins({ timeline, surfacing, clock }: SunkenRuinsProps) {
  const island = useIslandModel(SUNKEN_RUINS_URL, RUIN_BRIGHTNESS, false)
  const { movers, ruins } = useMemo(() => prepareRuins(island), [island])

  useEffect(() => () => disposeRuinMaterials(island), [island])

  useFrame(() => {
    const { ruins: placements } = useDebugStore.getState()
    turnClockwork(movers, clock.elapsed)
    floatRuins(ruins, placements, clock.elapsed)
  })

  return (
    <>
      <primitive object={island.model} />
      <TorchFire ruins={ruins} clock={clock} />
      <RuinLife ruins={ruins} timeline={timeline} surfacing={surfacing} clock={clock} />
      <SurfaceCaption clockRuin={ruins[DEEPEST_LEVEL]} />
    </>
  )
}
