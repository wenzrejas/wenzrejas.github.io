import type { GemSparkleTuning } from '@/world/islands/shared/gem-sparkles/gemSparklesModel'

// ── Gems ──────────────────────────────────────────────────────────────────────
export const GEM_SPIN_RATE = 0.4
export const GEM_TUMBLE_RATE = 0.25

export const SPARKLE_DENSITY = 0.8
export const SPARKLE_MIN_COUNT = 2
export const SPARKLE_SIZE = 2.8
export const GEM_SPARKLES: GemSparkleTuning = {
  periodMinSeconds: 2,
  periodMaxSeconds: 4,
  flashShare: 0.18,
  lift: 1.05,
  rayWidth: 0.14,
  tintShare: 0.35,
}
