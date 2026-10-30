import { SCENE_RENDER_FRAME_PRIORITY } from '../constants'

// ── Frame order ───────────────────────────────────────────────────────────────
export const BLOOM_FRAME_PRIORITY = SCENE_RENDER_FRAME_PRIORITY + 0.5

// ── Bright pick-up ────────────────────────────────────────────────────────────
export const BLOOM_DUSK_THRESHOLD = 0.9
export const BLOOM_NIGHT_THRESHOLD = 0.55
export const BLOOM_SOFTNESS = 0.2

// ── Glow ──────────────────────────────────────────────────────────────────────
export const BLOOM_NIGHT_STRENGTH = 1
export const BLOOM_SPREAD = 0.8
export const BLOOM_FADE_IN_SECONDS = 1.5
export const BLOOM_FAINTEST_GLOW = 0.5 / 255
export const BLOOM_GLOW_KNEE = 0.15
export const BLOOM_GLOW_CEILING = 0.25

// ── Depths ────────────────────────────────────────────────────────────────────
export const BLOOM_DEPTHS_THRESHOLD = 0.8
export const BLOOM_DEPTHS_STRENGTH = 1

// ── Resolution ────────────────────────────────────────────────────────────────
export const BLOOM_RESOLUTION = 0.25
export const BLOOM_LEVELS = 4
