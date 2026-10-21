// ── Model roles ───────────────────────────────────────────────────────────────
export const WATERFALL_SHEET_ROLE = 'waterfall_sheet'
export const WATER_CHANNEL_ROLE = 'water_channel'
export const FLOW_HIGHLIGHT_ROLE = 'waterfall_flow_highlight'

// ── Flow (UV units per second) ────────────────────────────────────────────────
export const SHEET_FLOW_SPEED = 0.56
export const CHANNEL_FLOW_SPEED = 0.29
export const HIGHLIGHT_FLOW_SPEED = 0.9
export const HIGHLIGHT_DASHES = 3
export const HIGHLIGHT_DASH_SHARE = 0.4
export const HIGHLIGHT_STRENGTH = 0.4

// ── Ocean tone (0 deep, 1 mid; both follow the day-night cycle) ───────────────
export const TONE_BASE = 0.58
export const TONE_PEAK = 1

// ── Foam (cells per UV; foam where the cell field reaches the threshold) ──────
export const FOAM_CELLS_ACROSS = 6
export const FOAM_CELLS_ALONG = 4.5
export const FOAM_FINE_CELLS_ACROSS = 12
export const FOAM_FINE_CELLS_ALONG = 6.4
export const FOAM_FINE_PACE = 0.77
export const FOAM_DENSE = 0.2
export const FOAM_SPARSE = 0.5
export const FOAM_END_REACH = 0.18
export const FOAM_NIGHT_SHARE = 0.5
export const FOAM_STRENGTH = 0.6

// ── Cell texture (tileable cell-distance field) ───────────────────────────────
export const CELL_TEXTURE_SIZE = 128
export const CELL_TEXTURE_CELLS = 8
export const CELL_TEXTURE_RANGE = 0.8
export const CELL_TEXTURE_SEED = 7

// ── Bases (model units) ───────────────────────────────────────────────────────
export const SEA_DISCHARGE_HEIGHT = 0.5
export const BASE_EDGE_BAND = 0.05

// ── Foam pads (world units) ───────────────────────────────────────────────────
export const PAD_WIDTH_SHARE = 1.5
export const PAD_DEPTH = 12
export const PAD_LIFT = 0.15
export const PAD_FLOW = 0.12

// ── Splash (world units, cycles per second) ───────────────────────────────────
export const SEA_SPLASH_PARTICLES = 100
export const POOL_SPLASH_PARTICLES = 30
export const SPLASH_RATE = 0.6
export const SPLASH_RATE_SPREAD = 0.3
export const SPLASH_ANGLE_MIN = 0.35
export const SPLASH_ANGLE_MAX = 1.2
export const SPLASH_REACH = 7
export const SPLASH_HEIGHT = 6
export const SPLASH_SIZE = 1.8
export const SPLASH_LIFT = 0.3
export const SPLASH_BOUNDS_MARGIN = 12
