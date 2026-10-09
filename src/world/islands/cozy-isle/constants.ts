import { WORLD_LOCATIONS } from '../shared/constants'
import { BASE_TUNING, modelUnits, type ContactBlob, type IslandSpec } from '../shared/islandSpec'
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
export const CAFE_NODE = 'Cafe'
export const DOCK_NODE = 'Dock'
export const FIRE_ANCHOR_NODE = 'Campfire_FireAnchor'
export const TERRAIN_NODE = 'Terrain'
export const BULB_NODES = ['Glow_StringLights', 'Glow_Cafe_Pendants']
export const NEON_NODES = ['Glow_Cafe_Sign', 'Glow_Cafe_Heart']

// ── Cafe ──────────────────────────────────────────────────────────────────────
export const COUNTER_MARKER_SPOT = [0, 1.3, 1.62] as const
export const NOTE_SPOT = [1.0, 3.5, 1.8] as const

// ── Cafe break ────────────────────────────────────────────────────────────────
export const CAFE_BREAK_RELEASE_SECONDS = 0.5
export const FLARE_RISE_SECONDS = 0.35

// ── Cafe lights ───────────────────────────────────────────────────────────────
export const BULB_WAVE_STEP_SECONDS = 0.09
export const BULB_EMISSION_BOOST = 1.5

export const NEON_FLICKER_DELAY_SECONDS = 0.9
export const NEON_FLICKER_SECONDS = 0.45
export const NEON_FLICKER_RATE = 18
export const NEON_FLICKER_DIM = 0.15

// ── Contact blob ──────────────────────────────────────────────────────────────
export const COZY_BLOB: ContactBlob = {
  spread: 1.25,
  y: 0.05,
  color: '#0b3a52',
  opacity: 0.38,
}
