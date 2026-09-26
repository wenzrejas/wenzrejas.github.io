import { PHASES } from '../DayNightCycle/dayNightKeyframes'

// ── Spawning ──────────────────────────────────────────────────────────────────
export const FIRST_CHECK_DELAY = 5
export const CHECK_INTERVAL = 10
export const SPAWN_CHANCE = 0.15
export const OPEN_WATER_GAP = 200
export const POD_MIN = 2
export const POD_MAX = 4
export const FOLLOW_TIME_MIN = 30
export const FOLLOW_TIME_MAX = 60

// ── Time of day ───────────────────────────────────────────────────────────────
export const ACTIVE_FROM = PHASES.sunrise - 0.03
export const ACTIVE_UNTIL = (PHASES.morning + PHASES.noon) / 2
export const NOON_UNTIL = (PHASES.noon + PHASES.afternoon) / 2
export const NOON_CHANCE = 0.1

// ── Formation ─────────────────────────────────────────────────────────────────
export const SLOT_ANGLE_MIN = 0.45
export const SLOT_ANGLE_STEP = 0.5
export const SLOT_ANGLE_JITTER = 0.08
export const SLOT_RADIUS_MIN = 30
export const SLOT_RADIUS_MAX = 42
export const ORBIT_RATE = 0.3
export const ORBIT_SETTLE = 0.5
export const IDLE_SHIP_SPEED = 15
export const LEAVE_DRIFT = 15
export const SEPARATION_RADIUS = 18
export const SEPARATION_STRENGTH = 20
export const SHIP_CLEARANCE = 24
export const WHALE_CLEARANCE = 32

// ── Roaming near islands ──────────────────────────────────────────────────────
export const ROAM_START_GAP = 110
export const ROAM_END_GAP = 140
export const ROAM_ANCHOR_GAP = 110
export const ROAM_RATE = 0.25

// ── Swimming ──────────────────────────────────────────────────────────────────
export const DOLPHIN_LENGTH = 14
export const FOLLOW_GAIN = 1.2
export const MAX_SPEED = 45
export const ACCEL = 1.5
export const TURN_GAIN = 1.5
export const MAX_YAW_RATE = 1.0
export const YAW_SMOOTH = 2
export const TURN_SLOWDOWN = 0.35
export const BANK_FACTOR = 0.5
export const PITCH_SMOOTH = 8
export const FLUKE_FREQ = 1.6

// ── Depth ─────────────────────────────────────────────────────────────────────
export const CRUISE_DEPTH_MIN = 3.6
export const CRUISE_DEPTH_MAX = 4.4
export const HIDDEN_DEPTH = 14
export const FADE_START_DEPTH = 5
export const RISE_RATE = 2
export const DIVE_RATE = 2.5

// ── Surfacing & leaping ───────────────────────────────────────────────────────
export const ACTION_DELAY_MIN = 2
export const ACTION_DELAY_MAX = 6
export const LEAP_CHANCE = 0.35
export const LEAP_MIN_SPEED = 6
export const SURFACE_DURATION = 2.6
export const SURFACE_LIFT = 2.6
export const SURFACE_ARCH = 0.15
export const LEAP_DURATION = 1.4
export const LEAP_HEIGHT = 10
export const LEAP_HEIGHT_JITTER = 0.25
export const LEAP_PITCH_BOOST = 1.25
export const LEAP_PITCH_MAX = 1.35
export const LEAP_ARCH = 0.4
export const LEAP_ROLL = 0.3

// ── Spray ─────────────────────────────────────────────────────────────────────
export const FOAM_POOL = 240
export const DROP_POOL = 160
export const FOAM_Y = 0.4
export const FOAM_LIFE = 1.4
export const FOAM_SIZE = 1.1
export const DROP_SIZE = 0.45
export const DROP_GRAVITY = 32
export const FIN_HEIGHT = 0.22
export const FIN_WAKE_SPACING = 1.4
export const FIN_WAKE_DRIFT = 1.5
export const SPLASH_EXIT_DROPS = 12
export const SPLASH_ENTRY_DROPS = 22
export const SPLASH_RING = 12
export const SPLASH_RING_SPEED = 4.5
