import { BASE_TUNING, type IslandSpec } from '../shared/islandSpec'
import { BUILDSHORE_FOOTPRINT, BUILDSHORE_MODEL_TOP } from './shoreProfile'

export const BUILDSHORE_MODEL_URL = '/models/islands/buildshore_web_draco.glb'

// ── Island spec ───────────────────────────────────────────────────────────────
const MODEL_RADIUS = BUILDSHORE_FOOTPRINT / 2

export const BUILDSHORE_SPEC: IslandSpec = {
  tuning: { ...BASE_TUNING, scale: 3.377, rotation: 10 },
  footprint: BUILDSHORE_FOOTPRINT,
  height: BUILDSHORE_MODEL_TOP,
  collision: [],
  shore: [],
  calm: { inner: MODEL_RADIUS, outer: MODEL_RADIUS },
}

// ── Lighting bake ─────────────────────────────────────────────────────────────
export const BUILDSHORE_OVERHEAD_SHADOW_STRENGTH = 1.5
export const LAMP_SPILL_STRENGTH = 1

// ── Coast ─────────────────────────────────────────────────────────────────────
export const BUILDSHORE_SHORELINE_RESOLUTION = 640
