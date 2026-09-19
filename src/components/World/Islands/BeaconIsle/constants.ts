import { BASE_TUNING, type ContactBlob, type IslandSpec } from '../islandSpec'
import { SHORE_LONG_LINES } from '../../Shore/constants'
import {
  BEACON_FOOTPRINT,
  BEACON_LAND_CENTER,
  BEACON_MODEL_TOP,
  BEACON_MONOLITHS,
  BEACON_MONOLITH_RADIUS,
  BEACON_ROCKS,
  BEACON_SHORE_PEAK,
  BEACON_SHORE_PROFILE,
} from './shoreProfile'

export const BEACON_MODEL_URL = '/models/islands/beacon_web_draco.glb'

// ── Model nodes ───────────────────────────────────────────────────────────────
export const BODY_NODE = 'Beacon_Static'

// ── Island spec ───────────────────────────────────────────────────────────────
const MAIN_COLLISION = 13.0
const MONOLITH_COLLISION = 3.2

const ROCK_RIPPLE_MIN = 0.6

const MAIN_SHORE = { reach: 16 }
const MONOLITH_SHORE = {
  rim: 0,
  reach: 4.4,
  segments: 5,
  dashMin: 0.2,
  dashMax: 0.38,
  width: 0.65,
}
const ROCK_SHORE = { rim: 0, reach: 4, segments: 6 }

export const BEACON_SPEC: IslandSpec = {
  tuning: { ...BASE_TUNING, scale: 3.3, rotation: -80, offsetY: 3.2, brightness: 1.5 },
  footprint: BEACON_FOOTPRINT,
  height: BEACON_MODEL_TOP,
  collision: [
    { ...BEACON_LAND_CENTER, radius: MAIN_COLLISION },
    ...BEACON_MONOLITHS.map(({ x, z }) => ({ x, z, radius: MONOLITH_COLLISION })),
  ],
  shore: [
    {
      ...BEACON_LAND_CENTER,
      radius: BEACON_SHORE_PEAK,
      profile: BEACON_SHORE_PROFILE,
      options: MAIN_SHORE,
    },
    ...BEACON_MONOLITHS.map(({ x, z }) => ({
      x,
      z,
      radius: BEACON_MONOLITH_RADIUS,
      options: MONOLITH_SHORE,
    })),
    ...BEACON_ROCKS.filter((r) => r.radius >= ROCK_RIPPLE_MIN).map((r) => ({
      ...r,
      options: ROCK_SHORE,
    })),
  ],
  calm: { inner: 8.0, outer: 10.7 },
  shoreOptions: SHORE_LONG_LINES,
}

// ── Lighthouse beam ───────────────────────────────────────────────────────────
export const BEAM_ANCHOR_NODE = 'Beam_Anchor_Lantern'
export const BEAM_HEAD_NODE = 'Beacon_Head'
export const BEAM_HALO_NODE = 'Head_Halo'
export const BEAM_LENGTH = 55
export const BEAM_SPREAD_DEG = 16
export const BEAM_YAW_DEG = 22.5
export const BEAM_TILT_DEG = 6
export const BEAM_SPEED = 0.35
export const BEAM_STRENGTH = 0.4
export const BEAM_COLOR = '#f4f0e2'
export const BEAM_SUN_ON = 0.4
export const BEAM_SUN_FULL = 0.05

// ── Contact blob ──────────────────────────────────────────────────────────────
export const BEACON_BLOB: ContactBlob = {
  spread: 1.25,
  y: 0.05,
  color: '#f4f0e2',
  opacity: 0.2,
}
