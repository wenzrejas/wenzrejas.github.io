import type { CartoucheShadow } from './cartoucheModel'

// ── Cartouche ─────────────────────────────────────────────────────────────────
export const CARTOUCHE_CORNER_RADIUS = 7
export const CARTOUCHE_BAND = 3
export const CARTOUCHE_LINE_INSET = 3.5
export const CARTOUCHE_SHEEN_INSET = 1
export const CARTOUCHE_SHADOWS: CartoucheShadow[] = [
  { drop: 1.5, blur: 1, opacity: 0.32 },
  { drop: 5, blur: 4, opacity: 0.22 },
]
