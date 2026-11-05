import type { SpringConfig } from '@react-spring/web'

// ── Card motion ───────────────────────────────────────────────────────────────
export const CARD_SLIDE_PIXELS = 18
export const CARD_SPRING: SpringConfig = { tension: 320, friction: 26 }
export const CARD_CLOSE_SPRING: SpringConfig = { ...CARD_SPRING, clamp: true }
