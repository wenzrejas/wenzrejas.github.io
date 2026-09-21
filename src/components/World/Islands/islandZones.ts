import type { IslandKey } from './constants'
import { ISLAND_KEYS, ISLAND_SPECS } from './islandSpecs'
import { createIslandTransform, islandExtent, islandTransform } from './islandTransform'

export interface IslandZone {
  key: IslandKey
  x: number
  z: number
  extent: number
}

export const ISLAND_ZONES: IslandZone[] = ISLAND_KEYS.map((key) => {
  const tuning = ISLAND_SPECS[key].tuning
  const { x, z } = islandTransform(key, tuning, createIslandTransform())
  return { key, x, z, extent: islandExtent(key, tuning) }
})

export const shoreGap = (zone: IslandZone, x: number, z: number) =>
  Math.hypot(x - zone.x, z - zone.z) - zone.extent

export const isOpenWater = (x: number, z: number, gap: number) =>
  ISLAND_ZONES.every((zone) => shoreGap(zone, x, z) > gap)
