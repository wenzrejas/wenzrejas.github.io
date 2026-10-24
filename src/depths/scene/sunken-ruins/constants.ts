import type { RuinPlacement } from './ruinLayout'

export const SUNKEN_RUINS_URL = '/models/sunken-ruins/sunken_ruins_web_draco.glb'
export const RUIN_BRIGHTNESS = 1.1
export const RUIN_STONE_MATERIAL = 'Ruins_Static'

// ── Placement ─────────────────────────────────────────────────────────────────
export const RUIN_PLACEMENTS: RuinPlacement[] = [
  { offsetX: -8, offsetY: -6.5, offsetZ: -3, tilt: 18, turn: 35, lean: -5, scale: 8.5 },
  { offsetX: 16, offsetY: -4.5, offsetZ: -18, tilt: 18, turn: -35, lean: 5, scale: 8.5 },
  { offsetX: -8, offsetY: 3, offsetZ: -7.5, tilt: 18, turn: 35, lean: -5, scale: 8.5 },
  { offsetX: 8, offsetY: 2, offsetZ: 9, tilt: 18, turn: -35, lean: 5, scale: 8.5 },
  { offsetX: -8, offsetY: -5.5, offsetZ: 9, tilt: 18, turn: 35, lean: -5, scale: 8.5 },
  { offsetX: 0, offsetY: -30, offsetZ: 0, tilt: 14, turn: 0, lean: 0, scale: 10 },
]

// ── Floating ──────────────────────────────────────────────────────────────────
export const RUIN_PHASE_STEP = 2.4
export const RUIN_BOB_HEIGHT = 1.6
export const RUIN_BOB_RATE = 0.55
export const RUIN_SWAY_DEGREES = 1.5
export const RUIN_SWAY_RATE = 0.33
export const RUIN_TILT_SWAY_SHARE = 0.6
export const RUIN_DRIFT_TURN_DEGREES = 3
export const RUIN_DRIFT_TURN_RATE = 0.12

// ── Clock ruin ────────────────────────────────────────────────────────────────
export const LANDING_ANCHOR_ROLE = 'landing_anchor'

// ── Lighting bake ─────────────────────────────────────────────────────────────
export const RUIN_OVERHEAD_SHADE = 1
export const RUIN_LANTERN_SPILL = 1

// ── Armillary ─────────────────────────────────────────────────────────────────
export const ARMILLARY_TURN_RATE = 0.35

// ── Floating gems ─────────────────────────────────────────────────────────────
export const GEM_SPIN_RATE = 0.5
export const GEM_BOB_HEIGHT = 0.08
export const GEM_BOB_RATE = 1.1
