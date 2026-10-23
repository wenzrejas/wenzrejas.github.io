import type { SchoolLayer } from './fishSchoolsModel'

// ── Population ────────────────────────────────────────────────────────────────
export const FISH_SEED = 41
export const FISH_PER_SCHOOL_MIN = 6
export const FISH_PER_SCHOOL_MAX = 11
export const SCHOOL_SPREAD: [number, number, number] = [9, 4, 6]
export const FISH_SMALLEST = 1.1
export const FISH_LARGEST = 1.8

// ── Lanes ─────────────────────────────────────────────────────────────────────
export const BACK_SCHOOLS: SchoolLayer = {
  perLevel: 2,
  nearestZ: -60,
  farthestZ: -150,
  heightOffset: 0,
  heightClearance: 0,
  heightReach: 45,
  laneSpan: 560,
}
export const FRONT_SCHOOLS: SchoolLayer = {
  perLevel: 1,
  nearestZ: 90,
  farthestZ: 60,
  heightOffset: -11,
  heightClearance: 14,
  heightReach: 24,
  laneSpan: 220,
}
export const SCHOOL_SPEED_MIN = 6
export const SCHOOL_SPEED_MAX = 11

// ── Swim ──────────────────────────────────────────────────────────────────────
export const TAIL_START = -0.1
export const TAIL_WIGGLE = 0.22
export const TAIL_WIGGLE_RATE = 9
export const TAIL_WAVE = 2.2
export const FISH_BOB = 0.15
export const FISH_BOB_RATE = 0.9

// ── Look ──────────────────────────────────────────────────────────────────────
export const FISH_BACK_COLOR = '#2d5f8f'
export const FISH_BELLY_COLOR = '#9fd6ff'
export const FISH_FIN_COLOR = '#4f8fc4'
