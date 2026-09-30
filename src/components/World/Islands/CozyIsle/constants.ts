import { WORLD_LOCATIONS } from '../constants'
import { BASE_TUNING, modelUnits, type ContactBlob, type IslandSpec } from '../islandSpec'
import { COZY_FOOTPRINT, COZY_MODEL_TOP } from './shoreProfile'

export const COZY_MODEL_URL = '/models/islands/cozy_isle_web_draco.glb'

// ── Island spec ───────────────────────────────────────────────────────────────
export const COZY_SPEC: IslandSpec = {
  tuning: { ...BASE_TUNING, scale: 1.05, rotation: 85, offsetY: 0.5, brightness: 1.15 },
  footprint: COZY_FOOTPRINT,
  height: COZY_MODEL_TOP,
  collision: [],
  shore: [],
  calm: {
    inner: modelUnits(40, WORLD_LOCATIONS.cozy.radius, COZY_FOOTPRINT),
    outer: modelUnits(43, WORLD_LOCATIONS.cozy.radius, COZY_FOOTPRINT),
  },
}

// ── Model nodes ───────────────────────────────────────────────────────────────
export const BOAT_NODE = 'Boat'
export const FIRE_ANCHOR_NODE = 'Campfire_FireAnchor'

// ── Campfire ──────────────────────────────────────────────────────────────────
export const FIRE_WIDTH = 0.456
export const FIRE_HEIGHT = 0.518

// ── Chimney smoke ─────────────────────────────────────────────────────────────
export const SMOKE_PUFF_COUNT = 16
export const SMOKE_LIFETIME = 7
export const SMOKE_PUFF_SIZE = 0.3
export const SMOKE_PUFF_SIZE_VARIANCE = 0.2
export const SMOKE_PUFF_GROWTH = 3.2
export const SMOKE_RISE = 2.6
export const SMOKE_SPREAD = 0.35
export const SMOKE_SWAY = 0.12
export const SMOKE_DRIFT = 0.9
export const SMOKE_OPACITY = 0.75
export const SMOKE_SHADE = 0.9
export const SMOKE_COLOR = '#fbfaf8'
export const SMOKE_LIGHT_TINT = 0.5
export const SMOKE_FADE_CYCLES = 0.04
export const SMOKE_PRESENCE_RATE = 1.5
export const SMOKE_RAIN_RATE = 0.3

// ── Contact blob ──────────────────────────────────────────────────────────────
export const COZY_BLOB: ContactBlob = {
  spread: 1.25,
  y: 0.05,
  color: '#0b3a52',
  opacity: 0.38,
}
