import { CYCLE_DURATION } from '../day-night-cycle/constants'

export const WIND_ENABLED = true
export const WIND_ANGLE = 0 // degrees
export const WIND_SPEED = 8 // world units / second
export const LINE_DURATION = 5 // seconds
export const LINE_LENGTH = 80 // world units
export const LINE_Y = 35 // world-space height
export const WAVE_AMPLITUDE = 3 // world units
export const LINE_WIDTH = 0.8 // ribbon thickness (world units)
export const SPAWN_INTERVAL = 2 // seconds
export const WIND_OPACITY = 0.4

// ── Streak pool ───────────────────────────────────────────────────────────────
export const WIND_STREAK_POOL = 8
export const WIND_CURVE_HANDLES = 5
export const WIND_CURVE_DIVISIONS = 40
export const WIND_STREAK_END = 1.1
export const WIND_SPAWN_AREA = 300
export const WIND_SPAWN_JITTER_MIN = 0.5
export const WIND_SPAWN_JITTER_MAX = 1.5

// ── Wind direction ────────────────────────────────────────────────────────────
export const WIND_AXIS = Math.PI / 4
export const WIND_SPREAD = Math.PI / 4
export const WIND_TURN_RATE = 1.5
export const WIND_SETTLED_ANGLE = 0.1
export const WIND_CHANGE_INTERVAL = CYCLE_DURATION / 2
