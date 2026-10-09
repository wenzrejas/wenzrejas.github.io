import type { GroundGlowTuning } from '@/world/islands/shared/ground-glow/glowSites'

// ── Campfire ──────────────────────────────────────────────────────────────────
export const FIRE_WIDTH = 0.456
export const FIRE_HEIGHT = 0.518
export const FIRE_VISIBLE_LEVEL = 0.001

export const EMBER_COUNT = 24
export const EMBER_SIZE = 0.075
export const EMBER_SCALE_MIN = 0.6
export const EMBER_SCALE_MAX = 1.4
export const EMBER_LIFETIME = 2.6
export const EMBER_RISE = 1.2
export const EMBER_SPREAD = 0.35
export const EMBER_DRIFT = 0.45
export const EMBER_SWAY = 0.25

export const FLAME_TONGUES = 5
export const FLAME_SCALE = 2.4
export const FLAME_GLOW = 0.34

// ── Campfire flare ────────────────────────────────────────────────────────────
export const FLARE_FLAME_GROWTH = 0.25
export const FLARE_BOOST = 0.2
export const FLARE_EMBER_RISE = 0.5
export const FLARE_EMBER_GROWTH = 0.15
export const FLARE_GLOW_RADIUS = 0.75
export const FLARE_GLOW_COLOR = '#ff9a3c'

export const FIRE_FLARE_GLOW: GroundGlowTuning = {
  haloSpread: 1.4,
  haloFill: 0.2,
  haloStrength: 0.3,
  haloLift: 0.1,
  motesPerSite: 6,
  moteSize: 1.4,
  moteRise: 8,
  moteLifetime: 2.2,
  moteSwirl: 0.6,
  moteSpread: 0.5,
  moteInnerShare: 0.2,
  moteStrength: 0.8,
}
