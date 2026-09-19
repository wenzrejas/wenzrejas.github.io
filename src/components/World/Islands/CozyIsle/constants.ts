import { WORLD_LOCATIONS } from '../constants'
import { BASE_TUNING, modelUnits, type ContactBlob, type IslandSpec } from '../islandSpec'
import { COZY_FOOTPRINT, COZY_MODEL_TOP, COZY_SHORE_PEAK, COZY_SHORE_PROFILE } from './shoreProfile'
import { SHORE_LONG_LINES } from '../../Shore/constants'

export const COZY_MODEL_URL = '/models/islands/cozy_isle_web_draco.glb'

const COZY_COLLISION_RADIUS = WORLD_LOCATIONS.cozy.radius + 25

// ── Island spec ───────────────────────────────────────────────────────────────
export const COZY_SPEC: IslandSpec = {
  tuning: { ...BASE_TUNING, rotation: -8 },
  footprint: COZY_FOOTPRINT,
  height: COZY_MODEL_TOP,
  collision: [
    {
      x: 0,
      z: 0,
      radius: modelUnits(COZY_COLLISION_RADIUS, WORLD_LOCATIONS.cozy.radius, COZY_FOOTPRINT),
    },
  ],
  shore: [{ x: 0, z: 0, radius: COZY_SHORE_PEAK, profile: COZY_SHORE_PROFILE }],
  calm: {
    inner: modelUnits(40, WORLD_LOCATIONS.cozy.radius, COZY_FOOTPRINT),
    outer: modelUnits(43, WORLD_LOCATIONS.cozy.radius, COZY_FOOTPRINT),
  },
  shoreOptions: SHORE_LONG_LINES,
}

// ── Model nodes ───────────────────────────────────────────────────────────────
export const BODY_NODE = 'CozyIsle_Static'
export const BOAT_NODE = 'Boat'
export const FIRE_NODES = ['Emissive_FireFlame', 'Emissive_FireCore']

// ── Contact blob ──────────────────────────────────────────────────────────────
export const COZY_BLOB: ContactBlob = {
  spread: 1.25,
  y: 0.05,
  color: '#0b3a52',
  opacity: 0.38,
}
