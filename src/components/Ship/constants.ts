// ── Ship physics ──────────────────────────────────────────────────────────────
export const BASE_Y = 2.5
export const BOB_AMP = 1
export const BOB_SPEED = 1.5
export const MOVE_SPEED = 30
export const TURN_SPEED = 0.6
export const DIR_OFFSET = 0
export const TILT_MAX = 0.12
export const TILT_SPEED = 6

// ── Hull foam geometry ────────────────────────────────────────────────────────
export const SHIP_HALF_WIDTH = 4.2 // world units
export const SHIP_HALF_DEPTH = 4.2 // world units
export const FOAM_PLANE_SIZE = 18 // world units

// ── Hull ripple particles ─────────────────────────────────────────────────────
export const RIPPLE_MAX = 5
export const PARTICLES_PER_RIPPLE = 40
export const TOTAL_PARTICLES = RIPPLE_MAX * PARTICLES_PER_RIPPLE // 200
export const PARTICLE_LIFETIME = 1.9
export const PARTICLE_SPEED = 9

// ── Wake trail ────────────────────────────────────────────────────────────────
export const WAKE_TRAIL_LENGTH = 64
export const WAKE_ARM_NEAR = 4.2 // inner arm width at ship stern (world units)
export const WAKE_ARM_FAR = 20 // inner arm width at trail end  (world units)
export const WAKE_ARM_HALF_WIDTH = 1.0 // half-width of each ribbon arm (world units)
export const WAKE_MIN_SAMPLE_DIST = 0.5 // minimum sample distance       (world units)
export const WAKE_TOTAL_VERTS = WAKE_TRAIL_LENGTH * 4

// ── Wake U-ripples ────────────────────────────────────────────────────────────
export const RIPPLE_MAX_GROUPS = 6
export const RIPPLE_SPRITES_PER_GROUP = 12
export const TOTAL_RIPPLE_SPRITES = RIPPLE_MAX_GROUPS * RIPPLE_SPRITES_PER_GROUP // 72
export const RIPPLE_LIFETIME = 1.4
export const RIPPLE_EXPAND_SPEED = 10
export const RIPPLE_SPAWN_DIST = 10
export const RIPPLE_HALF_SPREAD = 4.0 // half-width of U arc (world units)
export const RIPPLE_DEPTH = 5.0 // bowl depth          (world units)
