import type { IslandKey } from '../Islands/constants'

// ── Pool ──────────────────────────────────────────────────────────────────────
export const MAX_FISH = 64

// ── Spawning ──────────────────────────────────────────────────────────────────
export const FIRST_SPAWN_DELAY = 2
export const SPAWN_DELAY_MIN = 3
export const SPAWN_DELAY_MAX = 7
export const SPAWN_DISTANCE_MIN = 60
export const SPAWN_DISTANCE_MAX = 220
export const SPAWN_VIEW_MARGIN = 0.85
export const DESPAWN_VIEW_MARGIN = 1.2
export const LIFETIME_MIN = 20
export const LIFETIME_MAX = 40
export const NIGHT_CUTOFF = 0.4

// ── Groups ────────────────────────────────────────────────────────────────────
export const SCHOOL_CHANCE = 0.5
export const SCHOOL_MIN = 8
export const SCHOOL_MAX = 16
export const SCHOOL_SPREAD = 9
export const SCHOOL_FISH_SIZE = 2.6
export const LONE_FISH_SIZE = 4.5
export const FISH_SIZE_JITTER = 0.15

// ── Habitat ───────────────────────────────────────────────────────────────────
export const HABITAT_ISLANDS: IslandKey[] = ['cozy', 'buildshore', 'tech']
export const OPEN_WATER_CHANCE = 0.5
export const HABITAT_NEAR = 20
export const HABITAT_FAR = 180
export const SHORE_GAP = 12
export const SHORE_AVOID_DISTANCE = 30
export const SHORE_AVOID_RATE = 1.5

// ── Swimming ──────────────────────────────────────────────────────────────────
export const SCHOOL_SPEED = 5
export const LONE_SPEED = 7
export const SPEED_JITTER = 1.5
export const WANDER_RATE = 0.35
export const FOLLOW_RATE = 1.5
export const CATCHUP_SPEED = 10
export const HEADING_RATE = 4
export const TAIL_FREQ = 2.2
export const FLEE_TAIL_FREQ = 7

// ── Depth ─────────────────────────────────────────────────────────────────────
export const CRUISE_DEPTH_MIN = 1.5
export const CRUISE_DEPTH_MAX = 3.5
export const FADE_START_DEPTH = 2
export const HIDDEN_DEPTH = 14
export const RISE_RATE = 2.5
export const DIVE_RATE = 3

// ── Scatter ───────────────────────────────────────────────────────────────────
export const SCATTER_RADIUS = 35
export const FLEE_SPEED = 26
export const FLEE_DAMPING = 1.2
export const FLEE_SPREAD = 0.9
export const FLEE_DURATION = 1.6
export const ESCAPE_BOOST = 10
export const BOOST_DECAY = 0.4
export const SCATTER_DIVE_CHANCE = 0.5

// ── Look ──────────────────────────────────────────────────────────────────────
export const FISH_OPACITY = 0.5
export const FISH_SHADE = 0.35
