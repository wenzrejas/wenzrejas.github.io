import { useMemo } from 'react'
import * as THREE from 'three'
import { useDebugStore } from '../../../../store/debugStore'
import { positionIn } from '../../../../utils/meshes'
import type { IslandBodyProps } from '../types'
import { useIslandModel } from '../islandModel'
import { placeIsland } from '../islandTransform'
import { useNightGlow } from '../nightGlow'
import IslandShadow from '../IslandShadow'
import Coast from '../../Shore/Coast'
import { useCoastFields } from '../../Shore/useCoastFields'
import {
  BOAT_NODE,
  COZY_BLOB,
  COZY_MODEL_URL,
  FIRE_ANCHOR_NODE,
  FIRE_HEIGHT,
  FIRE_WIDTH,
} from './constants'
import { useBoatBob } from './useBoatBob'
import CampfireEmbers from './CampfireEmbers'
import CampfireFlames from './CampfireFlames'
import ChimneySmoke from './ChimneySmoke'

interface FireSpot {
  origin: THREE.Vector3
  base: THREE.Vector3
}

function findFire(model: THREE.Object3D): FireSpot | null {
  const anchor = model.getObjectByName(FIRE_ANCHOR_NODE)
  if (!anchor) return null

  anchor.updateWorldMatrix(true, false)
  const base = positionIn(model, anchor)
  return { origin: new THREE.Vector3(base.x, base.y + FIRE_HEIGHT, base.z), base }
}

export default function CozyIsle({ islandKey, config }: IslandBodyProps) {
  const tuning = useDebugStore((s) => s.islands.cozy)
  const island = useIslandModel(COZY_MODEL_URL, tuning.brightness)

  const { boat, fire } = useMemo(
    () => ({
      boat: island.model.getObjectByName(BOAT_NODE) ?? null,
      fire: findFire(island.model),
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
      </group>
    </>
  )
}
