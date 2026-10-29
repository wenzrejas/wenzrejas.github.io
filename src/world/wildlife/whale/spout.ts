import { rand } from '@/utils/math'
import type { ParticlePool } from '@/world/effects/particlePool'
import {
  SPOUT_BASE_Y,
  SPOUT_DROP_LIFE,
  SPOUT_DROP_SIZE,
  SPOUT_DROPS,
  SPOUT_RISE_MAX,
  SPOUT_RISE_MIN,
  SPOUT_SECONDS,
  SPOUT_SPREAD_MAX,
  SPOUT_SPREAD_MIN,
} from './constants'
import { blowholeOf, type Whale } from './whaleMotion'

export function emitSpout(drops: ParticlePool, whale: Whale, dt: number): void {
  if (whale.spoutDrops === 0) return

  const due = Math.min(whale.spoutDrops, Math.ceil((dt * SPOUT_DROPS) / SPOUT_SECONDS))
  const { x, z } = blowholeOf(whale)
  for (let i = 0; i < due; i++) {
    const angle = Math.random() * Math.PI * 2
    const spread = rand(SPOUT_SPREAD_MIN, SPOUT_SPREAD_MAX)
    drops.spawn(
      x + rand(-1, 1),
      SPOUT_BASE_Y,
      z + rand(-1, 1),
      Math.cos(angle) * spread,
      rand(SPOUT_RISE_MIN, SPOUT_RISE_MAX),
      Math.sin(angle) * spread,
      SPOUT_DROP_SIZE * rand(0.6, 1.4),
      SPOUT_DROP_LIFE
    )
  }
  whale.spoutDrops -= due
}
