import { PHASES } from '@/world/environment/day-night-cycle/dayNightKeyframes'
import type { IslandKey } from '@/world/islands/shared/constants'

// ── Spawning ──────────────────────────────────────────────────────────────────
export const MAX_PATCHES = 6
export const FIRST_CHECK_DELAY = 3
export const CHECK_INTERVAL = 5
export const SPAWN_CHANCE = 0.6
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

// ── Glow flashes ──────────────────────────────────────────────────────────────
export const MAX_GLOW_HITS = 64
export const GLOW_FLASH_SIZE = 2.2
export const GLOW_FLASH_LIFE = 0.7
export const GLOW_FLASH_DROPS = 3

// ── Splash ────────────────────────────────────────────────────────────────────
export const SPLASH_POOL = 200
export const SPLASH_GRAVITY = 32
export const SPLASH_RATE = 70
export const SPLASH_SIZE = 0.45
export const SPLASH_SPEED = 6
export const SPLASH_LIFT = 7

// ── Thresholds ────────────────────────────────────────────────────────────────
export const PATCHES_CLEAR_BELOW_INTENSITY = 0.01
export const PLANE_HIDDEN_BELOW_INTENSITY = 0.001
export const SPARK_CRUISE_SPEED = 30

// ── Spray jitter ──────────────────────────────────────────────────────────────
export const HULL_SPARK_ALONG = [-1.2, 1] as const
export const HULL_SPARK_BEAM_GAP = 1.5
export const HULL_SPARK_OUTWARD_JITTER = [0.4, 1] as const
export const HULL_SPARK_BACKDRIFT = 1.5
export const HULL_SPARK_SIZE_JITTER = [0.6, 1.4] as const
export const BOW_SPLASH_ALONG = [0.1, 0.9] as const
export const BOW_SPLASH_BEAM_GAP = 0.5
export const BOW_SPLASH_OUTWARD_JITTER = [0.5, 1.2] as const
export const BOW_SPLASH_Y = 0.4
export const BOW_SPLASH_CARRY_SHARE = 0.4
export const BOW_SPLASH_LIFT_JITTER = [0.6, 1.2] as const
export const BOW_SPLASH_SIZE_JITTER = [0.6, 1.3] as const
export const SPLASH_DROP_LIFE = 3
export const GLOW_FLASH_SIZE_JITTER = [0.7, 1.2] as const
export const GLOW_FLASH_DROP_Y = 0.3
export const GLOW_FLASH_DROP_SPREAD = 1.5
export const GLOW_FLASH_DROP_RISE = [3, 5] as const
export const GLOW_FLASH_DROP_SIZE_JITTER = [0.5, 0.8] as const

// ── Patch shape ───────────────────────────────────────────────────────────────
export const PATCH_EDGE_SHARE = 0.95
export const PATCH_FADE_START_SHARE = 0.55
export const PATCH_MIN_SHORE_GAP_SHARE = 0.3

// ── Scatter trail ─────────────────────────────────────────────────────────────
export const TRAIL_UNVISITED_TIME = -1e6
