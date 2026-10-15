import type { SpringConfig } from '@react-spring/web'

// ── Sheet motion ──────────────────────────────────────────────────────────────
export const SHEET_SPRING: SpringConfig = { tension: 450, friction: 20 }
export const SHEET_CLOSE_SPRING: SpringConfig = { ...SHEET_SPRING, clamp: true }
export const SHEET_SLIDE_PIXELS = 32
export const SHEET_TILT_DEGREES = 1.5
