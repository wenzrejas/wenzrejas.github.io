import type { NoiseOctave } from '../procedural/valueNoise'

// ── Watercolor splash ─────────────────────────────────────────────────────────
export const SPLASH_SEED = 41
export const SPLASH_VARIANTS = 4
export const SPLASH_PIXELS = 128
export const SPLASH_RADIUS = 0.4
export const SPLASH_LOBE_COUNT = 6
export const SPLASH_LOBE_STRENGTH = 0.14
export const SPLASH_RAGGEDNESS = 0.3
export const SPLASH_RAGGED_OCTAVES: NoiseOctave[] = [
  { cellWidth: 16, cellHeight: 16, weight: 0.5 },
  { cellWidth: 6, cellHeight: 6, weight: 0.32 },
  { cellWidth: 2.5, cellHeight: 2.5, weight: 0.18 },
]
export const SPLASH_MOTTLE = 0.45
export const SPLASH_MOTTLE_OCTAVES: NoiseOctave[] = [
  { cellWidth: 32, cellHeight: 32, weight: 0.55 },
  { cellWidth: 10, cellHeight: 10, weight: 0.3 },
  { cellWidth: 4, cellHeight: 4, weight: 0.15 },
]
export const SPLASH_BODY = 0.6
export const SPLASH_EDGE_SOFTNESS = 0.03
export const SPLASH_RIM_WIDTH = 0.12
export const SPLASH_RIM_BOOST = 0.32
