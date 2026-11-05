import { rand } from '@/utils/math'
import type { ParticlePool } from '@/world/effects/particlePool'
import { algaeAt, queueGlowHit } from '../algae/algaeField'
import { recordTrail } from '../algae/scatterTrail'
import {
  DROP_SIZE,
  FIN_WAKE_DRIFT,
  FIN_WAKE_DRIFT_JITTER,
  FIN_WAKE_LIFE_JITTER,
  FIN_WAKE_SIDE_GAP,
  FIN_WAKE_SIZE_JITTER,
  FOAM_LIFE,
  FOAM_SIZE,
  FOAM_Y,
  SPLASH_CARRY_SHARE,
  SPLASH_DROP_LIFE,
  SPLASH_DROP_RISE,
  SPLASH_DROP_SCATTER,
  SPLASH_DROP_SIZE_JITTER,
  SPLASH_DROP_SPREAD,
  SPLASH_DROP_Y,
  SPLASH_GLOW_FLASHES,
  SPLASH_GLOW_REACH,
  SPLASH_RING,
  SPLASH_RING_ANGLE_JITTER,
  SPLASH_RING_LIFE_JITTER,
  SPLASH_RING_RADIUS,
  SPLASH_RING_SIZE_JITTER,
  SPLASH_RING_SPEED,
  SPLASH_RING_SPEED_JITTER,
} from './constants'

export function emitFinWake(foam: ParticlePool, x: number, z: number, heading: number): void {
  const glow = algaeAt(x, z)
  const sideX = Math.cos(heading)
  const sideZ = -Math.sin(heading)
  for (const side of [-1, 1]) {
    const drift = FIN_WAKE_DRIFT * rand(...FIN_WAKE_DRIFT_JITTER) * side
    foam.spawn(
      x + sideX * side * FIN_WAKE_SIDE_GAP,
      FOAM_Y,
      z + sideZ * side * FIN_WAKE_SIDE_GAP,
      sideX * drift,
      0,
      sideZ * drift,
      FOAM_SIZE * rand(...FIN_WAKE_SIZE_JITTER),
      FOAM_LIFE * rand(...FIN_WAKE_LIFE_JITTER),
      glow
    )
  }
}

export function emitSplash(
  foam: ParticlePool,
  drops: ParticlePool,
  x: number,
  z: number,
  heading: number,
  speed: number,
  dropCount: number,
  strength: number
): void {
  const glow = algaeAt(x, z)
  const carryX = Math.sin(heading) * speed * SPLASH_CARRY_SHARE
  const carryZ = Math.cos(heading) * speed * SPLASH_CARRY_SHARE

  for (let i = 0; i < dropCount; i++) {
    const angle = Math.random() * Math.PI * 2
    const spread = rand(...SPLASH_DROP_SPREAD) * strength
    drops.spawn(
      x + rand(-SPLASH_DROP_SCATTER, SPLASH_DROP_SCATTER),
      SPLASH_DROP_Y,
      z + rand(-SPLASH_DROP_SCATTER, SPLASH_DROP_SCATTER),
      Math.cos(angle) * spread + carryX,
      rand(...SPLASH_DROP_RISE) * strength,
      Math.sin(angle) * spread + carryZ,
      DROP_SIZE * rand(...SPLASH_DROP_SIZE_JITTER),
      SPLASH_DROP_LIFE,
      glow
    )
  }

  for (let i = 0; i < SPLASH_RING; i++) {
    const angle =
      (i / SPLASH_RING) * Math.PI * 2 + rand(-SPLASH_RING_ANGLE_JITTER, SPLASH_RING_ANGLE_JITTER)
    const ringSpeed = SPLASH_RING_SPEED * rand(...SPLASH_RING_SPEED_JITTER) * strength
    foam.spawn(
      x + Math.cos(angle) * SPLASH_RING_RADIUS,
      FOAM_Y,
      z + Math.sin(angle) * SPLASH_RING_RADIUS,
      Math.cos(angle) * ringSpeed,
      0,
      Math.sin(angle) * ringSpeed,
      FOAM_SIZE * rand(...SPLASH_RING_SIZE_JITTER) * strength,
      FOAM_LIFE * rand(...SPLASH_RING_LIFE_JITTER),
      glow
    )
  }
}

export function flashGlowingWater(x: number, z: number, time: number): void {
  const glow = algaeAt(x, z)
  if (glow <= 0) return
  recordTrail(x, z, time)
  for (let i = 0; i < SPLASH_GLOW_FLASHES; i++) {
    if (Math.random() >= glow) continue
    const angle = Math.random() * Math.PI * 2
    const reach = rand(0, SPLASH_GLOW_REACH)
    queueGlowHit(x + Math.cos(angle) * reach, z + Math.sin(angle) * reach)
  }
}
