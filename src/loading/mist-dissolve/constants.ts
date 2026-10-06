import type { NoiseOctave } from '@/panels/shared/procedural/valueNoise'

// ── Timing ────────────────────────────────────────────────────────────────────
export const DISSOLVE_SECONDS = 2

// ── Drawing (above the cloud deck) ────────────────────────────────────────────
export const DISSOLVE_RENDER_ORDER = 1001

// ── Origin (where the 3D ship sits, from the screen centre) ───────────────────
export const VOYAGE_SHIFT_X = -12
export const VOYAGE_SHIFT_Y = 12

// ── Clearing field ────────────────────────────────────────────────────────────
export const DISSOLVE_SEED = 29
export const DISSOLVE_CELL_PIXELS = 6
export const DISSOLVE_OCTAVES: NoiseOctave[] = [
  { cellWidth: 420, cellHeight: 420, weight: 0.55 },
  { cellWidth: 180, cellHeight: 180, weight: 0.22 },
  { cellWidth: 70, cellHeight: 70, weight: 0.05 },
]
export const DISSOLVE_BILLOW = 0.6
export const DISSOLVE_SOFTNESS = 0.1
