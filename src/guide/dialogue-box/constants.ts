import type { SpringConfig } from '@react-spring/web'

// ── Box motion ────────────────────────────────────────────────────────────────
export const BOX_SPRING: SpringConfig = { tension: 420, friction: 24 }
export const BOX_CLOSE_SPRING: SpringConfig = { ...BOX_SPRING, clamp: true }
export const HIDDEN_BOX_SCALE = 0.9

// ── Paper (outline units; rows below the stretch line slide down as the box grows)
export const PAPER_WIDTH = 680
export const PAPER_MIN_HEIGHT = 360
export const PAPER_STRETCH_FROM = 80

// ── Key boxes (one arrow drawn pointing up, turned clockwise in degrees) ──────
export const ARROW_KEY_TURNS: Partial<Record<string, number>> = {
  '↑': 0,
  '→': 90,
  '↓': 180,
  '←': 270,
}
