import type { GemHaloTuning } from '@/world/islands/shared/gem-halo/gemHaloModel'

export const SEAM_MATERIAL = 'Cube monument | restrained cyan seams'
export const RUNE_MATERIAL = 'Cube monument | pale cyan inscriptions'
export const ENAMEL_MATERIAL_MARK = 'enamel'

// ── Cube glow ─────────────────────────────────────────────────────────────────
export const CUBE_ENAMEL_GLOW = 0.55
export const CUBE_GLOW_BREATH = 0.2
export const CUBE_GLOW_BREATH_RATE = 0.7
export const CUBE_HALO: GemHaloTuning = { spread: 1.8, strength: 0.45 }
export const CUBE_HALO_COLOR = '#5fb8ff'

// ── Seam band ─────────────────────────────────────────────────────────────────
export const SEAM_BAND_PERIOD_SECONDS = 5
export const SEAM_BAND_WIDTH = 0.35
export const SEAM_BAND_GAIN = 2.2

// ── Runes ─────────────────────────────────────────────────────────────────────
export const RUNE_STEP_SECONDS = 0.9
export const RUNE_REST_STEPS = 4
export const RUNE_FLARE = 1.6
export const RUNE_FLARE_SHARPNESS = 2.5
