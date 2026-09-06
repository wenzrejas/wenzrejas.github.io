// ── Ship model ────────────────────────────────────────────────────────────────
export const MODEL_BOW_OFFSET = Math.PI
export const MODEL_TARGET_SIZE = 42
export const INITIAL_HEADING = 0

// ── Ship physics ──────────────────────────────────────────────────────────────
export const BASE_Y = -3
export const BOB_AMP = 0.7
export const BOB_SPEED = 2
export const MOVE_SPEED = 30
export const TURN_SPEED = 0.6
export const TILT_MAX = 0.12
export const TILT_SPEED = 6

// ── Hull foam geometry ────────────────────────────────────────────────────────
export const FOAM_PLANE_SIZE = 50
export const HULL_BEAM_RATIO = 0.45
export const FOAM_WIDTH_TRIM = 1
export const FOAM_Y = 0.1

export const hullFoamBound = (modelSize: number, trim: number) =>
  (modelSize * HULL_BEAM_RATIO * trim) / (2 * FOAM_PLANE_SIZE)

// ── Hull ripple particles ─────────────────────────────────────────────────────
export const PARTICLE_LIFETIME = 2.5
export const PARTICLE_SPEED = 8

// ── Wake trail ────────────────────────────────────────────────────────────────
export const WAKE_TRAIL_LENGTH = 128
export const WAKE_ARM_NEAR = 5
export const WAKE_ARM_FAR = 24
export const WAKE_ARM_HALF_WIDTH = 4
export const WAKE_MIN_SAMPLE_DIST = 0.5
export const WAKE_TOTAL_VERTS = WAKE_TRAIL_LENGTH * 4

// ── Wake U-ripples ────────────────────────────────────────────────────────────
export const RIPPLE_MAX_GROUPS = 6
export const RIPPLE_SPRITES_PER_GROUP = 12
export const TOTAL_RIPPLE_SPRITES = RIPPLE_MAX_GROUPS * RIPPLE_SPRITES_PER_GROUP
export const RIPPLE_LIFETIME = 2.5
export const RIPPLE_EXPAND_SPEED = 5
export const RIPPLE_SPAWN_DIST = 5.5
export const RIPPLE_HALF_SPREAD = 4.0
export const RIPPLE_DEPTH = 9.0
