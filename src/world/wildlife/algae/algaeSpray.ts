import { rand } from '@/utils/math'
import type { ParticlePool } from '@/world/effects/particlePool'
import { glowHits } from './algaeField'
import {
  BOW_SPLASH_ALONG,
  BOW_SPLASH_BEAM_GAP,
  BOW_SPLASH_CARRY_SHARE,
  BOW_SPLASH_LIFT_JITTER,
  BOW_SPLASH_OUTWARD_JITTER,
  BOW_SPLASH_SIZE_JITTER,
  BOW_SPLASH_Y,
  GLOW_FLASH_DROP_RISE,
  GLOW_FLASH_DROP_SIZE_JITTER,
  GLOW_FLASH_DROP_SPREAD,
  GLOW_FLASH_DROP_Y,
  GLOW_FLASH_DROPS,
  GLOW_FLASH_LIFE,
  GLOW_FLASH_SIZE,
  GLOW_FLASH_SIZE_JITTER,
  HULL_HALF_BEAM,
  HULL_HALF_LENGTH,
  HULL_SPARK_ALONG,
  HULL_SPARK_BACKDRIFT,
  HULL_SPARK_BEAM_GAP,
  HULL_SPARK_OUTWARD_JITTER,
  HULL_SPARK_SIZE_JITTER,
  SPARK_LIFE_MAX,
  SPARK_LIFE_MIN,
  SPARK_SIZE,
  SPARK_SPEED,
  SPARK_Y,
  SPLASH_DROP_LIFE,
  SPLASH_LIFT,
  SPLASH_SIZE,
  SPLASH_SPEED,
} from './constants'

interface Hull {
  x: number
  z: number
  speed: number
  heading: number
}

export function emitHullSpark(sparks: ParticlePool, hull: Hull): void {
  const forwardX = Math.sin(hull.heading)
  const forwardZ = Math.cos(hull.heading)
  const along = rand(...HULL_SPARK_ALONG)
  const side = Math.sign(Math.random() - 0.5)
  const beam =
    HULL_HALF_BEAM * Math.sqrt(Math.max(0, 1 - along * along)) + rand(0, HULL_SPARK_BEAM_GAP)
  const outward = rand(...HULL_SPARK_OUTWARD_JITTER) * SPARK_SPEED
  sparks.spawn(
    hull.x + forwardX * along * HULL_HALF_LENGTH + forwardZ * side * beam,
    SPARK_Y,
    hull.z + forwardZ * along * HULL_HALF_LENGTH - forwardX * side * beam,
    forwardZ * side * outward - forwardX * rand(0, HULL_SPARK_BACKDRIFT),
    0,
    -forwardX * side * outward - forwardZ * rand(0, HULL_SPARK_BACKDRIFT),
    SPARK_SIZE * rand(...HULL_SPARK_SIZE_JITTER),
    rand(SPARK_LIFE_MIN, SPARK_LIFE_MAX)
  )
}

export function emitBowSplash(splash: ParticlePool, hull: Hull): void {
  const forwardX = Math.sin(hull.heading)
  const forwardZ = Math.cos(hull.heading)
  const along = rand(...BOW_SPLASH_ALONG)
  const side = Math.sign(Math.random() - 0.5)
  const beam = HULL_HALF_BEAM * Math.sqrt(1 - along * along) + BOW_SPLASH_BEAM_GAP
  const outward = rand(...BOW_SPLASH_OUTWARD_JITTER) * SPLASH_SPEED
  splash.spawn(
    hull.x + forwardX * along * HULL_HALF_LENGTH + forwardZ * side * beam,
    BOW_SPLASH_Y,
    hull.z + forwardZ * along * HULL_HALF_LENGTH - forwardX * side * beam,
    forwardZ * side * outward + forwardX * hull.speed * BOW_SPLASH_CARRY_SHARE,
    rand(...BOW_SPLASH_LIFT_JITTER) * SPLASH_LIFT,
    -forwardX * side * outward + forwardZ * hull.speed * BOW_SPLASH_CARRY_SHARE,
    SPLASH_SIZE * rand(...BOW_SPLASH_SIZE_JITTER),
    SPLASH_DROP_LIFE
  )
}

export function emitGlowFlashes(sparks: ParticlePool, splash: ParticlePool): void {
  for (const hit of glowHits.splice(0)) {
    sparks.spawn(
      hit.x,
      SPARK_Y,
      hit.y,
      0,
      0,
      0,
      GLOW_FLASH_SIZE * rand(...GLOW_FLASH_SIZE_JITTER),
      GLOW_FLASH_LIFE
    )
    for (let i = 0; i < GLOW_FLASH_DROPS; i++) {
      splash.spawn(
        hit.x,
        GLOW_FLASH_DROP_Y,
        hit.y,
        rand(-GLOW_FLASH_DROP_SPREAD, GLOW_FLASH_DROP_SPREAD),
        rand(...GLOW_FLASH_DROP_RISE),
        rand(-GLOW_FLASH_DROP_SPREAD, GLOW_FLASH_DROP_SPREAD),
        SPLASH_SIZE * rand(...GLOW_FLASH_DROP_SIZE_JITTER),
        SPLASH_DROP_LIFE
      )
    }
  }
}
