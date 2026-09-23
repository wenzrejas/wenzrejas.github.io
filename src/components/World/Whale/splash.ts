import { rand } from '../../../utils/math'
import type { ParticlePool } from '../Effects/particlePool'
import {
  DROP_SIZE,
  FOAM_LIFE,
  FOAM_SIZE,
  FOAM_Y,
  SPLASH_POINTS,
  SPLASH_RING,
  SPLASH_RING_SPEED,
  SPLASH_SPREAD,
  WHALE_LENGTH,
} from './constants'

export function emitBreachSplash(
  foam: ParticlePool,
  drops: ParticlePool,
  x: number,
  z: number,
  heading: number,
  speed: number,
  dropCount: number,
  strength: number
): void {
  const alongX = Math.sin(heading)
  const alongZ = Math.cos(heading)
  const carryX = alongX * speed * 0.3
  const carryZ = alongZ * speed * 0.3

  for (let point = 0; point < SPLASH_POINTS; point++) {
    const offset = (point / (SPLASH_POINTS - 1) - 0.5) * 2 * SPLASH_SPREAD * WHALE_LENGTH
    const originX = x + alongX * offset
    const originZ = z + alongZ * offset

    for (let i = 0; i < dropCount; i++) {
      const angle = Math.random() * Math.PI * 2
      const spread = rand(2, 9) * strength
      drops.spawn(
        originX + rand(-2, 2),
        0.3,
        originZ + rand(-2, 2),
        Math.cos(angle) * spread + carryX,
        rand(10, 19) * strength,
        Math.sin(angle) * spread + carryZ,
        DROP_SIZE * rand(0.6, 1.4),
        3
      )
    }

    for (let i = 0; i < SPLASH_RING; i++) {
      const angle = (i / SPLASH_RING) * Math.PI * 2 + rand(-0.25, 0.25)
      const ringSpeed = SPLASH_RING_SPEED * rand(0.7, 1.2) * strength
      foam.spawn(
        originX + Math.cos(angle) * 2.5,
        FOAM_Y,
        originZ + Math.sin(angle) * 2.5,
        Math.cos(angle) * ringSpeed,
        0,
        Math.sin(angle) * ringSpeed,
        FOAM_SIZE * rand(1, 1.6) * strength,
        FOAM_LIFE * rand(0.9, 1.3)
      )
    }
  }
}
