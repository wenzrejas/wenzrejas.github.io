import { rand } from '@/utils/math'
import type { ParticlePool } from '@/world/effects/particlePool'
import { acrossGateX, acrossGateZ, GATE_SIDES, type Gate } from './checkpointRun'
import {
  ARCH_LIFT,
  GATE_HALF_WIDTH,
  RING_END_REACH,
  RING_SPARK_BURST_JITTER,
  RING_SPARK_LIFE_MAX,
  RING_SPARK_LIFE_MIN,
  RING_SPARK_SIZE_MAX,
  RING_SPARK_SIZE_MIN,
  RING_SPARK_SPREAD,
  RING_SPARK_THROUGH,
  RING_SPARK_THROUGH_JITTER,
  RING_SPLASH_DROP_LIFE,
  RING_SPLASH_DROP_SIZE,
  RING_SPLASH_DROP_Y,
  RING_SPLASH_FOAM_LIFE,
  RING_SPLASH_FOAM_SIZE,
  RING_SPLASH_FOAM_SIZE_JITTER,
  RING_SPLASH_FOAM_Y,
  RING_SPLASH_RISE,
  RING_SPLASH_RISE_JITTER,
  RING_SPLASH_SCATTER,
  RING_SPLASH_SPEED_JITTER,
  RING_SPLASH_SPREAD,
  SURGE_DROP_CARRY,
  SURGE_DROP_LIFE,
  SURGE_DROP_SIZE,
  SURGE_DROP_SIZE_JITTER,
  SURGE_DROP_Y,
  SURGE_FOAM_CARRY,
  SURGE_FOAM_LIFE,
  SURGE_FOAM_SIZE,
  SURGE_FOAM_SIZE_JITTER,
  SURGE_FOAM_Y,
  SURGE_SPRAY_BOW,
  SURGE_SPRAY_FLARE,
  SURGE_SPRAY_OUT,
  SURGE_SPRAY_OUT_JITTER,
  SURGE_SPRAY_RISE,
  SURGE_SPRAY_RISE_JITTER,
  SURGE_SPRAY_RUN,
  SURGE_SPRAY_STEM_BEAM,
} from './constants'

interface SprayingShip {
  x: number
  z: number
  velocityX: number
  velocityZ: number
  heading: number
}

export function emitRingSparks(sparks: ParticlePool, gate: Gate, count: number) {
  const { facingX, facingZ } = gate
  for (let i = 0; i < count; i++) {
    const angle = rand(0, Math.PI * 2)
    const out = Math.cos(angle)
    const up = Math.sin(angle)
    const height = ARCH_LIFT + up * GATE_HALF_WIDTH
    if (height < 0) continue
    const across = out * GATE_HALF_WIDTH
    const burst = rand(...RING_SPARK_BURST_JITTER) * RING_SPARK_SPREAD
    const through = rand(...RING_SPARK_THROUGH_JITTER) * RING_SPARK_THROUGH
    sparks.spawn(
      acrossGateX(gate, across),
      height,
      acrossGateZ(gate, across),
      facingZ * out * burst + facingX * through,
      up * burst,
      -facingX * out * burst + facingZ * through,
      rand(RING_SPARK_SIZE_MIN, RING_SPARK_SIZE_MAX),
      rand(RING_SPARK_LIFE_MIN, RING_SPARK_LIFE_MAX)
    )
  }
}

export function emitRingSplash(foam: ParticlePool, drops: ParticlePool, gate: Gate, count: number) {
  for (const side of GATE_SIDES) {
    const endX = acrossGateX(gate, RING_END_REACH * side)
    const endZ = acrossGateZ(gate, RING_END_REACH * side)
    for (let i = 0; i < count; i++) {
      const angle = rand(0, Math.PI * 2)
      const speed = rand(...RING_SPLASH_SPEED_JITTER) * RING_SPLASH_SPREAD
      const scatterX = Math.cos(angle)
      const scatterZ = Math.sin(angle)
      drops.spawn(
        endX + scatterX * RING_SPLASH_SCATTER,
        RING_SPLASH_DROP_Y,
        endZ + scatterZ * RING_SPLASH_SCATTER,
        scatterX * speed,
        rand(...RING_SPLASH_RISE_JITTER) * RING_SPLASH_RISE,
        scatterZ * speed,
        rand(...RING_SPLASH_DROP_SIZE),
        RING_SPLASH_DROP_LIFE
      )
      foam.spawn(
        endX + scatterX * RING_SPLASH_SCATTER * 2,
        RING_SPLASH_FOAM_Y,
        endZ + scatterZ * RING_SPLASH_SCATTER * 2,
        scatterX * speed,
        0,
        scatterZ * speed,
        RING_SPLASH_FOAM_SIZE * rand(...RING_SPLASH_FOAM_SIZE_JITTER),
        RING_SPLASH_FOAM_LIFE
      )
    }
  }
}

export function emitSurgeSpray(
  foam: ParticlePool,
  drops: ParticlePool,
  { x, z, velocityX, velocityZ, heading }: SprayingShip
) {
  const forwardX = Math.sin(heading)
  const forwardZ = Math.cos(heading)
  const side = Math.random() < 0.5 ? 1 : -1
  const back = rand(0, SURGE_SPRAY_RUN)
  const ahead = SURGE_SPRAY_BOW - back
  const beam = (SURGE_SPRAY_STEM_BEAM + back * SURGE_SPRAY_FLARE) * side
  const spotX = x + forwardX * ahead + forwardZ * beam
  const spotZ = z + forwardZ * ahead - forwardX * beam
  const out = rand(...SURGE_SPRAY_OUT_JITTER) * SURGE_SPRAY_OUT * side
  const outX = forwardZ * out
  const outZ = -forwardX * out
  drops.spawn(
    spotX,
    SURGE_DROP_Y,
    spotZ,
    velocityX * SURGE_DROP_CARRY + outX,
    rand(...SURGE_SPRAY_RISE_JITTER) * SURGE_SPRAY_RISE,
    velocityZ * SURGE_DROP_CARRY + outZ,
    SURGE_DROP_SIZE * rand(...SURGE_DROP_SIZE_JITTER),
    SURGE_DROP_LIFE
  )
  foam.spawn(
    spotX,
    SURGE_FOAM_Y,
    spotZ,
    velocityX * SURGE_FOAM_CARRY + outX,
    0,
    velocityZ * SURGE_FOAM_CARRY + outZ,
    SURGE_FOAM_SIZE * rand(...SURGE_FOAM_SIZE_JITTER),
    SURGE_FOAM_LIFE
  )
}
