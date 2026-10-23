import type { DriftTuning } from '../shared/particleDrift'

// ── Dust ──────────────────────────────────────────────────────────────────────
export const BOOK_DUST_ORIGIN: [number, number, number] = [0, 1.6, 0.04]
export const BOOK_DUST: DriftTuning = {
  count: 36,
  radiusMin: 0.1,
  radiusMax: 1.1,
  height: 2.2,
  rise: 0.18,
  orbit: 0.12,
  sway: 0.08,
  size: 0.4,
  strength: 0.8,
  color: '#ffd27a',
}

// ── Page glow ─────────────────────────────────────────────────────────────────
export const PAGE_GLOW_CENTER: [number, number, number] = [0, 1.95, 0.85]
export const PAGE_GLOW_WIDTH = 3.2
export const PAGE_GLOW_HEIGHT = 1.5
export const PAGE_GLOW_COLOR = '#ffd99a'
export const PAGE_GLOW_STRENGTH = 0.22
export const PAGE_GLOW_PULSE = 0.3
export const PAGE_GLOW_PULSE_RATE = 0.9
