// ── Gates ─────────────────────────────────────────────────────────────────────
export const GATE_HALF_WIDTH = 45
export const PASS_TOLERANCE = 6

// ── Starting ──────────────────────────────────────────────────────────────────
export const START_BESIDE_BUOY = 30
export const START_MARKER_HEIGHT = 18
export const START_MARKER_PIXELS = 22
export const READY_SECONDS = 3
export const SHIP_FADE_OUT_SECONDS = 0.45
export const SHIP_FADE_IN_SECONDS = 0.5
export const START_GLIDE_SPEED = 110
export const START_GLIDE_MIN_SECONDS = 0.9
export const START_GLIDE_MAX_SECONDS = 2
export const GO_SECONDS = 0.8

// ── Run ───────────────────────────────────────────────────────────────────────
export const ABANDON_DISTANCE = 700
export const ABANDON_SECONDS = 12
export const SILVER_RATIO = 1.2
export const BRONZE_RATIO = 1.45
export const SHOWN_TENTHS = 10
export const SEEN_REACH = 320
export const BUOY_SPOTTED_REACH = 130
export const RACE_WIND_STRENGTH = 1

// ── Clean-line surge ──────────────────────────────────────────────────────────
export const PERFECT_REACH = 15
export const SURGE_SECONDS = 3.5
export const SURGE_LEVELS = [0.15, 0.25, 0.35]
export const PERFECT_CALL_SECONDS = 1.4
export const SPLIT_CALL_SECONDS = PERFECT_CALL_SECONDS
export const SURGE_SPRAY_RATE = 22
export const SURGE_SPRAY_FULL_SPEED = 30
export const SURGE_SPRAY_BOW = 17.3
export const SURGE_SPRAY_STEM_BEAM = 0.8
export const SURGE_SPRAY_RUN = 4.5
export const SURGE_SPRAY_FLARE = 0.4
export const SURGE_DROP_CARRY = 0.8
export const SURGE_FOAM_CARRY = 0.85
export const SURGE_SPRAY_OUT = 9
export const SURGE_SPRAY_RISE = 18
export const SURGE_DROP_SIZE = 0.95
export const SURGE_DROP_LIFE = 1
export const SURGE_FOAM_SIZE = 3
export const SURGE_FOAM_LIFE = 0.9

// ── Ring feedback ─────────────────────────────────────────────────────────────
export const RING_PULSE_SECONDS = 1
export const RING_PULSE_GROW = 0.05
export const RING_PULSE_ATTACK = 0.8
export const ARCH_PULSE_SHINE = 0.8
export const RING_PULSES = { passed: 0.5, perfect: 1, finished: 1.3 }
export const RING_SPARKS = { passed: 20, perfect: 70, finished: 130 }
export const RING_SPLASHES = { passed: 3, perfect: 7, finished: 10 }
export const RING_SPARK_POOL = 320
export const RING_SPARK_GRAVITY = 24
export const RING_SPARK_SPREAD = 24
export const RING_SPARK_THROUGH = 24
export const RING_SPARK_SIZE_MIN = 1.2
export const RING_SPARK_SIZE_MAX = 2.2
export const RING_SPARK_LIFE_MIN = 1
export const RING_SPARK_LIFE_MAX = 1.8
export const RING_SPLASH_RISE = 22
export const RING_SPLASH_SPREAD = 9
export const RING_SPLASH_SCATTER = 3
export const RING_SPLASH_DROP_LIFE = 1.6
export const RING_SPLASH_FOAM_LIFE = 1.1
export const RING_SPLASH_FOAM_SIZE = 3.5
export const RACE_FOAM_POOL = 220
export const RACE_DROP_POOL = 320
export const RACE_SPRAY_GRAVITY = 32

// ── Start buoys ───────────────────────────────────────────────────────────────
export const BUOY_FLOAT_RADIUS = 5.5
export const BUOY_FLOAT_HEIGHT = 2.6
export const BUOY_FLOAT_SINK = 1.2
export const BUOY_FLOAT_SEGMENTS = 12
export const BUOY_LIP_RADIUS = 4.4
export const BUOY_LIP_HEIGHT = 0.5
export const BUOY_WAVE_TILT = 0.6
export const BUOY_HIT_RADIUS = 7
export const BUOY_HIT_HEIGHT = 15
export const BUOY_SCALE = 0.7
export const BUOY_COLOR = '#f5871f'
export const BUOY_STRIPE_COLOR = '#f4efe6'
export const BUOY_LANTERN_COLOR = '#ffc65c'

// ── Buoy tower ────────────────────────────────────────────────────────────────
export const BUOY_TOWER_HEIGHT = 11
export const BUOY_TOWER_BASE_HALF_WIDTH = 3.4
export const BUOY_TOWER_TOP_HALF_WIDTH = 1.4
export const BUOY_LEG_THICKNESS = 0.8
export const BUOY_BRACE_THICKNESS = 0.6
export const BUOY_BRACE_SHARE = 0.18
export const BUOY_STRIPE_BOTTOM_SHARE = 0.43
export const BUOY_STRIPE_TOP_SHARE = 0.66
export const BUOY_TRIM_SHARE = 0.07

// ── Buoy lantern ──────────────────────────────────────────────────────────────
export const BUOY_PLATFORM_HALF_WIDTH = 2.1
export const BUOY_PLATFORM_HEIGHT = 0.5
export const BUOY_LANTERN_RADIUS = 0.95
export const BUOY_LANTERN_HEIGHT = 1.7
export const BUOY_LANTERN_SEGMENTS = 6
export const BUOY_ROOF_RADIUS = 1.35
export const BUOY_ROOF_RIM_HEIGHT = 0.35
export const BUOY_ROOF_HEIGHT = 1

// ── Buoy flag ─────────────────────────────────────────────────────────────────
export const BUOY_POLE_HEIGHT = 5
export const BUOY_POLE_RADIUS = 0.16
export const BUOY_FLAG_LENGTH = 7
export const BUOY_FLAG_DROP = 4
export const BUOY_FLAG_SEGMENTS = 8
export const BUOY_FLAG_WAVES = 1.3
export const BUOY_FLAG_RATE = 6
export const BUOY_FLAG_FLAP = 0.55

// ── Arches ────────────────────────────────────────────────────────────────────
export const ARCH_TUBE_RADIUS = 2.6
export const ARCH_LIFT = 20
export const RING_END_REACH = Math.sqrt(GATE_HALF_WIDTH ** 2 - ARCH_LIFT ** 2)
export const RING_FOAM_REACH = 8.5
export const RING_FOAM_SHOWS_FROM = 0.6
export const ARCH_DRAWN_GLOW = 0.001
export const RING_FOAM_JAG = 1.8
export const RING_FOAM_GRAIN = 0.22
export const RING_FOAM_SPECK = 5
export const RING_FOAM_SPECK_GRAIN = 0.75
export const RING_FOAM_BREATHE = 0.6
export const RING_FOAM_BREATHE_RATE = 1.6
export const RING_FOAM_Y = 0.15
export const RING_FOAM_QUAD = 24
export const ARCH_RADIAL_SEGMENTS = 12
export const ARCH_TUBULAR_SEGMENTS = 96
export const ARCH_COLOR = '#ffc83d'
export const ARCH_CORE_GLOW = 0.85
export const ARCH_RIM_GLOW = 1.75
export const NEXT_ARCH_GLOW = 1
export const UPCOMING_ARCH_GLOW = 0.35
export const RINGS_SHOWN_AHEAD = 2
export const SOLID_ARCH_GLOW = UPCOMING_ARCH_GLOW
export const PASSED_ARCH_GLOW = 0.08
export const ARCH_GLOW_RATE = 6
export const COURSE_FADE_SECONDS = 0.6

// ── Ghost ship ────────────────────────────────────────────────────────────────
export const GHOST_TRACK_STEP = 0.2
export const GHOST_TRACK_MIN_VALUES = 4
export const GHOST_TRACK_VALUES_PER_SAMPLE = 2
export const GHOST_STILL_TANGENT = 1e-3
export const GHOST_SPLIT_PRECISION = 100
export const GHOST_COLOR = '#d4f5c0'
export const GHOST_LINE_ALPHA = 0.6
export const GHOST_NIGHT_STRENGTH = 0.45
export const GHOST_EDGE_ANGLE = 30
export const GHOST_SHOW_SECONDS = 0.5
export const GHOST_END_FADE_SECONDS = 0.8
export const GHOST_TURN_RATE = 8
