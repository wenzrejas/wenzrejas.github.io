import { rand } from '@/utils/math'
import type { ParticlePool } from '@/world/effects/particlePool'
import {
  FOAM_Y,
  SPLASH_COLUMN_DROPS,
  SPLASH_COLUMN_REACH_SHARE,
  SPLASH_COLUMN_RISE_MAX,
  SPLASH_COLUMN_RISE_MIN,
  SPLASH_CROWN_DROPS,
  SPLASH_CROWN_INNER_SHARE,
  SPLASH_CROWN_RISE_MAX,
  SPLASH_CROWN_RISE_MIN,
  SPLASH_DROP_LIFE,
  SPLASH_DROP_SIZE_MAX,
  SPLASH_DROP_SIZE_MIN,
  SPLASH_DROP_Y,
  SPLASH_FOAM,
  SPLASH_FOAM_LIFE,
  SPLASH_FOAM_SIZE_MAX,
  SPLASH_FOAM_SIZE_MIN,
  SPLASH_FOAM_SPEED,
  SPLASH_OUTWARD_MAX,
  SPLASH_OUTWARD_MIN,
  SPLASH_RADIUS,
  WAKE_DRIFT,
  WAKE_LIFE,
  WAKE_SIDE_GAP,
  WAKE_SIZE,
  WAKE_SPACING,
} from './constants'
import { blowholeOf, wakeStrength, type Whale } from './whaleMotion'

function throwDrop(
  drops: ParticlePool,
  x: number,
  z: number,
  reach: number,
  outward: number,
  rise: number
): void {
  const angle = Math.random() * Math.PI * 2
  drops.spawn(
    x + Math.cos(angle) * reach,
    SPLASH_DROP_Y,
    z + Math.sin(angle) * reach,
    Math.cos(angle) * outward,
    rise,
    Math.sin(angle) * outward,
    rand(SPLASH_DROP_SIZE_MIN, SPLASH_DROP_SIZE_MAX),
    SPLASH_DROP_LIFE
  )
}

export function emitSplash(
  foam: ParticlePool,
  drops: ParticlePool,
  x: number,
  z: number,
  strength: number
): void {
  for (let i = 0; i < SPLASH_CROWN_DROPS; i++) {
    throwDrop(
      drops,
      x,
      z,
      SPLASH_RADIUS * rand(SPLASH_CROWN_INNER_SHARE, 1),
      rand(SPLASH_OUTWARD_MIN, SPLASH_OUTWARD_MAX) * strength,
      rand(SPLASH_CROWN_RISE_MIN, SPLASH_CROWN_RISE_MAX) * strength
    )
  }
  for (let i = 0; i < SPLASH_COLUMN_DROPS; i++) {
    throwDrop(
      drops,
      x,
      z,
      SPLASH_RADIUS * rand(0, SPLASH_COLUMN_REACH_SHARE),
      rand(0, SPLASH_OUTWARD_MIN),
      rand(SPLASH_COLUMN_RISE_MIN, SPLASH_COLUMN_RISE_MAX) * strength
    )
  }

  for (let i = 0; i < SPLASH_FOAM; i++) {
    const angle = (i / SPLASH_FOAM) * Math.PI * 2 + rand(-0.1, 0.1)
    const speed = SPLASH_FOAM_SPEED * rand(0.6, 1.2) * strength
    foam.spawn(
      x + Math.cos(angle) * SPLASH_RADIUS,
      FOAM_Y,
      z + Math.sin(angle) * SPLASH_RADIUS,
      Math.cos(angle) * speed,
      0,
      Math.sin(angle) * speed,
      rand(SPLASH_FOAM_SIZE_MIN, SPLASH_FOAM_SIZE_MAX),
      SPLASH_FOAM_LIFE * rand(0.8, 1.2)
    )
  }
}

export function trailWake(foam: ParticlePool, whale: Whale): void {
  const { x, z } = blowholeOf(whale)
  const strength = wakeStrength(whale)
  const isDue = Math.hypot(x - whale.wakeX, z - whale.wakeZ) >= WAKE_SPACING
  if (strength > 0 && !isDue) return

  whale.wakeX = x
  whale.wakeZ = z
  if (strength === 0) return

  const sideX = Math.cos(whale.heading)
  const sideZ = -Math.sin(whale.heading)
  for (const side of [-1, 1]) {
    const gap = WAKE_SIDE_GAP * rand(0.4, 1.6) * side
    const drift = WAKE_DRIFT * rand(0.6, 1.2) * side
    foam.spawn(
      x + sideX * gap,
      FOAM_Y,
      z + sideZ * gap,
      sideX * drift,
      0,
      sideZ * drift,
      WAKE_SIZE * strength * rand(0.5, 1.2),
      WAKE_LIFE * rand(0.8, 1.2)
    )
  }
}
