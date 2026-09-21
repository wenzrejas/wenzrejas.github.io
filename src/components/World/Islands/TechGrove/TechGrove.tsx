import { useDebugStore } from '../../../../store/debugStore'
import type { IslandBodyProps } from '../types'
import { useIslandModel } from '../islandModel'
import { placeIsland } from '../islandTransform'
import { useNightGlow } from '../nightGlow'
import IslandShadow from '../IslandShadow'
import { BODY_NODE, TECH_BLOB, TECH_MODEL_URL } from './constants'
import { TECH_ISLETS } from './shoreProfile'
import Fireflies from './Fireflies'

export default function TechGrove({ config, hovered }: IslandBodyProps) {
  const tuning = useDebugStore((s) => s.islands.tech)
  const island = useIslandModel(TECH_MODEL_URL, BODY_NODE, tuning.brightness)

  useNightGlow(island.glows)

  const placement = placeIsland(config.radius, tuning, island.footprint, island.center)

  return (
    <>
      <IslandShadow radius={config.radius} tuning={tuning} blob={TECH_BLOB} />
      <group {...placement}>
        {hovered && island.outline && <primitive object={island.outline} />}
        <primitive object={island.model} />
        <Fireflies
          islets={TECH_ISLETS}
          center={island.center}
          islandScale={placement.scale}
          offsetY={tuning.offsetY}
        />
      </group>
    </>
  )
}
