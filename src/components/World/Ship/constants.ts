// ── Ship model ────────────────────────────────────────────────────────────────
export const MODEL_BOW_OFFSET = Math.PI // rotate model so bow faces -Z (forward); adjust if model faces wrong way
export const MODEL_TARGET_SIZE = 28 // scale model so longest horizontal axis = this many world units
export const INITIAL_HEADING = 0 // northeast on screen = world -Z direction

// ── Ship physics ──────────────────────────────────────────────────────────────
export const BASE_Y = -3
export const BOB_AMP = 0.7
export const BOB_SPEED = 2
export const MOVE_SPEED = 30
export const TURN_SPEED = 0.6
export const TILT_MAX = 0.12
export const TILT_SPEED = 6

// ── Hull foam geometry ────────────────────────────────────────────────────────
export const FOAM_PLANE_SIZE = 50 // world units
export const FOAM_BOUND = 0.13 // ellipse radius in UV space
export const FOAM_Y = 0.1 // world-space Y of the foam plane

// ── Hull ripple particles ─────────────────────────────────────────────────────
export const RIPPLE_MAX = 5
export const PARTICLES_PER_RIPPLE = 40
export const TOTAL_PARTICLES = RIPPLE_MAX * PARTICLES_PER_RIPPLE // 200
export const PARTICLE_LIFETIME = 2.5
export const PARTICLE_SPEED = 8

// ── Wake trail ────────────────────────────────────────────────────────────────
export const WAKE_TRAIL_LENGTH = 128
export const WAKE_ARM_NEAR = 4.5 // inner arm width at ship stern (world units)
export const WAKE_ARM_FAR = 15 // inner arm width at trail end  (world units)
export const WAKE_ARM_HALF_WIDTH = 1.5 // half-width of each ribbon arm (world units)
export const WAKE_MIN_SAMPLE_DIST = 0.5 // minimum sample distance       (world units)
export const WAKE_TOTAL_VERTS = WAKE_TRAIL_LENGTH * 4

// ── Wake U-ripples ────────────────────────────────────────────────────────────
export const RIPPLE_MAX_GROUPS = 6
export const RIPPLE_SPRITES_PER_GROUP = 12
export const TOTAL_RIPPLE_SPRITES = RIPPLE_MAX_GROUPS * RIPPLE_SPRITES_PER_GROUP // 72
export const RIPPLE_LIFETIME = 2.5
export const RIPPLE_EXPAND_SPEED = 5
export const RIPPLE_SPAWN_DIST = 5.5
export const RIPPLE_HALF_SPREAD = 4.0 // half-width of U arc (world units)
export const RIPPLE_DEPTH = 9.0 // bowl depth          (world units)
