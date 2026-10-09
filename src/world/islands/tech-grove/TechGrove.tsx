import { useLayoutEffect, useMemo } from 'react'
import { ISLAND_COPY } from '@/data/islandCopy'
import { useDebugStore } from '@/store/debugStore'
import { openPanel } from '@/store/panelStore'
import { setHovered } from '@/interaction/hover'
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
import { arrangeOrbs } from './logo-orbs/orbits'
import { createPedestalLabels, dressPedestalLabels, tintPedestalLabels } from './pedestalLabelModel'
import { useLabelGlow, useSanctuaryGlow } from './sanctuaryGlow'
import { findShrines } from './shrines'
import { useGemSpin } from './gems/useGemSpin'
import { useOrbitReveal } from './logo-orbs/useOrbitReveal'
import Fireflies from './fireflies/Fireflies'
import GemSparkles from './gems/GemSparkles'
import LightRings from './logo-orbs/LightRings'
import LogoOrbs from './logo-orbs/LogoOrbs'
import ShrineGlow from './shrine-glow/ShrineGlow'

export default function TechGrove({ islandKey, config }: IslandBodyProps) {
  const tuning = useDebugStore((s) => s.islands.tech)
  const island = useIslandModel(TECH_MODEL_URL, tuning.brightness)
  const shrines = useMemo(() => findShrines(island.model), [island])
  const { orbits, orbs } = useMemo(() => arrangeOrbs(shrines.statues), [shrines])
  const labels = useMemo(() => createPedestalLabels(shrines.statues), [shrines])

  useLayoutEffect(() => dressPedestalLabels(labels), [labels])
  useLayoutEffect(() => tintPedestalLabels(labels), [labels, tuning.brightness])
  useSanctuaryGlow(island.glows)
  useLabelGlow(labels)
  useGemSpin(shrines.gems)
  useOrbitReveal(orbits)

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
        <LightRings orbits={orbits} />
        <LogoOrbs orbits={orbits} orbs={orbs} />
        {orbits.map((orbit) => (
          <InteractionMarker
            key={orbit.statue.grove}
            position={orbit.statue.marker}
            label={ISLAND_COPY.tech.marker}
            onHover={(isHovered) => setHovered(orbit, isHovered)}
            onActivate={(markerSpot) => openPanel(orbit.statue.grove, markerSpot)}
            baseGap={orbit.statue.baseGap}
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
