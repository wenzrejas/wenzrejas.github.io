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

// ── Shape ─────────────────────────────────────────────────────────────────────
export const BELL_SEGMENTS = 9
export const BELL_PROFILE: [number, number][] = [
  [0, 0.85],
  [0.45, 0.78],
  [0.78, 0.55],
  [0.96, 0.24],
  [1, 0],
  [0.9, -0.1],
]
export const TENTACLE_COUNT = 6
export const TENTACLE_SEGMENTS = 8
export const TENTACLE_LENGTH = 2.6
export const TENTACLE_ROOT_WIDTH = 0.12
export const TENTACLE_TIP_WIDTH = 0.02
export const TENTACLE_RIM_REACH = 0.7

// ── Swim ──────────────────────────────────────────────────────────────────────
export const PULSE_SECONDS = 2.6
export const PULSE_SQUEEZE = 0.18
export const SWIM_STRIDE = 1.8
export const SWIM_TILT = 0.35
export const LANE_FADE = 0.15
export const DRIFT_ACROSS = 3
export const DRIFT_RATE = 0.12
export const JELLYFISH_LEAN = 0.15
export const TENTACLE_SWAY = 0.35
export const TENTACLE_SWAY_RATE = 1.3
export const TENTACLE_TRAIL = 0.35

// ── Glow ──────────────────────────────────────────────────────────────────────
export const JELLYFISH_TINTS: { color: string; share: number }[] = [
  { color: '#b07cff', share: 0.35 },
  { color: '#6fa8ff', share: 0.3 },
  { color: '#ff86d8', share: 0.2 },
  { color: '#7ff3ff', share: 0.15 },
]
export const BELL_GLOW = 0.35
export const RIM_GLOW = 1.1
export const RIM_POWER = 2
export const TENTACLE_GLOW = 0.45
export const JELLYFISH_FADE_DENSITY = 0.0035
