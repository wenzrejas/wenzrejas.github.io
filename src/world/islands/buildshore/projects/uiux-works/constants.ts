import type { GemHaloTuning } from '@/world/islands/shared/gem-halo/gemHaloModel'
import type { CornerSparkleTuning } from '@/world/islands/shared/gem-sparkles/sparkleSpots'
import type { PulseRingTuning } from '@/world/islands/buildshore/shared/pulse-ring/pulseRingModel'

// ── Model nodes ───────────────────────────────────────────────────────────────
export const GEM_NODE = 'UIUX_Works_Gem'
export const PEDESTAL_INSET_NODE = 'UIUX Works | Gem violet inset'
export const INSET_GLOW_MATERIAL = 'UIUX Works | Violet luminous inset'

// ── Gem (model units, seconds) ────────────────────────────────────────────────
export const GEM_RISE_SECONDS = 0.6
export const GEM_LIFT = 0.7
export const GEM_SPIN_RATE = 0.9
export const GEM_BOB = 0.1
export const GEM_BOB_RATE = 1.6

// ── Gem sparkles (model units, seconds) ───────────────────────────────────────
export const GEM_SPARKLES: CornerSparkleTuning = {
  color: '#e9dcff',
  count: 9,
  size: 1,
  periodMinSeconds: 1.2,
  periodMaxSeconds: 2.6,
  flashShare: 0.22,
  lift: 1.04,
  rayWidth: 0.14,
  tintShare: 1,
}

// ── Gem glow ──────────────────────────────────────────────────────────────────
export const GEM_GLOW_DAY_SHARE = 0.25
export const GEM_GLOW_GAIN = 1.2
export const GEM_GLOW_HOVER = 0.6
export const GEM_HALO: GemHaloTuning = { spread: 1.8, strength: 0.5 }
export const GEM_HALO_COLOR = '#b98cff'

// ── Insets ────────────────────────────────────────────────────────────────────
export const INSET_PULSE = 1.4
export const INSET_PULSE_RATE = 1.2

// ── Plaza rings (model units) ─────────────────────────────────────────────────
export const PLAZA_RING_REACH = 4.6
export const PLAZA_RING: PulseRingTuning = {
  color: '#a46cff',
  periodSeconds: 2.4,
  rings: 3,
  isRepeating: true,
  width: 0.035,
  trail: 0.18,
  lift: 0.03,
  glow: 0.9,
}
