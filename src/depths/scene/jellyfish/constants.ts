import type { SwarmLayer } from './jellyfishModel'

// ── Population ────────────────────────────────────────────────────────────────
export const JELLYFISH_SEED = 31
export const BACK_SWARM: SwarmLayer = {
  perLevel: 3,
  side: 'any',
  innerAcross: 0,
  outerAcross: 170,
  nearestZ: -70,
  farthestZ: -170,
  heightOffset: 0,
  heightSpread: 90,
  smallest: 2.5,
  largest: 5,
  laneSpan: 170,
  includesClock: true,
}
export const NEAR_SWARM: SwarmLayer = {
  perLevel: 1,
  side: 'open',
  innerAcross: 42,
  outerAcross: 95,
  nearestZ: 15,
  farthestZ: -15,
  heightOffset: 0,
  heightSpread: 90,
  smallest: 2.5,
  largest: 5,
  laneSpan: 140,
  includesClock: false,
}
export const FRONT_SWARM: SwarmLayer = {
  perLevel: 1,
  side: 'open',
  innerAcross: 24,
  outerAcross: 44,
  nearestZ: 100,
  farthestZ: 75,
  heightOffset: -10,
  heightSpread: 34,
  smallest: 1.6,
  largest: 2.6,
  laneSpan: 80,
  includesClock: true,
}

// ── Swim ──────────────────────────────────────────────────────────────────────
export const SWIM_STRIDE = 1.8
export const SWIM_TILT = 0.35
export const LANE_FADE = 0.15
export const DRIFT_ACROSS = 3
export const DRIFT_RATE = 0.12

// ── Glow ──────────────────────────────────────────────────────────────────────
export const JELLYFISH_TINTS: { color: string; share: number }[] = [
  { color: '#b07cff', share: 0.35 },
  { color: '#6fa8ff', share: 0.3 },
  { color: '#ff86d8', share: 0.2 },
  { color: '#7ff3ff', share: 0.15 },
]
export const JELLYFISH_FADE_DENSITY = 0.0035
