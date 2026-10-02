import { useMemo } from 'react'
import { SOCIAL_LINKS } from '@/data/socialLinks'
import { useDebugStore } from '@/store/debugStore'
import { openInNewTab } from '@/utils/links'
import InteractionMarker from '@/interaction/InteractionMarker'
import type { IslandBodyProps } from '../shared/types'
import { useIslandModel } from '../shared/islandModel'
import { placeIsland } from '../shared/islandTransform'
import { useNightGlow } from '../shared/nightGlow'
import IslandShadow from '../shared/IslandShadow'
import Coast from '@/world/shore/Coast'
import { useCoastFields } from '@/world/shore/useCoastFields'
import { BOAT_NODE, COZY_BLOB, COZY_MODEL_URL, FIRE_HEIGHT, FIRE_WIDTH } from './constants'
import { findCafeMarker } from './cafe'
import { findFire } from './campfire'
import { useBoatBob } from './useBoatBob'
import CampfireEmbers from './CampfireEmbers'
import CampfireFlames from './CampfireFlames'
import ChimneySmoke from './ChimneySmoke'

export default function CozyIsle({ islandKey, config }: IslandBodyProps) {
  const tuning = useDebugStore((s) => s.islands.cozy)
  const island = useIslandModel(COZY_MODEL_URL, tuning.brightness)

  const { boat, fire, cafeMarker } = useMemo(
    () => ({
      boat: island.model.getObjectByName(BOAT_NODE) ?? null,
      fire: findFire(island.model),
      cafeMarker: findCafeMarker(island.model),
    }),
    [island]
  )

  useBoatBob(boat)
  useNightGlow(island.glows)

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
            <CampfireFlames base={fire.base} height={FIRE_HEIGHT} islandScale={placement.scale} />
            <CampfireEmbers
              origin={fire.origin}
              width={FIRE_WIDTH}
              height={FIRE_HEIGHT}
              islandScale={placement.scale}
            />
          </>
        )}
        <ChimneySmoke islandScale={placement.scale} />
        {cafeMarker && (
          <InteractionMarker
            position={cafeMarker.position}
            label="Buy Me A Coffee"
            onActivate={() => openInNewTab(SOCIAL_LINKS.kofi)}
            baseGap={cafeMarker.baseGap}
          />
        )}
      </group>
    </>
  )
}
