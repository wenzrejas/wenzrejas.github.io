// ── Population (in levels; density grows as share of depth ^ ramp) ────────────
export const SPARKLE_COUNT = 900
export const SPARKLE_SEED = 53
export const SPARKLE_FROM_LEVEL = 0.4
export const SPARKLE_LEVELS_BELOW = 0.8
export const SPARKLE_DEPTH_RAMP = 1.6
export const SPARKLE_SPREAD_ACROSS = 140
export const SPARKLE_NEAREST_Z = 60
export const SPARKLE_FARTHEST_Z = -140

// ── Twinkle (seconds; share of each cycle spent flashing) ─────────────────────
export const SPARKLE_CYCLE_SECONDS: [number, number] = [2.5, 6]
export const SPARKLE_FLASH_SHARE = 0.3
export const SPARKLE_DRIFT = 1.5
export const SPARKLE_DRIFT_RATE = 0.3

// ── Look ──────────────────────────────────────────────────────────────────────
export const SPARKLE_SIZE = 4
export const SPARKLE_RAY_WIDTH = 0.2
export const SPARKLE_STRENGTH = 1.3
export const SPARKLE_HALO = 0.35
export const SPARKLE_CORE_WHITENESS = 0.3
export const SPARKLE_DEEP_BOOST = 0.6
export const SPARKLE_FADE_DENSITY = 0.005
export const SPARKLE_TINTS: { color: string; share: number }[] = [
  { color: '#2ff3ff', share: 0.4 },
  { color: '#ffd84a', share: 0.35 },
  { color: '#ffffff', share: 0.25 },
]
