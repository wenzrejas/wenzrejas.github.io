import { useMemo } from 'react'
import * as THREE from 'three'
import { useDebugStore } from '../../../../store/debugStore'
import type { IslandBodyProps } from '../types'
import { useIslandModel } from '../islandModel'
import { placeIsland } from '../islandTransform'
import { useNightGlow } from '../nightGlow'
import IslandShadow from '../IslandShadow'
import { BOAT_NODE, BODY_NODE, COZY_BLOB, COZY_MODEL_URL, FIRE_NODES } from './constants'
import { useBoatBob } from './useBoatBob'
import { isFireMaterial, useFireGlow } from './fireGlow'
import CampfireEmbers from './CampfireEmbers'
import CampfireFlames from './CampfireFlames'

interface FireSpot {
  origin: THREE.Vector3
  base: THREE.Vector3
  width: number
  height: number
}

function findFire(model: THREE.Object3D): FireSpot | null {
  const box = new THREE.Box3()
  for (const name of FIRE_NODES) {
    const node = model.getObjectByName(name)
    if (node) box.expandByObject(node)
  }
  if (box.isEmpty()) return null

  const size = box.getSize(new THREE.Vector3())
  const center = box.getCenter(new THREE.Vector3())
  return {
    origin: new THREE.Vector3(center.x, box.max.y, center.z),
    base: new THREE.Vector3(center.x, box.min.y, center.z),
    width: Math.max(size.x, size.z),
    height: size.y,
  }
}

export default function CozyIsle({ config, hovered }: IslandBodyProps) {
  const tuning = useDebugStore((s) => s.islands.cozy)
  const island = useIslandModel(COZY_MODEL_URL, BODY_NODE, tuning.brightness)

  const { boat, fire, lamps, flames } = useMemo(
    () => ({
      boat: island.model.getObjectByName(BOAT_NODE) ?? null,
      fire: findFire(island.model),
      lamps: island.glows.filter((glow) => !isFireMaterial(glow.mat.name)),
      flames: island.glows.filter((glow) => isFireMaterial(glow.mat.name)),
    }),
    [island]
  )

  useBoatBob(boat)
  useNightGlow(lamps)
  useFireGlow(flames)

  const placement = placeIsland(config.radius, tuning, island.footprint, island.center)

  return (
    <>
      <IslandShadow radius={config.radius} tuning={tuning} blob={COZY_BLOB} />
      <group {...placement}>
        {hovered && island.outline && <primitive object={island.outline} />}
        <primitive object={island.model} />
        {fire && (
          <>
            <CampfireFlames base={fire.base} height={fire.height} islandScale={placement.scale} />
            <CampfireEmbers
              origin={fire.origin}
              width={fire.width}
              height={fire.height}
              islandScale={placement.scale}
            />
          </>
        )}
      </group>
    </>
  )
}
