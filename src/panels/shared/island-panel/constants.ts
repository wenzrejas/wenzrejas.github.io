import type { NoiseOctave } from '../procedural/valueNoise'

// ── Mist wash ─────────────────────────────────────────────────────────────────
export const MIST_SEED = 31
export const MIST_WIDTH = 1200
export const MIST_HEIGHT = 120
export const MIST_OCTAVES: NoiseOctave[] = [
  { cellWidth: 200, cellHeight: 60, weight: 0.45 },
  { cellWidth: 100, cellHeight: 30, weight: 0.3 },
  { cellWidth: 50, cellHeight: 15, weight: 0.17 },
  { cellWidth: 24, cellHeight: 8, weight: 0.08 },
]
export const MIST_EDGE = 0.58
export const MIST_REACH = 1
export const MIST_SOFTNESS = 0.22
export const MIST_SOLID_DEPTH = 0.22
export const MIST_TAIL_START = 0.86

// ── Title underline (brush stroke) ────────────────────────────────────────────
export const BRUSH_SEED = 23
export const BRUSH_WIDTH = 320
export const BRUSH_HEIGHT = 20
export const BRUSH_START = 3
export const BRUSH_LENGTH = 312
export const BRUSH_BASELINE = 11
export const BRUSH_RISE = 2
export const BRUSH_SWAY = 0.6
export const BRUSH_SWAY_WAVES = 0.8
export const BRUSH_THICKNESS = 11
export const BRUSH_BODY_THINNING = 0.3
export const BRUSH_PRESS_SHARE = 0.035
export const BRUSH_TAIL_SHARE = 0.3
export const BRUSH_TAIL_CURVE = 1.3
export const BRUSH_STRANDS = 11
export const BRUSH_STRAND_OVERLAP = 1.7
export const BRUSH_STRAND_DRIFT = 0.1
export const BRUSH_STRAND_WEIGHT_MIN = 0.8
export const BRUSH_STRAND_WEIGHT_SPREAD = 0.4
export const BRUSH_STRAND_WOBBLE = 0.4
export const BRUSH_WOBBLE_RATE_MIN = 5
export const BRUSH_WOBBLE_RATE_SPREAD = 9
export const BRUSH_PULSE_DEPTH = 0.3
export const BRUSH_PULSE_CORE_SHARE = 0.4
export const BRUSH_PULSE_RATE_MIN = 14
export const BRUSH_PULSE_RATE_SPREAD = 22
export const BRUSH_STRAND_TAPER_SHARE = 0.08
export const BRUSH_STRAND_START_SPREAD = 0.004
export const BRUSH_EDGE_START_DELAY = 0.012
export const BRUSH_CORE_SHARE = 0.2
export const BRUSH_CORE_END_MIN = 0.95
export const BRUSH_EDGE_END_MIN = 0.55
export const BRUSH_EDGE_END_SPREAD = 0.38
export const BRUSH_SAMPLES = 90
