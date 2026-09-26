import { useMemo } from 'react'
import { useDebugStore } from '../../../../store/debugStore'
import type { IslandBodyProps } from '../types'
import { useIslandModel } from '../islandModel'
import { placeIsland } from '../islandTransform'
import IslandShadow from '../IslandShadow'
import Coast from '../../Shore/Coast'
import { BODY_NODE, TECH_BLOB, TECH_MODEL_URL } from './constants'
import { TECH_ISLETS } from './shoreProfile'
import { useSanctuaryGlow } from './sanctuaryGlow'
import { findShrines } from './shrines'
import { useGemSpin } from './useGemSpin'
import Fireflies from './Fireflies'
import GemSparkles from './GemSparkles'
import ShrineGlow from './ShrineGlow'

export default function TechGrove({ islandKey, config, hovered }: IslandBodyProps) {
  const tuning = useDebugStore((s) => s.islands.tech)
  const island = useIslandModel(TECH_MODEL_URL, BODY_NODE, tuning.brightness)
  const shrines = useMemo(() => findShrines(island.model), [island])

  useSanctuaryGlow(island.glows)
  useGemSpin(shrines.gems)

  const placement = placeIsland(config.radius, tuning, island.footprint, island.center)

  return (
    <>
      <IslandShadow radius={config.radius} tuning={tuning} blob={TECH_BLOB} />
      <group {...placement}>
        {hovered && island.outline && <primitive object={island.outline} />}
        <primitive object={island.model} />
        <Coast
          islandKey={islandKey}
          model={island.model}
          islandScale={placement.scale}
          offsetY={tuning.offsetY}
        />
        <Fireflies
          islets={TECH_ISLETS}
          center={island.center}
          islandScale={placement.scale}
          offsetY={tuning.offsetY}
        />
        <ShrineGlow shrines={shrines} islandScale={placement.scale} />
        {shrines.gems.map((gem) => (
          <GemSparkles key={gem.node.name} gem={gem} />
        ))}
      </group>
    </>
  )
}
