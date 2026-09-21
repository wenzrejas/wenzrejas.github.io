import * as THREE from 'three'
import { mix } from '../../../utils/math'
import { ISLAND_ZONES, shoreGap } from '../Islands/islandZones'
import {
  HABITAT_FAR,
  HABITAT_ISLANDS,
  HABITAT_NEAR,
  OPEN_WATER_CHANCE,
  SHORE_GAP,
} from './constants'

export function spawnChance(x: number, z: number): number {
  let habitat = 0
  for (const zone of ISLAND_ZONES) {
    const gap = shoreGap(zone, x, z)
    if (gap < SHORE_GAP) return 0
    if (HABITAT_ISLANDS.includes(zone.key)) {
      habitat = Math.max(habitat, 1 - THREE.MathUtils.smoothstep(gap, HABITAT_NEAR, HABITAT_FAR))
    }
  }
  return mix(OPEN_WATER_CHANCE, 1, habitat)
}
