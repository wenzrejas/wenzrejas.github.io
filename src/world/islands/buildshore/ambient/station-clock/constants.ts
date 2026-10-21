import type { PhaseName } from '@/world/environment/day-night-cycle/dayNightKeyframes'

// ── Model nodes ───────────────────────────────────────────────────────────────
export const HOUR_HAND_NODE = 'CCC Clock Hour hand'
export const MINUTE_HAND_NODE = 'CCC Clock Minute hand'
export const CLOCK_DIAL_NODE = 'CCC Clock dial | warm glass'

// ── Time ──────────────────────────────────────────────────────────────────────
export const CLOCK_HOURS_AT_PHASE: Record<PhaseName, number> = {
  'pre-dawn': 4,
  'first light': 5,
  sunrise: 6,
  morning: 9,
  noon: 12,
  afternoon: 15,
  sunset: 18,
  dusk: 19,
  night: 21,
  midnight: 24,
}
