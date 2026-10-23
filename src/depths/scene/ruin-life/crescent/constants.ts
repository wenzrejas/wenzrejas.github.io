import type { GemHaloTuning } from '@/world/islands/shared/gem-halo/gemHaloModel'
import type { CornerSparkleTuning } from '@/world/islands/shared/gem-sparkles/sparkleSpots'

export const SAPPHIRE_MOON = 'Lunar rebuilt | solid sapphire glass moon'

// ── Sapphire ──────────────────────────────────────────────────────────────────
export const SAPPHIRE_PULSE = 0.3
export const SAPPHIRE_PULSE_RATE = 0.6
export const SAPPHIRE_HALO: GemHaloTuning = { spread: 2.6, strength: 0.8 }
export const SAPPHIRE_HALO_COLOR = '#4f9dff'

// ── Crescent glints ───────────────────────────────────────────────────────────
export const CRESCENT_EDGE_NEAREST = 0.98
export const CRESCENT_EDGE_FARTHEST = 1.12
export const CRESCENT_EDGE_SLAB = 0.45
export const CRESCENT_GLINTS: CornerSparkleTuning = {
  color: '#ffe7a6',
  count: 10,
  size: 1.2,
  periodMinSeconds: 3,
  periodMaxSeconds: 8,
  flashShare: 0.1,
  lift: 1,
  rayWidth: 0.12,
  tintShare: 0.5,
}
