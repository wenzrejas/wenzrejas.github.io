import { rand } from '../../../utils/math'
import type { ParticlePool } from '../Effects/particlePool'
import {
  DROP_SIZE,
  FIN_WAKE_DRIFT,
  FOAM_LIFE,
  FOAM_SIZE,
  FOAM_Y,
  SPLASH_RING,
  SPLASH_RING_SPEED,
} from './constants'

export function emitFinWake(foam: ParticlePool, x: number, z: number, heading: number): void {
  const sideX = Math.cos(heading)
  const sideZ = -Math.sin(heading)
  for (const side of [-1, 1]) {
    const drift = FIN_WAKE_DRIFT * rand(0.6, 1.2) * side
    foam.spawn(
      x + sideX * side * 0.4,
      FOAM_Y,
      z + sideZ * side * 0.4,
      sideX * drift,
      0,
      sideZ * drift,
      FOAM_SIZE * rand(0.7, 1.1),
      FOAM_LIFE * rand(0.8, 1.2)
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
  const carryX = Math.sin(heading) * speed * 0.25
  const carryZ = Math.cos(heading) * speed * 0.25

  for (let i = 0; i < dropCount; i++) {
    const angle = Math.random() * Math.PI * 2
    const spread = rand(2, 7) * strength
    drops.spawn(
      x + rand(-0.8, 0.8),
      0.3,
      z + rand(-0.8, 0.8),
      Math.cos(angle) * spread + carryX,
      rand(8, 15) * strength,
      Math.sin(angle) * spread + carryZ,
      DROP_SIZE * rand(0.6, 1.3),
      3
    )
  }

  for (let i = 0; i < SPLASH_RING; i++) {
    const angle = (i / SPLASH_RING) * Math.PI * 2 + rand(-0.2, 0.2)
    const ringSpeed = SPLASH_RING_SPEED * rand(0.7, 1.2) * strength
    foam.spawn(
      x + Math.cos(angle) * 1.2,
      FOAM_Y,
      z + Math.sin(angle) * 1.2,
      Math.cos(angle) * ringSpeed,
      0,
      Math.sin(angle) * ringSpeed,
      FOAM_SIZE * rand(1, 1.6) * strength,
      FOAM_LIFE * rand(0.9, 1.3)
    )
  }
}
