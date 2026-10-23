import { SCENE_RENDER_FRAME_PRIORITY } from '@/app/experience/constants'

// ── Frame order ───────────────────────────────────────────────────────────────
export const DIVE_STEP_FRAME_PRIORITY = -1
export const VEIL_RENDER_FRAME_PRIORITY = SCENE_RENDER_FRAME_PRIORITY + 1

// ── Dive ──────────────────────────────────────────────────────────────────────
export const DIVE_SECONDS = 3.8
export const DIVE_FOCUS_UNTIL = 0.8
export const DIVE_ZOOM = 2.6
export const DIVE_SPIN_DEGREES = 25
export const DIVE_VEIL_FROM = 0.45
export const VEIL_HOLD_SECONDS = 0.6
export const DEPTHS_WAIT_LIMIT_SECONDS = 20

// ── Arrival ───────────────────────────────────────────────────────────────────
export const VEIL_FADE_SECONDS = 0.6

// ── Surfacing ─────────────────────────────────────────────────────────────────
export const SURFACING_LIFTOFF_SECONDS = 1.6
export const SURFACING_ASCENT_DELAY_SECONDS = 0.7
export const SURFACING_SECONDS = 2.2
export const SURFACING_VEIL_FROM = 0.15
export const REWIND_VEIL_FROM = 0.65
export const EMERGE_SECONDS = 2.4
export const EMERGE_VEIL_UNTIL = 0.75
export const EMERGE_FOCUS_FROM = 0.3
export const EMERGE_ZOOM = 1.5
