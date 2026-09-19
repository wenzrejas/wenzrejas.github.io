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
