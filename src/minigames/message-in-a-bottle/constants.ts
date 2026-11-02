import type { GemSparkleTuning } from '@/world/islands/shared/gem-sparkles/gemSparklesModel'

// ── Reach (world units from the ship) ─────────────────────────────────────────
export const BOTTLE_REACH = 28
export const BOTTLE_SPOTTED_REACH = 130
export const BOTTLE_CHART_REACH = 300

// ── Shape (measured along the bottle, base to cork) ───────────────────────────
const ROLLED_NOTE = '#f1e8c4'
const NOTE_TIE = '#a8372c'
const CORK = '#b98a5a'

export const BOTTLE_SCALE = 0.5
export const BOTTLE_ZOOMED_OUT_BOOST_MAX = 1.6
export const BOTTLE_SEGMENTS = 8
export const BOTTLE_CENTRE = 8
export const BOTTLE_GLASS_PROFILE = [
  { radius: 0, height: 0 },
  { radius: 2.1, height: 0 },
  { radius: 2.7, height: 0.6 },
  { radius: 2.7, height: 9.4 },
  { radius: 1.15, height: 11.2 },
  { radius: 1.05, height: 14 },
  { radius: 1.35, height: 14 },
  { radius: 1.35, height: 14.6 },
  { radius: 0.95, height: 14.6 },
]
export const BOTTLE_CONTENT_BANDS = [
  { bottom: 2.2, top: 8.6, bottomRadius: 1.3, topRadius: 1.3, color: ROLLED_NOTE },
  { bottom: 5, top: 5.8, bottomRadius: 1.36, topRadius: 1.36, color: NOTE_TIE },
  { bottom: 13.4, top: 16, bottomRadius: 0.9, topRadius: 1, color: CORK },
]
export const BOTTLE_CONTENTS_ROUGHNESS = 0.6

// ── Glass ─────────────────────────────────────────────────────────────────────
export const BOTTLE_GLASS_COLOR = '#8fe3cb'
export const BOTTLE_GLASS_ROUGHNESS = 0.15
export const BOTTLE_GLASS_OPACITY = 0.22
export const BOTTLE_GLASS_RIM_OPACITY = 0.8
export const BOTTLE_GLASS_RIM_POWER = 1.6

// ── Afloat ────────────────────────────────────────────────────────────────────
export const BOTTLE_FLOAT_HEIGHT = 2.6
export const BOTTLE_TILT = 1.12
export const BOTTLE_ROCK = 0.09
export const BOTTLE_ROCK_RATE = 1.1
export const BOTTLE_BOB = 1
export const BOTTLE_BOB_RATE = 1.5
export const BOTTLE_PHASE_FROM_X = 0.37
export const BOTTLE_PHASE_FROM_Z = 0.61
export const BOTTLE_VIEW_MARGIN = 1.25

// ── Glint ─────────────────────────────────────────────────────────────────────
export const BOTTLE_GLINT_COLOR = '#fff1c9'
export const BOTTLE_GLINT_SIZE = 5
export const BOTTLE_GLINT_SPOTS = [
  { across: 1.5, height: 7, along: -1 },
  { across: -1.5, height: 5, along: 2 },
]
export const BOTTLE_GLINT_TUNING: GemSparkleTuning = {
  periodMinSeconds: 2.2,
  periodMaxSeconds: 4.2,
  flashShare: 0.2,
  lift: 1,
  rayWidth: 0.14,
  tintShare: 1,
}

// ── Note card ─────────────────────────────────────────────────────────────────
export const BOTTLE_SIGNATURE_URL = '/images/bottles/signature.webp'
