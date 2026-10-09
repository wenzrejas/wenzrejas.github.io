import { useMemo } from 'react'
import { ISLAND_COPY } from '@/data/islandCopy'
import { useDebugStore } from '@/store/debugStore'
import { openPanel } from '@/store/panelStore'
import { setHovered } from '@/interaction/hover'
import InteractionMarker from '@/interaction/InteractionMarker'
import type { IslandBodyProps } from '../shared/types'
import { useIslandModel } from '../shared/islandModel'
import { createHoverTimeline } from '../shared/hoverTimeline'
import { placeIsland } from '../shared/islandTransform'
import { useNightGlow } from '../shared/nightGlow'
import IslandShadow from '../shared/IslandShadow'
import Coast from '@/world/shore/Coast'
import { useCoastFields } from '@/world/shore/useCoastFields'
import { BOAT_NODE, COZY_BLOB, COZY_MODEL_URL, TERRAIN_NODE } from './constants'
import { FIRE_HEIGHT, FIRE_WIDTH } from './campfire/constants'
import { findCafeMarker, findNoteSpot } from './cafe'
import { flareLevel } from './cafeBreak'
import { findBulbs, sortCafeGlows } from './cafeLights'
import { findFire } from './campfire/campfire'
import { useBoatBob } from './useBoatBob'
import { useCafeBreak } from './useCafeBreak'
import CampfireEmbers from './campfire/CampfireEmbers'
import CampfireFlare from './campfire/CampfireFlare'
import CampfireFlames from './campfire/CampfireFlames'
import ChimneySmoke from './chimney-smoke/ChimneySmoke'
import GoldenRipple from './golden-ripple/GoldenRipple'
import LightsOnWave from './lights-on-wave/LightsOnWave'
import MusicNotes from './music-notes/MusicNotes'

export default function CozyIsle({ islandKey, config }: IslandBodyProps) {
  const tuning = useDebugStore((s) => s.islands.cozy)
  const island = useIslandModel(COZY_MODEL_URL, tuning.brightness)

  const { boat, terrain, fire, cafeMarker, noteSpot, bulbs, cafeGlows } = useMemo(
    () => ({
      boat: island.model.getObjectByName(BOAT_NODE) ?? null,
      terrain: island.model.getObjectByName(TERRAIN_NODE) ?? null,
      fire: findFire(island.model),
      cafeMarker: findCafeMarker(island.model),
      noteSpot: findNoteSpot(island.model),
      bulbs: findBulbs(island.model),
      cafeGlows: sortCafeGlows(island.model, island.glows),
    }),
    [island]
  )
  const cafeBreak = useMemo(() => createHoverTimeline(), [])

  useBoatBob(boat)
  useNightGlow(cafeGlows.others)
  useCafeBreak(cafeBreak, cafeGlows)

  const placement = placeIsland(config.radius, tuning, island.footprint, island.center)
  const coast = useCoastFields(island.model, placement.scale, tuning.offsetY)

  return (
    <>
      <IslandShadow radius={config.radius} tuning={tuning} blob={COZY_BLOB} />
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
        {fire && (
          <>
            <CampfireFlames
              base={fire.base}
              height={FIRE_HEIGHT}
              islandScale={placement.scale}
              flare={() => flareLevel(cafeBreak)}
            />
            <CampfireEmbers
              origin={fire.origin}
              width={FIRE_WIDTH}
              height={FIRE_HEIGHT}
              islandScale={placement.scale}
              flare={() => flareLevel(cafeBreak)}
            />
            <CampfireFlare base={fire.base} islandScale={placement.scale} cafeBreak={cafeBreak} />
          </>
        )}
        <ChimneySmoke islandScale={placement.scale} />
        <LightsOnWave bulbs={bulbs} islandScale={placement.scale} cafeBreak={cafeBreak} />
        {noteSpot && (
          <MusicNotes spot={noteSpot} islandScale={placement.scale} cafeBreak={cafeBreak} />
        )}
        {terrain && (
          <GoldenRipple
            land={terrain}
            islandScale={placement.scale}
            offsetY={tuning.offsetY}
            cafeBreak={cafeBreak}
          />
        )}
        {cafeMarker && (
          <InteractionMarker
            position={cafeMarker.position}
            label={ISLAND_COPY.cozy.marker}
            onHover={(isHovered) => setHovered(cafeBreak, isHovered)}
            onActivate={(markerSpot) => openPanel('support', markerSpot)}
            baseGap={cafeMarker.baseGap}
          />
        )}
      </group>
    </>
  )
}
