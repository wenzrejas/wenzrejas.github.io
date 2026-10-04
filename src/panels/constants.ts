import type { SpringConfig } from '@react-spring/web'
import { CONTACT_PAINTING_URL } from './contact/constants'
import { SUPPORT_PAINTING_URL } from './support/constants'
import { TOOL_LOGO_SPRITE_URL, TOOLKIT_PAINTING_URL } from './toolkit/constants'

// ── Sheet motion ──────────────────────────────────────────────────────────────
export const SHEET_SPRING: SpringConfig = { tension: 450, friction: 20 }
export const SHEET_CLOSE_SPRING: SpringConfig = { ...SHEET_SPRING, clamp: true }
export const SHEET_SLIDE_PIXELS = 32
export const SHEET_TILT_DEGREES = 1.5

// ── Preload ───────────────────────────────────────────────────────────────────
export const PANEL_IMAGES = [
  ...new Set([
    CONTACT_PAINTING_URL,
    SUPPORT_PAINTING_URL,
    TOOLKIT_PAINTING_URL,
    TOOL_LOGO_SPRITE_URL,
  ]),
]
