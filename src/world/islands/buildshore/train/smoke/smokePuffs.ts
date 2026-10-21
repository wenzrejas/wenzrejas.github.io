import type * as THREE from 'three'
import { rand } from '@/utils/math'
import type { ParticlePool } from '@/world/effects/particlePool'
import type { HoverTimeline } from '@/world/islands/shared/hoverTimeline'
import {
  SMOKE_CHUFF_TRAVEL,
  SMOKE_DRAG,
  SMOKE_IDLE_PUFF_SIZE,
  SMOKE_IDLE_SECONDS,
  SMOKE_IDLE_SPEED,
  SMOKE_LIFETIME,
  SMOKE_LIFETIME_VARIANCE,
  SMOKE_PUFF_SIZE,
  SMOKE_RISE_SPEED,
  SMOKE_RISE_VARIANCE,
  SMOKE_SIZE_VARIANCE,
  SMOKE_SPREAD_SPEED,
  WHISTLE_INTERVAL_SECONDS,
  WHISTLE_PUFF_SIZE,
  WHISTLE_PUFF_SPACING_SECONDS,
  WHISTLE_PUFFS,
  WHISTLE_RISE_SHARE,
} from './constants'

interface SmokeEmitter {
  nextChuffTravel: number
  idleSeconds: number
  nextWhistleSeconds: number
  whistlePuffs: number
  whistleWait: number
}

export interface SmokeBuffers {
  positions: Float32Array
  lives: Float32Array
  sizes: Float32Array
}

export const createSmokeEmitter = (): SmokeEmitter => ({
  nextChuffTravel: 0,
  idleSeconds: 0,
  nextWhistleSeconds: 0,
  whistlePuffs: 0,
  whistleWait: 0,
})

function emitPuff(pool: ParticlePool, source: THREE.Vector3, size: number, riseShare = 1): void {
  const angle = Math.random() * Math.PI * 2
  pool.spawn(
    source.x,
    source.y,
    source.z,
    Math.cos(angle) * SMOKE_SPREAD_SPEED,
    SMOKE_RISE_SPEED * riseShare * rand(1 - SMOKE_RISE_VARIANCE, 1 + SMOKE_RISE_VARIANCE),
    Math.sin(angle) * SMOKE_SPREAD_SPEED,
    size * rand(1 - SMOKE_SIZE_VARIANCE, 1 + SMOKE_SIZE_VARIANCE),
    SMOKE_LIFETIME * rand(1 - SMOKE_LIFETIME_VARIANCE, 1 + SMOKE_LIFETIME_VARIANCE)
  )
}

export function emitSmoke(
  pool: ParticlePool,
  emitter: SmokeEmitter,
  source: THREE.Vector3,
  travel: number,
  speed: number,
  dt: number
): void {
  while (travel >= emitter.nextChuffTravel) {
    emitter.nextChuffTravel += SMOKE_CHUFF_TRAVEL
    emitPuff(pool, source, SMOKE_PUFF_SIZE)
  }
  if (speed >= SMOKE_IDLE_SPEED) return

  emitter.idleSeconds -= dt
  if (emitter.idleSeconds > 0) return
  emitter.idleSeconds = SMOKE_IDLE_SECONDS
  emitPuff(pool, source, SMOKE_IDLE_PUFF_SIZE)
}

export function emitWhistle(
  pool: ParticlePool,
  emitter: SmokeEmitter,
  source: THREE.Vector3,
  hover: HoverTimeline,
  dt: number
): void {
  if (hover.presence < 1) emitter.nextWhistleSeconds = 0
  else if (hover.engagedSeconds >= emitter.nextWhistleSeconds) {
    emitter.whistlePuffs = WHISTLE_PUFFS
    emitter.nextWhistleSeconds += WHISTLE_INTERVAL_SECONDS
  }

  emitter.whistleWait = Math.max(0, emitter.whistleWait - dt)
  while (emitter.whistlePuffs > 0 && emitter.whistleWait === 0) {
    emitPuff(pool, source, WHISTLE_PUFF_SIZE, WHISTLE_RISE_SHARE)
    emitter.whistlePuffs--
    emitter.whistleWait = WHISTLE_PUFF_SPACING_SECONDS
  }
}

export function advanceSmoke(pool: ParticlePool, buffers: SmokeBuffers, dt: number): void {
  const damping = Math.exp(-SMOKE_DRAG * dt)
  pool.particles.forEach((puff, slot) => {
    if (puff.age >= puff.life) {
      buffers.lives[slot] = 1
      return
    }

    puff.age += dt
    puff.vx *= damping
    puff.vy *= damping
    puff.vz *= damping
    puff.x += puff.vx * dt
    puff.y += puff.vy * dt
    puff.z += puff.vz * dt
    buffers.positions[slot * 3] = puff.x
    buffers.positions[slot * 3 + 1] = puff.y
    buffers.positions[slot * 3 + 2] = puff.z
    buffers.lives[slot] = Math.min(puff.age / puff.life, 1)
    buffers.sizes[slot] = puff.size
  })
}
