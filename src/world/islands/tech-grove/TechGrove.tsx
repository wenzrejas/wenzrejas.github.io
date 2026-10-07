import { useMemo } from 'react'
import { ISLAND_COPY } from '@/data/islandCopy'
import { useDebugStore } from '@/store/debugStore'
import { openPanel } from '@/store/panelStore'
import InteractionMarker from '@/interaction/InteractionMarker'
import type { IslandBodyProps } from '../shared/types'
import { useIslandModel } from '../shared/islandModel'
import { placeIsland } from '../shared/islandTransform'
import IslandShadow from '../shared/IslandShadow'
import Coast from '@/world/shore/Coast'
import { useCoastFields } from '@/world/shore/useCoastFields'
import RockSurf from '../shared/rock-surf/RockSurf'
import { TECH_BLOB, TECH_MODEL_URL, TECH_SURF, TERRAIN_NODES } from './constants'
import { TECH_ISLETS } from './shoreProfile'
import { useSanctuaryGlow } from './sanctuaryGlow'
import { findShrines } from './shrines'
import { useGemSpin } from './useGemSpin'
import Fireflies from './Fireflies'
import GemSparkles from './GemSparkles'
import ShrineGlow from './ShrineGlow'

export default function TechGrove({ islandKey, config }: IslandBodyProps) {
  const tuning = useDebugStore((s) => s.islands.tech)
  const island = useIslandModel(TECH_MODEL_URL, tuning.brightness)
  const shrines = useMemo(() => findShrines(island.model), [island])

  useSanctuaryGlow(island.glows)
  useGemSpin(shrines.gems)

  const placement = placeIsland(config.radius, tuning, island.footprint, island.center)
  const coast = useCoastFields(island.model, placement.scale, tuning.offsetY)

  return (
    <>
      <IslandShadow radius={config.radius} tuning={tuning} blob={TECH_BLOB} />
      <group {...placement}>
        <primitive object={island.model} />
        {coast && (
          <Coast
            islandKey={islandKey}
            fields={coast}
            islandScale={placement.scale}
            offsetY={tuning.offsetY}
          />
        )}
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
        {shrines.markers.map((marker) => (
          <InteractionMarker
            key={marker.grove}
            position={marker.position}
            label={ISLAND_COPY.tech.marker}
            onActivate={(markerSpot) => openPanel(marker.grove, markerSpot)}
            baseGap={marker.baseGap}
          />
        ))}
      </group>
      {coast && (
        <RockSurf
          model={island.model}
          terrainNodes={TERRAIN_NODES}
          shoreline={coast.shoreline}
          placement={placement}
          offsetY={tuning.offsetY}
          config={config}
          tuning={TECH_SURF}
        />
      )}
    </>
  )
}
