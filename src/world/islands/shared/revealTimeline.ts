import * as THREE from 'three'
import type { IslandControls } from '@/app/debug/types'
import {
  REVEAL_FALL,
  REVEAL_HOLD,
  REVEAL_LEAD,
  REVEAL_RISE,
  WORLD_LOCATIONS,
  type IslandConfig,
  type IslandKey,
} from './constants'
import { islandExtent } from './islandTransform'
import { groundReach } from './viewReach'

interface RevealTrigger {
  key: IslandKey
  x: number
  z: number
}

export const REVEAL_TOTAL = REVEAL_RISE + REVEAL_HOLD + REVEAL_FALL

const REVEAL_TRIGGERS: RevealTrigger[] = (
  Object.entries(WORLD_LOCATIONS) as [IslandKey, IslandConfig][]
).map(([key, config]) => ({ key, x: config.position[0], z: config.position[2] }))

export function revealBlend(elapsed: number): number {
  if (elapsed < REVEAL_RISE) return THREE.MathUtils.smoothstep(elapsed, 0, REVEAL_RISE)
  const falling = elapsed - REVEAL_RISE - REVEAL_HOLD
  if (falling <= 0) return 1
  return 1 - THREE.MathUtils.smoothstep(falling, 0, REVEAL_FALL)
}

export function enterReachedIsland(
  seen: Set<IslandKey>,
  shipX: number,
  shipZ: number,
  tuning: Record<IslandKey, IslandControls>,
  isPrimed: boolean
): RevealTrigger | null {
  for (const trigger of REVEAL_TRIGGERS) {
    if (seen.has(trigger.key)) continue
    const dx = shipX - trigger.x
    const dz = shipZ - trigger.z
    const range = groundReach(dx, dz) + islandExtent(trigger.key, tuning[trigger.key]) + REVEAL_LEAD
    if (dx * dx + dz * dz >= range * range) continue

    seen.add(trigger.key)
    if (isPrimed) return trigger
  }
  return null
}
