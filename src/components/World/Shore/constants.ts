export const SHORE_Y = 0.15
export const SHORE_MARGIN = 8

export type ShoreTuning = typeof SHORE_DEFAULTS

export const SHORE_DEFAULTS = {
  width: 0.45,
  rim: 0.22,
  reach: 9,
  inset: 1.2,
  speed: 0.085,
  segments: 16,
  dashMin: 0.1,
  dashMax: 0.48,
  dashBias: 1,
  strength: 0.95,
  wobble: 0.8,
}

export const SHORE_LONG_LINES: Partial<ShoreTuning> = {
  segments: 14,
  dashMin: 0.34,
  dashMax: 0.54,
  dashBias: 0.5,
  width: 1.0,
  wobble: 0.4,
}

// ── Shoreline ─────────────────────────────────────────────────────────────────
export const SHORELINE_RESOLUTION = 256

export const FOAM_EXPANDED_WIDTH = 2.4
export const FOAM_CONTRACTED_WIDTH = 1.1
export const FOAM_RECEDE_SHARE = 0.75
export const FOAM_JAG = 1.6
export const FOAM_GRAIN = 0.22
export const FOAM_TUCK = 1.5

export const WAVE_LAYERS = 1
export const WAVE_REACH = 4.5
export const WAVE_INSET = FOAM_EXPANDED_WIDTH
export const WAVE_WIDTH = 0.28
export const WAVE_SPEED = 0.12
export const WAVE_STRENGTH = 0.95
export const WAVE_DASH_GRAIN = 0.08
export const WAVE_DASH_SHORT = 0.66
export const WAVE_DASH_LONG = 0.5
export const WAVE_DASH_TAPER = 0.25
export const WAVE_LAG = 0.35
export const WAVE_LAG_GRAIN = 0.03
export const WAVE_SMOOTHING = 2.2

export const SHORELINE_MARGIN = WAVE_REACH + WAVE_WIDTH + WAVE_SMOOTHING * 2

// ── Coast collision ───────────────────────────────────────────────────────────
export const COLLISION_REACH = 12
export const COLLISION_RESOLUTION = 256
