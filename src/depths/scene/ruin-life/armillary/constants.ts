import type { GemHaloTuning } from '@/world/islands/shared/gem-halo/gemHaloModel'

// ── Orb ───────────────────────────────────────────────────────────────────────
export const ORB_PULSE = 0.3
export const ORB_PULSE_RATE = 0.7

// ── Rings (radians per second around each ring's local axis) ──────────────────
export const RING_ROLE = 'armillary_ring'
export const RING_TURNS: Record<string, { axis: [number, number, number]; rate: number }> = {
  Armillary_Ring_EastWest: { axis: [0, 1, 0], rate: -0.12 },
  Armillary_Ring_Polar: { axis: [0, 1, 0], rate: 0.2 },
  Armillary_Ring_Zodiac: { axis: [0, 0, 1], rate: 0.08 },
}

// ── Beacon glow ───────────────────────────────────────────────────────────────
export const BEACON_ANCHOR_ROLE = 'beacon_glow'
export const BEACON_HALO: GemHaloTuning = { spread: 2.4, strength: 0.75 }
export const BEACON_HALO_RADIUS = 0.18
export const BEACON_HALO_COLOR = '#ffc46b'
export const BEACON_PULSE = 0.25
export const BEACON_PULSE_RATE = 1.1
