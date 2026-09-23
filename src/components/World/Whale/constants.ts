import { PHASES } from '../DayNightCycle/dayNightKeyframes'

// ── Spawning ──────────────────────────────────────────────────────────────────
export const FIRST_CHECK_DELAY = 30
export const CHECK_INTERVAL = 20
export const SPAWN_CHANCE = 0
export const OPEN_WATER_GAP = 200
export const SPAWN_YAW_MIN = 0.13
export const SPAWN_YAW_MAX = 0.2
export const BREACH_CLEARANCE = 60
export const RUN_LOOKAHEAD = 650
export const DESPAWN_VIEW_MARGIN = 1.3
export const BREACH_VIEW_MARGIN = 1
export const OFFSCREEN_GRACE = 4

// ── Daylight ──────────────────────────────────────────────────────────────────
export const DAYLIGHT_FROM = PHASES.sunrise
export const DAYLIGHT_UNTIL = PHASES.sunset

// ── Cruising ──────────────────────────────────────────────────────────────────
export const WHALE_LENGTH = 110
export const NOSE_OFFSET = 0.52
export const PRESENCE_RADIUS = 0.45
export const GLIDE_SPEED_MIN = 27
export const GLIDE_SPEED_MAX = 29
export const HOVER_TIME_MIN = 9
export const HOVER_TIME_MAX = 15
export const WANDER_FREQ = 0.15
export const WANDER_RATE = 0.06
export const ACCEL = 1.2
export const BANK_FACTOR = 1.6
export const BANK_LIMIT = 0.25
export const BANK_SMOOTH = 2
export const PITCH_SMOOTH = 3.5

// ── Depth ─────────────────────────────────────────────────────────────────────
export const GLIDE_DEPTH = 26
export const CHARGE_DEPTH = 34
export const HIDDEN_DEPTH = 54
export const FADE_START_DEPTH = 48
export const RISE_RATE = 13
export const DIVE_RATE = 8

// ── Breaching ─────────────────────────────────────────────────────────────────
export const CHARGE_TIME = 3.5
export const CHARGE_SPEED = 34
export const BREACH_SPEED = 16
export const BREACH_DURATION = 4.2
export const BREACH_HEIGHT = 45
export const BREACH_PITCH_BOOST = 1.6
export const BREACH_PITCH_MAX = 1.25
export const CRUISE_PITCH_MAX = 0.22
export const BREACH_ROLL = 1.1

// ── Stroke ────────────────────────────────────────────────────────────────────
export const STROKE_FREQ_GLIDE = 0.13
export const STROKE_FREQ_CHARGE = 0.4
export const STROKE_FREQ_AIR = 0.065
export const BEND_START = 0.1
export const BEND_SPAN = 0.6
export const STROKE_LAG = 2
export const STROKE_AMPLITUDE = 0.1
export const FIN_FREQ = 0.5
export const FIN_AMPLITUDE = 0.05

// ── Splash ────────────────────────────────────────────────────────────────────
export const FOAM_POOL = 320
export const DROP_POOL = 280
export const FOAM_Y = 0.4
export const FOAM_LIFE = 2
export const FOAM_SIZE = 1.9
export const DROP_SIZE = 0.6
export const DROP_GRAVITY = 32
export const SPLASH_POINTS = 3
export const SPLASH_SPREAD = 0.25
export const SPLASH_RING = 18
export const SPLASH_RING_SPEED = 7
export const EXIT_DROPS = 20
export const ENTRY_DROPS = 36
