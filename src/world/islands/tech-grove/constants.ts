import type { GroveKey } from '@/store/panelStore'
import { BASE_TUNING, type ContactBlob, type IslandSpec } from '../shared/islandSpec'
import type { SurfTuning } from '../shared/rock-surf/surfSplash'
import { TECH_CLUSTER_RADIUS, TECH_FOOTPRINT, TECH_MODEL_TOP } from './shoreProfile'

export const TECH_MODEL_URL = '/models/islands/tech_grove_web_draco.glb'

// ── Model nodes ───────────────────────────────────────────────────────────────
export const BASE_RIM_NODES = [
  'Glow_Creative_Rim',
  'Glow_Design_Rim',
  'Glow_Frontend_Rim',
  'Glow_WebGL_Rim',
]
export const GEM_NODES = ['Gem_Design', 'Gem_Frontend', 'Gem_WebGL']
export const SPINNING_GEM_NODES = ['Gem_Frontend', 'Gem_WebGL']
export const TUMBLING_GEM_NODES = ['Gem_WebGL']
export const TERRAIN_NODES = [
  'Static_Creative',
  'Static_Design',
  'Static_Frontend',
  'Static_WebGL',
  'Static_Surrounding_Rocks',
]
export const STATUE_GROVES: Record<string, GroveKey> = {
  Statue_Creative: 'creative',
  Statue_Design: 'design',
  Statue_Frontend: 'frontend',
  Statue_WebGL: 'visuals',
}
export const PEDESTAL_LABEL_MATERIAL = 'Sanctuary_Static_VertexColors_R062_M000'

// ── Island spec ───────────────────────────────────────────────────────────────
export const TECH_SPEC: IslandSpec = {
  tuning: { ...BASE_TUNING, scale: 3.8, rotation: 30, offsetY: 0, brightness: 1.2 },
  footprint: TECH_FOOTPRINT,
  height: TECH_MODEL_TOP,
  collision: [],
  shore: [],
  calm: { inner: TECH_CLUSTER_RADIUS, outer: TECH_CLUSTER_RADIUS },
}

// ── Sanctuary glow ────────────────────────────────────────────────────────────
export const GLOW_DAY_SHARE = 0.25
export const GLOW_EMISSIVE_GAIN = 1.8

export const ORB_GLOW_DAY_SHARE = 0.5

// ── Gems ──────────────────────────────────────────────────────────────────────
export const SPARKLE_EDGE_ANGLE = 20

// ── Statues ───────────────────────────────────────────────────────────────────
export const STATUE_MARKER_HEIGHT = 0.2
export const PEDESTAL_LABEL_GLOW = 1.6
export const PEDESTAL_LABEL_DAY_SHARE = 0.1

// ── Rock surf ─────────────────────────────────────────────────────────────────
export const TECH_SURF: SurfTuning = {
  intervalMin: 0.6,
  intervalMax: 1.6,
  drops: 6,
  dropSize: 0.5,
  rise: 9,
  recoil: 2,
  foamBlobs: 3,
  foamSize: 1.2,
}

// ── Contact blob ──────────────────────────────────────────────────────────────
export const TECH_BLOB: ContactBlob = {
  spread: 1.25,
  y: 0.05,
  color: '#0b3a52',
  opacity: 0.32,
}
