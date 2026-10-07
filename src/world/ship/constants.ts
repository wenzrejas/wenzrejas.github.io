// ── Ship model ────────────────────────────────────────────────────────────────
export const MODEL_BOW_OFFSET = Math.PI
export const MODEL_TARGET_SIZE = 55
export const MODEL_BRIGHTNESS = 1.15
export const INITIAL_HEADING = 0

// ── Rig nodes ─────────────────────────────────────────────────────────────────
export const HULL_NODE = 'Hull'
export const RUDDER_NODE = 'Rudder'
export const SAIL_NODE = 'Sail'
export const FLAG_NODES = ['Flag_Main', 'Flag_Stern']
export const LANTERN_GLOW_NODE = 'Lantern_Glow'
export const LANTERN_PARTS_MIN = [-0.4, 1.9, 4.45] as const
export const LANTERN_PARTS_MAX = [0.4, 3.35, 5.25] as const
export const WHEEL_PARTS_MIN = [-0.7, 2.45, 0.78] as const
export const WHEEL_PARTS_MAX = [0.7, 3.9, 1.0] as const

// ── Ship glow ─────────────────────────────────────────────────────────────────
export const GLOW_NIGHT_GAIN = 1.8

// ── Helm ──────────────────────────────────────────────────────────────────────
export const RUDDER_MAX_ANGLE = 0.45
export const RUDDER_TURN_RATE = 4
export const WHEEL_TURNS_PER_RUDDER = 3

// ── Flags ─────────────────────────────────────────────────────────────────────
export const FLAG_TURN_RATE = 1.5
export const FLAG_FLAP_AMPLITUDE = 0.12
export const FLAG_FLAP_RATE = 7
export const FLAG_WAVES_PER_LENGTH = 1.2
export const FLAG_FILL_CALM = 0.4

// ── Sail ──────────────────────────────────────────────────────────────────────
export const SAIL_RIPPLE_AMPLITUDE = 0.07
export const SAIL_RIPPLE_RATE = 1.4
export const SAIL_WAVES_PER_DROP = 0.8
export const SAIL_FILL_DEPTH = 0.25
export const SAIL_FILL_CALM = 0.7
export const CLOTH_STEP_SECONDS = 1 / 30

// ── Tailwind ──────────────────────────────────────────────────────────────────
export const TAILWIND_ALIGN_START = 0.5
export const TAILWIND_ALIGN_FULL = 0.9
export const TAILWIND_RATE = 1.5

// ── Slipstream ────────────────────────────────────────────────────────────────
export const SLIPSTREAM_HEIGHTS = [1.3, 1.8]
export const SLIPSTREAM_BOW_Z = 4.3
export const SLIPSTREAM_STERN_Z = -4.8
export const SLIPSTREAM_BEAM = 1.95
export const SLIPSTREAM_BOW_TAPER = 3
export const SLIPSTREAM_WIDTH = 0.12
export const SLIPSTREAM_SEGMENTS = 80
export const SLIPSTREAM_SPEED = 1.1
export const SLIPSTREAM_DASH = 0.5
export const SLIPSTREAM_OPACITY = 0.75
export const SLIPSTREAM_HIDE_BELOW = 0.01

// ── Lantern ───────────────────────────────────────────────────────────────────
export const LANTERN_PITCH_ANGLE = 0.1
export const LANTERN_PITCH_RATE = 1.6
export const LANTERN_ROLL_ANGLE = 0.06
export const LANTERN_ROLL_RATE = 1.1

// ── Ship physics ──────────────────────────────────────────────────────────────
export const BASE_Y = -3
export const BOB_AMP = 0.7
export const BOB_SPEED = 2
export const MOVE_SPEED = 30
export const TURN_SPEED = 0.6
export const TILT_MAX = 0.12
export const TILT_SPEED = 6

// ── Whirlpool drift ───────────────────────────────────────────────────────────
export const WHIRLPOOL_SWIRL_SPEED = 14
export const WHIRLPOOL_PULL_SPEED = 8
export const WHIRLPOOL_PULL_REACH_SHARE = 1.6
export const WHIRLPOOL_FULL_GRIP_SHARE = 0.4
export const WHIRLPOOL_EYE_CALM_SHARE = 0.08
export const WHIRLPOOL_LEAN = 0.8
export const WHIRLPOOL_LEAN_RATE = 3

// ── Hull collision ────────────────────────────────────────────────────────────
export const HULL_CIRCLES_SHIP_SIZE = 55
export const HULL_CIRCLES = [
  { ahead: 25.5, radius: 2.1 },
  { ahead: 21, radius: 2.2 },
  { ahead: 11, radius: 7.6 },
  { ahead: 5.5, radius: 9.4 },
  { ahead: -0.8, radius: 10.3 },
  { ahead: -7.3, radius: 10.2 },
  { ahead: -14.3, radius: 9.9 },
  { ahead: -20, radius: 9.1 },
]
export const HULL_SHORE_GAP = 0.5
export const HULL_COLLISION_PASSES = 2

// ── Hull foam ─────────────────────────────────────────────────────────────────
export const FOAM_REACH = 3
export const FOAM_Y = 0.1
export const FOAM_JAG = 1.8
export const FOAM_GRAIN = 0.22
export const HULL_BOB_PULSE = 0.4
export const HULL_FIELD_MARGIN = 6
export const HULL_FIELD_RESOLUTION = 160

// ── Hull ripple particles ─────────────────────────────────────────────────────
export const PARTICLE_LIFETIME = 2.5
export const PARTICLE_SPEED = 8
export const HULL_RIPPLE_GROUPS = 5
export const HULL_RIPPLES_PER_GROUP = 40
export const HULL_RIPPLE_TOTAL = HULL_RIPPLE_GROUPS * HULL_RIPPLES_PER_GROUP
export const HULL_RIPPLE_Y = 0.6
export const HULL_RIPPLE_JITTER = 1.8
export const HULL_RIPPLE_SPREAD = 0.25
export const HULL_RIPPLE_SIZE_MIN = 0.7
export const HULL_RIPPLE_SIZE_MAX = 1.9

// ── Wake trail ────────────────────────────────────────────────────────────────
export const WAKE_STERN_SHIFT = 6
export const WAKE_TRAIL_LENGTH = 128
export const WAKE_ARM_NEAR = 2.5
export const WAKE_ARM_FAR = 20
export const WAKE_ARM_HALF_WIDTH = 4
export const WAKE_MIN_SAMPLE_DIST = 0.5
export const WAKE_TOTAL_VERTS = WAKE_TRAIL_LENGTH * 4
export const WAKE_TRAIL_Y = 0.3
export const WAKE_INNER_MIN = 0.01
export const WAKE_FADE_MAX = 1.1
export const WAKE_REVEAL_RATE = 1.6
export const WAKE_FADE_RATE = 0.7

// ── Wake U-ripples ────────────────────────────────────────────────────────────
export const RIPPLE_MAX_GROUPS = 6
export const RIPPLE_SPRITES_PER_GROUP = 12
export const TOTAL_RIPPLE_SPRITES = RIPPLE_MAX_GROUPS * RIPPLE_SPRITES_PER_GROUP
export const RIPPLE_LIFETIME = 2.5
export const RIPPLE_EXPAND_SPEED = 5
export const RIPPLE_SPAWN_DIST = 5.5
export const RIPPLE_HALF_SPREAD = 4.0
export const RIPPLE_DEPTH = 9.0
export const WAKE_RIPPLE_Y = 0.4
export const WAKE_RIPPLE_SIZE_MIN = 1
export const WAKE_RIPPLE_SIZE_MAX = 1.8
export const RIPPLE_SHRINK = 1.25
