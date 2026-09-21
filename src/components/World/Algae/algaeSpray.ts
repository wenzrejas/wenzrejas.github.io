import { rand } from '../../../utils/math'
import type { ParticlePool } from '../Effects/particlePool'
import { rainHits } from './algaeField'
import {
  HULL_HALF_BEAM,
  HULL_HALF_LENGTH,
  RAIN_FLASH_DROPS,
  RAIN_FLASH_LIFE,
  RAIN_FLASH_SIZE,
  SPARK_LIFE_MAX,
  SPARK_LIFE_MIN,
  SPARK_SIZE,
  SPARK_SPEED,
  SPARK_Y,
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
  const along = rand(-1.2, 1)
  const side = Math.sign(Math.random() - 0.5)
  const beam = HULL_HALF_BEAM * Math.sqrt(Math.max(0, 1 - along * along)) + rand(0, 1.5)
  const outward = rand(0.4, 1) * SPARK_SPEED
  sparks.spawn(
    hull.x + forwardX * along * HULL_HALF_LENGTH + forwardZ * side * beam,
    SPARK_Y,
    hull.z + forwardZ * along * HULL_HALF_LENGTH - forwardX * side * beam,
    forwardZ * side * outward - forwardX * rand(0, 1.5),
    0,
    -forwardX * side * outward - forwardZ * rand(0, 1.5),
    SPARK_SIZE * rand(0.6, 1.4),
    rand(SPARK_LIFE_MIN, SPARK_LIFE_MAX)
  )
}

export function emitBowSplash(splash: ParticlePool, hull: Hull): void {
  const forwardX = Math.sin(hull.heading)
  const forwardZ = Math.cos(hull.heading)
  const along = rand(0.1, 0.9)
  const side = Math.sign(Math.random() - 0.5)
  const beam = HULL_HALF_BEAM * Math.sqrt(1 - along * along) + 0.5
  const outward = rand(0.5, 1.2) * SPLASH_SPEED
  splash.spawn(
    hull.x + forwardX * along * HULL_HALF_LENGTH + forwardZ * side * beam,
    0.4,
    hull.z + forwardZ * along * HULL_HALF_LENGTH - forwardX * side * beam,
    forwardZ * side * outward + forwardX * hull.speed * 0.4,
    rand(0.6, 1.2) * SPLASH_LIFT,
    -forwardX * side * outward + forwardZ * hull.speed * 0.4,
    SPLASH_SIZE * rand(0.6, 1.3),
    3
  )
}

export function emitRainFlashes(sparks: ParticlePool, splash: ParticlePool): void {
  for (const hit of rainHits.splice(0)) {
    sparks.spawn(hit.x, SPARK_Y, hit.y, 0, 0, 0, RAIN_FLASH_SIZE * rand(0.7, 1.2), RAIN_FLASH_LIFE)
    for (let i = 0; i < RAIN_FLASH_DROPS; i++) {
      splash.spawn(
        hit.x,
        0.3,
        hit.y,
        rand(-1.5, 1.5),
        rand(3, 5),
        rand(-1.5, 1.5),
        SPLASH_SIZE * rand(0.5, 0.8),
        3
      )
    }
  }
}
