import { BASE_TUNING, type IslandSpec } from '../islandSpec'
import { TIMEWELL_BASIN, TIMEWELL_FOOTPRINT, TIMEWELL_MODEL_TOP } from './shoreProfile'

export const TIMEWELL_MODEL_URL = '/models/islands/timewell_depth_web_draco.glb'

// ── Model nodes ───────────────────────────────────────────────────────────────
export const BODY_NODE = 'Whirlpool'

// ── Island spec ───────────────────────────────────────────────────────────────
const MODEL_RADIUS = TIMEWELL_FOOTPRINT / 2

export const TIMEWELL_SPEC: IslandSpec = {
  tuning: { ...BASE_TUNING, scale: 1.20, rotation: 180, offsetY: -3, brightness: 1.30 },
  footprint: TIMEWELL_FOOTPRINT,
  height: TIMEWELL_MODEL_TOP,
  collision: [],
  shore: [],
  calm: { inner: MODEL_RADIUS, outer: MODEL_RADIUS },
}

// ── Whirlpool ─────────────────────────────────────────────────────────────────
export const WHIRLPOOL_SPREAD = 2
export const WHIRLPOOL_RADIUS = TIMEWELL_BASIN.radius * WHIRLPOOL_SPREAD
export const WHIRLPOOL_FADE_START = 0.8
export const WHIRLPOOL_TWIST = 3
export const WHIRLPOOL_FLOW_DENSITY = 12
export const WHIRLPOOL_FLOW_SPEED = 1
export const WHIRLPOOL_WARP = 0.35
export const WHIRLPOOL_WARP_CELLS = 5

export const WHIRLPOOL_WILDLIFE_SPREAD = 1.3

// ── Whirlpool funnel ──────────────────────────────────────────────────────────
export const WHIRLPOOL_FUNNEL_DEPTH = 0.2
export const WHIRLPOOL_FUNNEL_CURVE = 1.5
export const WHIRLPOOL_FUNNEL_SEGMENTS = 128
export const WHIRLPOOL_FUNNEL_RINGS = 48

// ── Whirlpool water ───────────────────────────────────────────────────────────
export const WHIRLPOOL_CELLS_AROUND = 12
export const WHIRLPOOL_CELL_STRETCH = 2
export const WHIRLPOOL_CORE_SHADE = 0.7
export const WHIRLPOOL_DEPTH_REACH = 0.35
export const WHIRLPOOL_ARMS = 6
export const WHIRLPOOL_ARM_CREST = 0.75
export const WHIRLPOOL_ARM_CONTRAST = 0.12

// ── Whirlpool foam ────────────────────────────────────────────────────────────
export const WHIRLPOOL_BASE_FOAM = 0.32
export const WHIRLPOOL_CREST_FOAM = 0.28
export const WHIRLPOOL_FOAM_THIN_START = 0.9
export const WHIRLPOOL_STREAK_CELLS = 40
export const WHIRLPOOL_STREAK_COARSEN_RADIUS = 0.6
export const WHIRLPOOL_HOLE_CELLS = 26
export const WHIRLPOOL_HOLE_SIZE = 0.28
export const WHIRLPOOL_HOLE_WOBBLE = 0.4
export const WHIRLPOOL_FLECK_DENSITY = 3
export const WHIRLPOOL_FLECK_SIZE = 0.12

// ── Whirlpool shore ───────────────────────────────────────────────────────────
export const WHIRLPOOL_SHORE_BLEND = 8
export const WHIRLPOOL_COLLAR_IMPACT = 3.5
export const WHIRLPOOL_COLLAR_LEE = 1.8
export const WHIRLPOOL_PATCH_REACH = 4.5
export const WHIRLPOOL_PATCH_CELLS = 32
export const WHIRLPOOL_WAKE_LENGTH = 10
export const WHIRLPOOL_WAKE_STRENGTH = 0.35

// ── Whirlpool splashes ────────────────────────────────────────────────────────
export const WHIRLPOOL_SPLASH_SITE_BAND = 1.5
export const WHIRLPOOL_SPLASH_MIN_IMPACT = 0.35
export const WHIRLPOOL_SPLASH_INTERVAL_MIN = 0.08
export const WHIRLPOOL_SPLASH_INTERVAL_MAX = 0.3
export const WHIRLPOOL_SPLASH_DROPS = 14
export const WHIRLPOOL_SPLASH_DROP_SIZE = 0.8
export const WHIRLPOOL_SPLASH_RISE = 20
export const WHIRLPOOL_SPLASH_RECOIL = 4
export const WHIRLPOOL_SPLASH_CARRY = 3
export const WHIRLPOOL_SPLASH_GRAVITY = 32
export const WHIRLPOOL_SPLASH_Y = 0.3
export const WHIRLPOOL_SPLASH_FOAM_BLOBS = 5
export const WHIRLPOOL_SPLASH_FOAM_SIZE = 1.8
export const WHIRLPOOL_SPLASH_FOAM_LIFE = 1.4
export const WHIRLPOOL_SPLASH_FOAM_Y = 0.4
export const WHIRLPOOL_SPLASH_DROP_POOL = 200
export const WHIRLPOOL_SPLASH_FOAM_POOL = 100

// ── Whirlpool sprays ──────────────────────────────────────────────────────────
export const WHIRLPOOL_SPRAY_INNER = 0.2
export const WHIRLPOOL_SPRAY_OUTER = 0.85
export const WHIRLPOOL_SPRAY_SITE_STEP = 2
export const WHIRLPOOL_SPRAY_INTERVAL_MIN = 0.04
export const WHIRLPOOL_SPRAY_INTERVAL_MAX = 0.12
export const WHIRLPOOL_SPRAY_DROPS = 6
export const WHIRLPOOL_SPRAY_DROP_SIZE = 0.6
export const WHIRLPOOL_SPRAY_SPEED = 14
export const WHIRLPOOL_SPRAY_RISE = 12
export const WHIRLPOOL_SPRAY_FOAM_BLOBS = 2
export const WHIRLPOOL_SPRAY_DROP_POOL = 260
export const WHIRLPOOL_SPRAY_FOAM_POOL = 120
export const WHIRLPOOL_SPRAY_VIEW_REACH = 1.2

// ── Whirlpool night ───────────────────────────────────────────────────────────
export const WHIRLPOOL_MAGIC_COLOR = '#6d4cff'
export const WHIRLPOOL_MAGIC_SHIFT = 0.35
export const WHIRLPOOL_MAGIC_SHIFT_SPEED = 0.4
export const WHIRLPOOL_MAGIC_DAY_SHARE = 0.5
export const WHIRLPOOL_MAGIC_GLOW_BOOST = 0.8
export const WHIRLPOOL_MAGIC_HALO_BOOST = 1.2
export const WHIRLPOOL_FOAM_GLOW = 0.55
export const WHIRLPOOL_LIGHT_STREAKS = 9
export const WHIRLPOOL_LIGHT_DASH_DENSITY = 0.3
export const WHIRLPOOL_LIGHT_RUSH = 0.72
export const WHIRLPOOL_LIGHT_TAIL = 0.65
export const WHIRLPOOL_LIGHT_WIDTH = 0.06
export const WHIRLPOOL_LIGHT_SHARE = 0.55
export const WHIRLPOOL_LIGHT_STRENGTH = 1.1
export const WHIRLPOOL_RUNE_COLOR = '#5a1aff'
export const WHIRLPOOL_RUNE_NIGHT_BOOST = 0.8
export const WHIRLPOOL_RUNE_PULSE = 0.25
export const WHIRLPOOL_SPRAY_NIGHT_TINT = 0.7

// ── Whirlpool motes ───────────────────────────────────────────────────────────
export const WHIRLPOOL_MOTES = 180
export const WHIRLPOOL_MOTE_ORIGIN_X = -0.06
export const WHIRLPOOL_MOTE_ORIGIN_Z = 0
export const WHIRLPOOL_MOTE_LIFETIME = 6
export const WHIRLPOOL_MOTE_RISE = 40
export const WHIRLPOOL_MOTE_SIZE = 2.2
export const WHIRLPOOL_MOTE_STRENGTH = 1.4
export const WHIRLPOOL_MOTE_DAY_SHARE = 0.9
export const WHIRLPOOL_MOTE_REACH = 0.5
export const WHIRLPOOL_MOTE_CENTER_BIAS = 3

// ── Whirlpool core ────────────────────────────────────────────────────────────
export const WHIRLPOOL_GLOW_COLOR = '#b784ff'
export const WHIRLPOOL_GLOW_RADIUS = 0.075
export const WHIRLPOOL_GLOW_STRENGTH = 1.2
export const WHIRLPOOL_GLOW_PULSE = 0.15
export const WHIRLPOOL_GLOW_PULSE_SPEED = 1.6
export const WHIRLPOOL_HALO_RADIUS = 0.2
export const WHIRLPOOL_HALO_STRENGTH = 0.32
