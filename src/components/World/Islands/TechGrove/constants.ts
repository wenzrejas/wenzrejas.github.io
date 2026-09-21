import { BASE_TUNING, type ContactBlob, type IslandSpec } from '../islandSpec'
import { SHORE_LONG_LINES } from '../../Shore/constants'
import {
  TECH_CLUSTER_RADIUS,
  TECH_FOOTPRINT,
  TECH_ISLETS,
  TECH_LAND_CENTER,
  TECH_MODEL_TOP,
} from './shoreProfile'

export const TECH_MODEL_URL = '/models/islands/tech_grove_web_draco.glb'

// ── Model nodes ───────────────────────────────────────────────────────────────
export const BODY_NODE = 'Sanctuary'

// ── Island spec ───────────────────────────────────────────────────────────────
const CLUSTER_COLLISION = 12.8

export const TECH_SPEC: IslandSpec = {
  tuning: { ...BASE_TUNING, scale: 3.5, rotation: 14, offsetY: -0.5, brightness: 1.25 },
  footprint: TECH_FOOTPRINT,
  height: TECH_MODEL_TOP,
  collision: [{ ...TECH_LAND_CENTER, radius: CLUSTER_COLLISION }],
  shore: TECH_ISLETS,
  calm: { inner: TECH_CLUSTER_RADIUS, outer: TECH_CLUSTER_RADIUS },
  shoreOptions: SHORE_LONG_LINES,
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

// ── Contact blob ──────────────────────────────────────────────────────────────
export const TECH_BLOB: ContactBlob = {
  spread: 1.25,
  y: 0.05,
  color: '#0b3a52',
  opacity: 0.32,
}
