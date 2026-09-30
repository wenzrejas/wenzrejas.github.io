import { SOCIAL_LINKS } from '../../../../data/socialLinks'
import { BASE_TUNING, type ContactBlob, type IslandSpec } from '../islandSpec'
import type { GroundGlowTuning } from '../GroundGlow/glowSites'
import { LUMINA_FOOTPRINT, LUMINA_MAIN_SHORE_RADIUS, LUMINA_MODEL_TOP } from './shoreProfile'

export const LUMINA_MODEL_URL = '/models/islands/lumina_point_web_draco.glb'

// ── Island spec ───────────────────────────────────────────────────────────────
export const LUMINA_SPEC: IslandSpec = {
  tuning: { ...BASE_TUNING, scale: 2.5, rotation: 45, offsetY: 0.5, brightness: 1.3 },
  footprint: LUMINA_FOOTPRINT,
  height: LUMINA_MODEL_TOP,
  collision: [],
  shore: [],
  calm: { inner: LUMINA_MAIN_SHORE_RADIUS, outer: LUMINA_MAIN_SHORE_RADIUS },
}

// ── Lighthouse beam ───────────────────────────────────────────────────────────
export const BEAM_ANCHOR_NODE = 'Anchor_BeaconCone'
export const BEAM_ANCHOR_FORWARD = [0, -1, 0] as const
export const BEAM_HEAD_NODE = 'Lighthouse_Lantern_Rotor'
export const BEAM_LENS_NODE = 'Glow_BeaconLens'
export const BEAM_LENGTH = 21
export const BEAM_SPREAD_DEG = 16
export const BEAM_TILT_DEG = 6
export const BEAM_SPEED = 0.35
export const BEAM_STRENGTH = 0.4
export const BEAM_COLOR = '#f4f0e2'
export const BEAM_SUN_ON = 0.4
export const BEAM_SUN_FULL = 0.05

// ── Lights ────────────────────────────────────────────────────────────────────
export const LIGHT_COLOR = '#ffd27a'
export const SUMMIT_RING_NODE = 'Glow_SummitRing'
export const LIGHT_NODES = ['Glow_TowerWindows', 'Glow_BeaconLens', SUMMIT_RING_NODE]

// ── Monoliths ─────────────────────────────────────────────────────────────────
export const MONOLITH_NAMES = ['Document', 'Email', 'GitHub', 'LinkedIn'] as const
export type MonolithName = (typeof MONOLITH_NAMES)[number]

export const MONOLITH_LINKS: Record<MonolithName, string> = {
  Document: SOCIAL_LINKS.resume,
  Email: SOCIAL_LINKS.email,
  GitHub: SOCIAL_LINKS.github,
  LinkedIn: SOCIAL_LINKS.linkedin,
}

// ── Hologram ──────────────────────────────────────────────────────────────────
export const HOLOGRAM_SCAN_DENSITY = 0.75
export const HOLOGRAM_SCAN_SPEED = 0.8
export const HOLOGRAM_RENDER_ORDER = 5

export const PROJECTOR_DAY_SHARE = 0.4

export const INLET_GLOW: GroundGlowTuning = {
  haloSpread: 2.4,
  haloFill: 0.9,
  haloStrength: 0.8,
  haloLift: 0.15,
  motesPerSite: 14,
  moteSize: 1.6,
  moteRise: 13,
  moteLifetime: 3.2,
  moteSwirl: 1.2,
  moteSpread: 2.4,
  moteInnerShare: 0.2,
  moteStrength: 1.6,
}

export const PROJECTION_FLARE = 1
export const PROJECTION_SEGMENTS = 24
export const PROJECTION_STRENGTH = 0.3
export const PROJECTION_SCAN_DEPTH = 0.45

// ── Logos ─────────────────────────────────────────────────────────────────────
export const LOGO_DAY_SHARE = 0.9
export const LOGO_BODY_OPACITY = 0.8
export const LOGO_EDGE_OPACITY = 1
export const LOGO_SCAN_DEPTH = 0.3
export const LOGO_RIM_GAIN = 0.6
export const LOGO_RIM_POWER = 2
export const LOGO_FLICKER_RATE = 14
export const LOGO_FLICKER_CHANCE = 0.06
export const LOGO_FLICKER_DEPTH = 0.55

export const LOGO_SPIN_RATE_MIN = 0.25
export const LOGO_SPIN_RATE_MAX = 0.8
export const LOGO_SWAY = 0.5
export const LOGO_SWAY_RATE = 0.7
export const LOGO_BOB_HEIGHT = 0.1
export const LOGO_BOB_RATE_MIN = 0.9
export const LOGO_BOB_RATE_MAX = 1.8

// ── Hover ─────────────────────────────────────────────────────────────────────
export const HIT_AREA_WIDTH = 1.4
export const HOVER_EASE_RATE = 6
export const HOVER_SNAP_GAP = 0.001
export const HOVER_GLOW_GAIN = 2.2
export const LOGO_HOVER_RISE = 0.35

// ── Main island ───────────────────────────────────────────────────────────────
export const MAIN_ISLAND_NODE = 'MainIsland'
export const MAIN_ISLAND_BODY_NODE = 'Static_MainIsland'
export const LIGHTHOUSE_NODE = 'Lighthouse_Root'
export const BODY_HIT_SPREAD = 0.75
export const HIGHLIGHT_DAY_SHARE = 0.7

export const SUMMIT_GLOW: GroundGlowTuning = {
  haloSpread: 1.8,
  haloFill: 0,
  haloStrength: 0.5,
  haloLift: 0.1,
  motesPerSite: 40,
  moteSize: 1.8,
  moteRise: 22,
  moteLifetime: 3.4,
  moteSwirl: 1.4,
  moteSpread: 0.9,
  moteInnerShare: 0.9,
  moteStrength: 1.3,
}

export const RISING_GLOW_HEIGHT = 1.8
export const RISING_GLOW_SPREAD = 1.03
export const RISING_GLOW_SEGMENTS = 48
export const RISING_GLOW_STRENGTH = 0.4
export const RISING_GLOW_FALLOFF = 1.8
export const RISING_GLOW_FLOW_DENSITY = 3
export const RISING_GLOW_FLOW_SPEED = 0.35
export const RISING_GLOW_FLOW_DEPTH = 0.4

// ── Contact blob ──────────────────────────────────────────────────────────────
export const LUMINA_BLOB: ContactBlob = {
  spread: 1.25,
  y: 0.05,
  color: '#f4f0e2',
  opacity: 0.2,
}
