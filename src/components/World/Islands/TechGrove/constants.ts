import { BASE_TUNING, type ContactBlob, type IslandSpec } from '../islandSpec'
import { TECH_CLUSTER_RADIUS, TECH_FOOTPRINT, TECH_MODEL_TOP } from './shoreProfile'

export const TECH_MODEL_URL = '/models/islands/tech_grove_web_draco.glb'

// ── Model nodes ───────────────────────────────────────────────────────────────
export const BODY_NODE = 'Sanctuary'
export const BASE_RIM_NODES = [
  'Glow_Creative_Rim',
  'Glow_Design_Rim',
  'Glow_Frontend_Rim',
  'Glow_WebGL_Rim',
]
export const GEM_NODES = ['Gem_Design', 'Gem_Frontend', 'Gem_WebGL']
export const SPINNING_GEM_NODES = ['Gem_Frontend', 'Gem_WebGL']
export const TUMBLING_GEM_NODES = ['Gem_WebGL']

// ── Island spec ───────────────────────────────────────────────────────────────
export const TECH_SPEC: IslandSpec = {
  tuning: { ...BASE_TUNING, scale: 3.8, rotation: 30, offsetY: 0, brightness: 1.20 },
  footprint: TECH_FOOTPRINT,
  height: TECH_MODEL_TOP,
  collision: [],
  shore: [],
  calm: { inner: TECH_CLUSTER_RADIUS, outer: TECH_CLUSTER_RADIUS },
}

// ── Fireflies ─────────────────────────────────────────────────────────────────
export const FIREFLY_COUNT = 70
export const FIREFLY_COLOR = '#d8ff6a'
export const FIREFLY_SIZE = 2.2
export const FIREFLY_HEIGHT_MIN = 6
export const FIREFLY_HEIGHT_MAX = 28
export const FIREFLY_SPREAD = 1.4
export const FIREFLY_WANDER = 2.5
export const FIREFLY_BOB = 1.2
export const FIREFLY_FADE_BAND = 0.06
export const FIREFLY_PRESENCE_RATE = 1.5
export const FIREFLY_RAIN_RATE = 0.12

// ── Sanctuary glow ────────────────────────────────────────────────────────────
export const GLOW_DAY_SHARE = 0.25
export const GLOW_EMISSIVE_GAIN = 1.8

export const BASE_HALO_SPREAD = 1.55
export const BASE_HALO_FILL = 0.35
export const BASE_HALO_STRENGTH = 0.55
export const BASE_HALO_LIFT = 0.3

export const GEM_HALO_SPREAD = 1.8
export const GEM_HALO_STRENGTH = 0.5

// ── Base motes ────────────────────────────────────────────────────────────────
export const MOTES_PER_BASE = 16
export const MOTE_SIZE = 2
export const MOTE_RISE = 13
export const MOTE_LIFETIME = 4.5
export const MOTE_SWIRL = 0.9
export const MOTE_SPREAD = 0.6
export const MOTE_INNER_SHARE = 0.35
export const MOTE_STRENGTH = 1.7

// ── Gems ──────────────────────────────────────────────────────────────────────
export const GEM_SPIN_RATE = 0.4
export const GEM_TUMBLE_RATE = 0.25

export const SPARKLE_DENSITY = 0.8
export const SPARKLE_MIN_COUNT = 2
export const SPARKLE_SIZE = 2.8
export const SPARKLE_PERIOD_MIN = 2
export const SPARKLE_PERIOD_MAX = 4
export const SPARKLE_FLASH_SHARE = 0.18
export const SPARKLE_EDGE_ANGLE = 20
export const SPARKLE_LIFT = 1.05
export const SPARKLE_RAY_WIDTH = 0.14
export const SPARKLE_TINT = 0.35

// ── Contact blob ──────────────────────────────────────────────────────────────
export const TECH_BLOB: ContactBlob = {
  spread: 1.25,
  y: 0.05,
  color: '#0b3a52',
  opacity: 0.32,
}
