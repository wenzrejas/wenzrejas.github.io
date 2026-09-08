import { WORLD_LOCATIONS } from '../constants'

export const COZY_MODEL_URL = '/models/islands/cozy_isle_web_draco.glb'

export const COZY_COLLISION_RADIUS = WORLD_LOCATIONS.cozy.radius + 25

// ── Model nodes ───────────────────────────────────────────────────────────────
export const BODY_NODE = 'CozyIsle_Static'
export const BOAT_NODE = 'Boat'
export const FIRE_NODES = ['Emissive_FireFlame', 'Emissive_FireCore']

// ── Contact blob ──────────────────────────────────────────────────────────────
export const BLOB_SPREAD = 1.25
export const BLOB_Y = 0.05
export const BLOB_COLOR = '#0b3a52'
export const BLOB_OPACITY = 0.38
