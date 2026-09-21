import { PHASES } from '../DayNightCycle/dayNightKeyframes'
import type { IslandKey } from '../Islands/constants'

// ── Spawning ──────────────────────────────────────────────────────────────────
export const MAX_PATCHES = 4
export const FIRST_CHECK_DELAY = 3
export const CHECK_INTERVAL = 8
export const SPAWN_CHANCE = 0.35
export const MOONLIT_BOOST = 2.5
export const NIGHT_FROM = PHASES.dusk
export const NIGHT_UNTIL = PHASES['first light']
export const SPAWN_GAP_MIN = 30
export const SPAWN_GAP_MAX = 200
export const SPAWN_ATTEMPTS = 6
export const PATCH_EDGE_REACH = 1.25
export const AVOID_ISLANDS: IslandKey[] = ['timewell']
export const AVOID_ISLAND_GAP = 150
export const DESPAWN_DISTANCE = 1100

// ── Patches ───────────────────────────────────────────────────────────────────
export const PATCH_RADIUS_MIN = 120
export const PATCH_RADIUS_MAX = 240
export const FADE_IN = 1
export const INTENSITY_RATE = 0.5
export const AMBIENT_RATE = 0.8

// ── Glow ──────────────────────────────────────────────────────────────────────
export const GLOW_COLOR = '#4fe8ff'
export const SPARK_COLOR = '#b8fbff'
export const PLANE_SIZE = 900
export const PLANE_Y = 0.25
export const PLANE_MARGIN = 60
export const PLANE_SEGMENTS = 96
export const CREST_DIM = 0.55
export const CREST_BRIGHT = 1.35
export const SPECK_SCALE = 0.5
export const SPECK_THRESHOLD = 0.94
export const SPECK_SIZE = 0.22

// ── Scatter ───────────────────────────────────────────────────────────────────
export const TRAIL_POINTS = 40
export const TRAIL_SPACING = 6
export const TRAIL_LIFE = 8
export const SCATTER_RADIUS = 16
export const SCATTER_PUSH = 7

// ── Ship sparks ───────────────────────────────────────────────────────────────
export const SPARK_POOL = 320
export const SPARK_RATE = 140
export const SPARK_IDLE_RATE = 8
export const SPARK_LIFE_MIN = 1.2
export const SPARK_LIFE_MAX = 2.6
export const SPARK_SIZE = 1.8
export const SPARK_Y = 0.5
export const SPARK_SPEED = 4
export const HULL_HALF_LENGTH = 18
export const HULL_HALF_BEAM = 7

// ── Rain flashes ──────────────────────────────────────────────────────────────
export const MAX_RAIN_HITS = 64
export const RAIN_FLASH_SIZE = 2.2
export const RAIN_FLASH_LIFE = 0.7
export const RAIN_FLASH_DROPS = 3

// ── Splash ────────────────────────────────────────────────────────────────────
export const SPLASH_POOL = 200
export const SPLASH_GRAVITY = 32
export const SPLASH_RATE = 70
export const SPLASH_SIZE = 0.45
export const SPLASH_SPEED = 6
export const SPLASH_LIFT = 7
