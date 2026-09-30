import { useDebugStore } from '../../../../store/debugStore'
import type { IslandBodyProps } from '../types'
import { useIslandModel } from '../islandModel'
import { placeIsland } from '../islandTransform'
import Coast from '../../Shore/Coast'
import { useCoastFields } from '../../Shore/useCoastFields'
import { BODY_NODE, TIMEWELL_MODEL_URL } from './constants'
import { useRuneGlow } from './runeGlow'
import Whirlpool from './Whirlpool'
import WhirlpoolSpray from './WhirlpoolSpray'

export default function TimewellDepth({ islandKey, config, hovered }: IslandBodyProps) {
  const tuning = useDebugStore((s) => s.islands.timewell)
  const island = useIslandModel(TIMEWELL_MODEL_URL, BODY_NODE, tuning.brightness)
  useRuneGlow(island)

  const placement = placeIsland(config.radius, tuning, island.footprint, island.center)
  const coast = useCoastFields(island.model, placement.scale, tuning.offsetY)

  return (
    <>
      <group {...placement}>
        {hovered && island.outline && <primitive object={island.outline} />}
        <primitive object={island.model} />
        {coast && (
          <>
            <Coast
              islandKey={islandKey}
              fields={coast}
              islandScale={placement.scale}
              offsetY={tuning.offsetY}
            />
            <Whirlpool
              shoreline={coast.shoreline}
              center={island.center}
              islandScale={placement.scale}
              offsetY={tuning.offsetY}
            />
          </>
        )}
      </group>
      {coast && (
        <WhirlpoolSpray shoreline={coast.shoreline} center={island.center} placement={placement} />
      )}
    </>
  )
}
