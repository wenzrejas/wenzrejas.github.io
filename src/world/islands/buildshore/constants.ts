import { BASE_TUNING, type IslandSpec } from '../shared/islandSpec'
import { BUILDSHORE_FOOTPRINT, BUILDSHORE_MODEL_TOP, BUILDSHORE_SCREEN_TOP } from './shoreProfile'

export const BUILDSHORE_MODEL_URL = '/models/islands/buildshore_web_draco.glb'

// ── Island spec ───────────────────────────────────────────────────────────────
export const BUILDSHORE_SPEC: IslandSpec = {
  tuning: { ...BASE_TUNING, scale: 3.377, rotation: 10 },
  footprint: BUILDSHORE_FOOTPRINT,
  height: BUILDSHORE_MODEL_TOP,
  collision: [],
  shore: [],
  revealLead: -80,
  screenTop: BUILDSHORE_SCREEN_TOP,
}

// ── Lighting bake ─────────────────────────────────────────────────────────────
export const BUILDSHORE_OVERHEAD_SHADOW_STRENGTH = 1.5
export const LAMP_SPILL_STRENGTH = 1

// ── Coast ─────────────────────────────────────────────────────────────────────
export const BUILDSHORE_SHORELINE_RESOLUTION = 640
