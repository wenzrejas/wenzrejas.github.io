import { PHASES } from '@/world/environment/day-night-cycle/dayNightKeyframes'

// ── Spawning ──────────────────────────────────────────────────────────────────
export const FIRST_CHECK_DELAY = 30
export const CHECK_INTERVAL = 20
export const SPAWN_CHANCE = 0
export const OPEN_WATER_GAP = 260
export const SPAWN_BEHIND = 150
export const SPAWN_LEAD_SECONDS = 8
export const SPAWN_ASIDE = 70
export const CROSSING_ANGLE_DEGREES = 70
export const BREACH_CLEARANCE = 40
export const RUN_LOOKAHEAD = 400
export const LEAVE_VIEW_MARGIN = 1.3
export const GONE_VIEW_MARGIN = 1.1
export const BREACH_VIEW_MARGIN = 1
export const OFFSCREEN_GRACE = 4

// ── Daylight ──────────────────────────────────────────────────────────────────
export const DAYLIGHT_FROM = PHASES.sunrise
export const DAYLIGHT_UNTIL = PHASES.sunset

// ── Shape ─────────────────────────────────────────────────────────────────────
export const WHALE_LENGTH = 220
export const FLIPPER_SPLAY_DEGREES = 40
export const FLUKE_SPAN = 1.6
export const FLUKE_FLARE_REACH = 0.5
export const FLUKE_ROOT_THICKNESS = 0.03
export const FLUKE_TIP_THICKNESS = 0.006
export const FLUKE_TIP_LIFT = 0.03

// ── Cruising ──────────────────────────────────────────────────────────────────
export const PRESENCE_RADIUS = 0.45
export const GLIDE_SPEED = 14
export const BLOW_SPEED = 7
export const HOVER_TIME_MIN = 2
export const HOVER_TIME_MAX = 3
export const WANDER_FREQ = 0.15
export const WANDER_RATE = 0.05
export const ACCEL = 0.8
export const BANK_FACTOR = 1.6
export const BANK_LIMIT = 0.25
export const BANK_SMOOTH = 2
export const PITCH_SMOOTH = 2.5

// ── Depth ─────────────────────────────────────────────────────────────────────
export const BLOW_DEPTH = 8
export const GLIDE_DEPTH = 28
export const CHARGE_DEPTH = 40
export const HIDDEN_DEPTH = 80
export const SINK_DEPTH = 500
export const FADE_START_DEPTH = 46
export const RISE_RATE = 24
export const DIVE_RATE = 16
export const DEPTH_GAIN = 1
export const DEPTH_SMOOTH = 2
export const DEPTH_REACHED = 1.5
export const SURFACE_BOB = 3

// ── Blowing ───────────────────────────────────────────────────────────────────
export const BLOW_COUNT = 2
export const BLOW_LEAD = 0.4
export const BLOW_INTERVAL = 3
export const BLOWHOLE_OFFSET = 0.25

// ── Spout ─────────────────────────────────────────────────────────────────────
export const SPOUT_DROPS = 110
export const SPOUT_SECONDS = 0.6
export const SPOUT_BASE_Y = 1.5
export const SPOUT_RISE_MIN = 40
export const SPOUT_RISE_MAX = 60
export const SPOUT_SPREAD_MIN = 1
export const SPOUT_SPREAD_MAX = 8
export const SPOUT_DROP_SIZE = 1.3
export const SPOUT_DROP_LIFE = 4

// ── Breaching ─────────────────────────────────────────────────────────────────
export const CHARGE_TIME = 2.8
export const CHARGE_SPEED = 11
export const BREACH_SPEED = 12
export const BREACH_HEIGHT = 18
export const BREACH_GRAVITY = 32
export const BREACH_PITCH_BOOST = 1.6
export const BREACH_PITCH_MAX = 1
export const CRUISE_PITCH_MAX = 0.22
export const FLIGHT_PITCH = 0.6
export const FLIGHT_PITCH_SMOOTH = 1
export const BREACH_ROLL = 1.1
export const ROLL_SMOOTH = 1.5
export const BREACH_ARCH = 0.25

// ── Stroke ────────────────────────────────────────────────────────────────────
export const STROKE_FREQ_GLIDE = 0.26
export const STROKE_FREQ_CHARGE = 0.45
export const STROKE_FREQ_AIR = 0.08
export const BEND_START = 0.2
export const BEND_SPAN = 0.7
export const STROKE_LAG = 2.6
export const STROKE_AMPLITUDE = 0.07
export const HEAD_NOD = 0.012
export const FLIPPER_FREQ = 0.5
export const FLIPPER_SWEEP = 0.05
export const FLIPPER_LIFT = 0.03
export const STROKE_SWAY = 0.025
export const STROKE_SMOOTH = 1.5

// ── Body flex (curve per rad/s of turning or pitching) ────────────────────────
export const TURN_CURVE_GAIN = 2.5
export const CLIMB_CURVE_GAIN = 0.6
export const CURVE_LIMIT = 0.16
export const CURVE_SMOOTH = 2.5

// ── Splash ────────────────────────────────────────────────────────────────────
export const FOAM_POOL = 120
export const DROP_POOL = 320
export const FOAM_Y = 0.4
export const DROP_GRAVITY = 32
export const SPLASH_RADIUS = 24
export const SPLASH_CROWN_INNER_SHARE = 0.6
export const SPLASH_COLUMN_REACH_SHARE = 0.5
export const SPLASH_DROP_Y = 0.3
export const SPLASH_DROP_LIFE = 3
export const SPLASH_CROWN_DROPS = 110
export const SPLASH_COLUMN_DROPS = 40
export const SPLASH_DROP_SIZE_MIN = 0.35
export const SPLASH_DROP_SIZE_MAX = 0.85
export const SPLASH_CROWN_RISE_MIN = 12
export const SPLASH_CROWN_RISE_MAX = 26
export const SPLASH_COLUMN_RISE_MIN = 22
export const SPLASH_COLUMN_RISE_MAX = 36
export const SPLASH_OUTWARD_MIN = 3
export const SPLASH_OUTWARD_MAX = 10
export const SPLASH_FOAM = 36
export const SPLASH_FOAM_SIZE_MIN = 1
export const SPLASH_FOAM_SIZE_MAX = 2.2
export const SPLASH_FOAM_SPEED = 4
export const SPLASH_FOAM_LIFE = 2.6
export const JUMP_SPLASH_STRENGTH = 1
export const PLUNGE_SPLASH_STRENGTH = 1.3

// ── Wake ──────────────────────────────────────────────────────────────────────
export const WAKE_SPACING = 6
export const WAKE_SIDE_GAP = 8
export const WAKE_DRIFT = 3
export const WAKE_FADE_DEPTH = 30
export const WAKE_SIZE = 2
export const WAKE_LIFE = 2.4
