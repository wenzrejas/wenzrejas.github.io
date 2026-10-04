import type { NoiseOctave } from '../procedural/valueNoise'
import type { EdgeTint, ShadowStep } from './parchmentModel'

// ── Sheet shape (traced units) ────────────────────────────────────────────────
export const SHEET_CORNER_REACH = 72

// ── Canvas ────────────────────────────────────────────────────────────────────
export const PARCHMENT_MARGIN = 48
export const MAX_PIXEL_RATIO = 2

// ── Paper tone ────────────────────────────────────────────────────────────────
export const PAPER_CENTER = '#f4d5ae'
export const PAPER_EDGE = '#eac497'
export const TONE_FOCUS_X = 0.45
export const TONE_FOCUS_Y = 0.42
export const TONE_REACH = 0.62

// ── Paper surface ─────────────────────────────────────────────────────────────
export const SURFACE_SEED = 11

export const BROAD_MOTTLING_PIXEL = 8
export const BROAD_MOTTLING_STRENGTH = 0.8
export const BROAD_MOTTLING_OCTAVES: NoiseOctave[] = [
  { cellWidth: 180, cellHeight: 180, weight: 0.14 },
  { cellWidth: 80, cellHeight: 80, weight: 0.12 },
]

export const RELIEF_SEED = 5
export const RELIEF_TILE_PIXELS = 512
export const RELIEF_OCTAVES: NoiseOctave[] = [
  { cellWidth: 32, cellHeight: 32, weight: 0.1 },
  { cellWidth: 16, cellHeight: 16, weight: 0.13 },
  { cellWidth: 8, cellHeight: 8, weight: 0.15 },
  { cellWidth: 4, cellHeight: 4, weight: 0.17 },
  { cellWidth: 2, cellHeight: 2, weight: 0.16 },
  { cellWidth: 32, cellHeight: 4, weight: 0.06 },
]
export const RELIEF_GRAIN = 0.14
export const SHEET_RELIEF_STRENGTH = 0.75
export const BAND_RELIEF_STRENGTH = 0.5
export const STRIP_RELIEF_STRENGTH = 0.7

export const SPECKS_PER_PIXEL = 1 / 2400
export const SPECK_RADIUS_MIN = 0.35
export const SPECK_RADIUS_MAX = 1
export const SPECK_STRETCH_MAX = 1.8
export const SPECK_OPACITY_MIN = 0.2
export const SPECK_OPACITY_MAX = 0.55
export const SPECK_RGB = '112, 70, 34'
export const SPECK_CENTER_SHARE = 0.3
export const SPECK_EDGE_FALLOFF = 70

export const FIBERS_PER_PIXEL = 1 / 7000
export const FIBER_LENGTH_MIN = 5
export const FIBER_LENGTH_MAX = 18
export const FIBER_TILT = 0.45
export const FIBER_BEND = 0.12
export const FIBER_WIDTH = 0.6
export const FIBER_DARK = 'rgba(128, 86, 44, 0.1)'
export const FIBER_LIGHT = 'rgba(255, 250, 238, 0.16)'

export const CREASE_WIDTH = 0.9
export const CREASE_LIGHT_OFFSET = 0.9
export const CREASE_DARK = 'rgba(138, 90, 46, 0.22)'
export const CREASE_LIGHT = 'rgba(255, 250, 238, 0.42)'

// ── Aged band (traced units) ──────────────────────────────────────────────────
export const BAND_SAMPLE_STEP = 2
export const BAND_SMOOTHING = 9
export const BAND_REACH = 9.5
export const BAND_WANDER = 3.5
export const BAND_WANDER_WAVELENGTH = 45

// ── Aged band look ────────────────────────────────────────────────────────────
export const BAND_TINT = '#fcf4e8'
export const FOLD_WIDTH = 0.8
export const FOLD_RIDGE_GAP = 0.9
export const FOLD_DARK = 'rgba(150, 100, 54, 0.11)'
export const FOLD_LIGHT = 'rgba(255, 250, 240, 0.1)'

export const EDGE_TINTS: EdgeTint[] = [
  { reachPixels: 6, tint: '#f9f1e4' },
  { reachPixels: 2.5, tint: '#f6e8d4' },
]

export const RIM_RGB = '255, 250, 240'
export const RIM_OPACITY = 1
export const RIM_WIDTH = 1.5
export const RIM_FACING_MIN = 0.2
export const RIM_LEVELS = 5

// ── Shadow ────────────────────────────────────────────────────────────────────
export const SHADOW_RGB = '2, 16, 30'
export const SHADOW_DROP = 2
export const SHADOW_STEPS: ShadowStep[] = [
  { reachPixels: 5, opacity: 0.1 },
  { reachPixels: 2, opacity: 0.16 },
]

export const CAST_SHADOW_RGB = '110, 66, 28'
export const CAST_SHADOW_STEPS: ShadowStep[] = [
  { reachPixels: 5, opacity: 0.16 },
  { reachPixels: 2, opacity: 0.2 },
]

// ── Back strip ────────────────────────────────────────────────────────────────
export const BACK_STRIP_LIT = '#e2b887'
export const BACK_STRIP_SHADED = '#cfa06c'
export const BACK_STRIP_EDGE_TINTS: EdgeTint[] = [{ reachPixels: 3, tint: '#f4e3cb' }]

// ── Rod (traced units) ────────────────────────────────────────────────────────
export const ROD_LEFT = -16
export const ROD_RIGHT = 18
export const ROD_TOP = 49.2
export const ROD_BOTTOM = 60.6
export const KNOT_X = -11.6
export const KNOT_Y = 56
export const KNOT_RADIUS = 1.4
export const COLLAR_LEFT = -2
export const COLLAR_RIGHT = 3.4
export const COLLAR_TOP = 47.4
export const COLLAR_BOTTOM = 62.6

// ── Rod look ──────────────────────────────────────────────────────────────────
export const ROD_SHADES: [number, string][] = [
  [0, '#d0b391'],
  [0.12, '#a66b3a'],
  [0.35, '#9a6237'],
  [0.55, '#8c5730'],
  [0.68, '#6f3f20'],
  [0.9, '#62351c'],
  [1, '#45251a'],
]
export const ROD_OUTLINE = 'rgba(42, 22, 10, 0.55)'
export const ROD_OUTLINE_WIDTH = 1
export const ROD_GRAIN = 'rgba(58, 30, 12, 0.32)'
export const ROD_GRAIN_LINES = 4
export const ROD_GRAIN_WIDTH = 0.7
export const ROD_GRAIN_SPREAD = 0.6
export const ROD_GRAIN_WOBBLE = 0.6
export const ROD_SHADOW = 'rgba(2, 16, 30, 0.35)'
export const ROD_SHADOW_DROP = 2.2
export const KNOT_COLOR = '#4a1f08'
export const KNOT_SQUASH = 0.8
export const COLLAR_BANDS = 2
export const COLLAR_LINE_WIDTH = 0.8
export const COLLAR_SHADES: [number, string][] = [
  [0, '#7a5434'],
  [0.5, '#523119'],
  [1, '#2f1b0e'],
]
export const COLLAR_HIGHLIGHT = 'rgba(214, 176, 136, 0.45)'
export const COLLAR_HIGHLIGHT_SHARE = 0.32
export const COLLAR_HIGHLIGHT_INSET = 1.2
