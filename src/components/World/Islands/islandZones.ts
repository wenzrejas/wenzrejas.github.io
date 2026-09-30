import { useWhirlpoolStore } from '../../../store/whirlpoolStore'
import type { IslandKey } from './constants'
import { ISLAND_KEYS, ISLAND_SPECS } from './islandSpecs'
import { createIslandTransform, islandExtent, islandTransform } from './islandTransform'
import { WHIRLPOOL_WILDLIFE_SPREAD } from './TimewellDepth/constants'

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

export function whirlpoolGap(x: number, z: number): number {
  const whirlpool = useWhirlpoolStore.getState()
  if (!whirlpool.active) return Infinity
  return Math.hypot(x - whirlpool.x, z - whirlpool.z) - whirlpool.radius * WHIRLPOOL_WILDLIFE_SPREAD
}

export function headingFromWhirlpool(x: number, z: number): number {
  const whirlpool = useWhirlpoolStore.getState()
  return Math.atan2(x - whirlpool.x, z - whirlpool.z)
}

export const isOpenWater = (x: number, z: number, gap: number) =>
  ISLAND_ZONES.every((zone) => shoreGap(zone, x, z) > gap) && whirlpoolGap(x, z) > gap
