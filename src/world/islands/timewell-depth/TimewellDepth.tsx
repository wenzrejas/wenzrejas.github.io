import { useDebugStore } from '@/store/debugStore'
import type { IslandBodyProps } from '../shared/types'
import IslandFrame from '../shared/IslandFrame'
import { useIslandModel } from '../shared/islandModel'
import { placeIsland } from '../shared/islandTransform'
import { useLightingBake } from '../shared/lighting-bake/useLightingBake'
import { useCoastFields } from '@/world/shore/useCoastFields'
import { TIMEWELL_MODEL_URL, TIMEWELL_OVERHEAD_SHADOW_STRENGTH } from './constants'
import { runeSpillLevel, useRuneGlow } from './runeGlow'
import Whirlpool from './Whirlpool'
import WhirlpoolSpray from './WhirlpoolSpray'

export default function TimewellDepth({ islandKey, config }: IslandBodyProps) {
  const tuning = useDebugStore((state) => state.islands.timewell)
  const island = useIslandModel(TIMEWELL_MODEL_URL, tuning.brightness)
  useLightingBake(island, {
    overheadShadowStrength: TIMEWELL_OVERHEAD_SHADOW_STRENGTH,
    lampLevel: runeSpillLevel,
  })
  useRuneGlow(island)

  const placement = placeIsland(config.radius, tuning, island.footprint, island.center)
  const coast = useCoastFields(island.model, placement.scale, tuning.offsetY)

  return (
    <>
      <IslandFrame
        islandKey={islandKey}
        radius={config.radius}
        tuning={tuning}
        island={island}
        placement={placement}
        coast={coast}
      >
        {coast && (
          <Whirlpool
            shoreline={coast.shoreline}
            center={island.center}
            islandScale={placement.scale}
            offsetY={tuning.offsetY}
          />
        )}
      </IslandFrame>
      {coast && (
        <WhirlpoolSpray shoreline={coast.shoreline} center={island.center} placement={placement} />
      )}
    </>
  )
}
