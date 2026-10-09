// ── Timing (from the Set Sail click) ──────────────────────────────────────────
export const DESCENT_DELAY_SECONDS = 0.4
export const DESCENT_SECONDS = 3.4

// ── Arrival zoom (share of the normal camera zoom) ────────────────────────────
export const ARRIVAL_ZOOM_FROM = 0.7

// ── Cloud layers (lowest first; heights in arrival camera heights) ────────────
export const CLOUD_LAYERS = [
  { height: 1.02, scale: 6, originX: 38, originY: 29, coverage: 0.56, opacity: 0.7 },
  { height: 1.15, scale: 4, originX: 71, originY: 12, coverage: 0.6, opacity: 0.78 },
  { height: 1.3, scale: 2.6, originX: 13, originY: 54, coverage: 0.64, opacity: 0.85 },
]
export const CLOUD_ZOOM_LIMIT = 40

// ── Baked layers (share of the canvas pixels; margin per side for the drift) ─
export const CLOUD_BAKE_SHARE = 0.75
export const CLOUD_BAKE_MARGIN = 0.06

// ── Cloud look ────────────────────────────────────────────────────────────────
export const CLOUD_TILT = 1.5
export const CLOUD_DRIFT = 0.025
export const CLOUD_OCTAVES = 5
export const CLOUD_SOFTNESS = 0.16
export const CLOUD_LIT_COLOR = '#fbfbf8'
export const CLOUD_SHADE_COLOR = '#a9b7cb'

// ── Clear sky over the ship (screen units from the centre) ────────────────────
export const SHIP_CLEARANCE = 0.3
export const SHIP_CLEAR_REACH = 0.2

// ── Cloud lighting (sunlit bulges plus a broad sunward gradient) ──────────────
export const LIGHT_BIAS = 0.3
export const BULGE_LIGHT_STEP = 0.1
export const BULGE_LIGHT_GAIN = 10
export const MASS_LIGHT_STEP = 0.4
export const MASS_LIGHT_GAIN = 5

// ── Passing through (a magnified layer thins, the centre first) ───────────────
export const PASS_FROM_ZOOM = 2
export const PASS_TO_ZOOM = 7
export const CLEAR_RISE = 0.7
export const CENTER_CLEAR = 0.3
export const CENTER_REACH = 0.8
