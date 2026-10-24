import type { GemHaloTuning } from '@/world/islands/shared/gem-halo/gemHaloModel'
import type { CornerSparkleTuning } from '@/world/islands/shared/gem-sparkles/sparkleSpots'

export const PORTAL_GLOW_MATERIAL = 'Magic | luminous cyan'
export const PORTAL_CIRCLE_NODE = 'Portal_Summoning_Circle'
export const PORTAL_KEYSTONE_NODE = 'Portal_Keystone_Jewel'

// ── Summoning circle (radians per second) ─────────────────────────────────────
export const CIRCLE_TURN_RATE = 0.12

// ── Base ring glow ────────────────────────────────────────────────────────────
export const RING_GLOW_LIFT = 0.012
export const RING_GLOW_REACH = 1.9
export const RING_GLOW_WIDTH = 0.22
export const RING_GLOW_STRENGTH = 0.55
export const RING_GLOW_COLOR = '#7ff0ff'

// ── Halos ─────────────────────────────────────────────────────────────────────
export const PORTAL_HALO: GemHaloTuning = { spread: 1.6, strength: 0.5 }
export const DIAMOND_HALO_COLOR = '#8fe6ff'
export const KEYSTONE_HALO_COLOR = '#9ff6ff'
export const KEYSTONE_HALO_RADIUS = 0.25

// ── Diamond ───────────────────────────────────────────────────────────────────
export const DIAMOND_BREATH = 0.25
export const DIAMOND_BREATH_RATE = 0.8
export const PORTAL_GLOW_PULSE = 0.3
export const PORTAL_GLOW_PULSE_RATE = 0.6
export const DIAMOND_GLINTS: CornerSparkleTuning = {
  color: '#bdf6ff',
  count: 6,
  size: 1.6,
  periodMinSeconds: 3,
  periodMaxSeconds: 7,
  flashShare: 0.12,
  lift: 1.02,
  rayWidth: 0.12,
  tintShare: 0.4,
}
