import { PHASES, type PhaseName } from '@/world/environment/day-night-cycle/dayNightKeyframes'

// ── Daylight ──────────────────────────────────────────────────────────────────
export const DAY_START_TIME = PHASES.sunrise
export const DAY_END_TIME = PHASES.sunset

// ── Dial ──────────────────────────────────────────────────────────────────────
export const SUN_MARK_TIME = PHASES.noon
export const MOON_MARK_TIME = PHASES.midnight
export const DIAL_ICON_REACH = 0.5
export const DIAL_SKY: [PhaseName, string][] = [
  ['pre-dawn', '#6f7ec5'],
  ['first light', '#9d98d3'],
  ['sunrise', '#ffcaa8'],
  ['morning', '#fff0ce'],
  ['noon', '#fff5d7'],
  ['afternoon', '#ffefcc'],
  ['sunset', '#ffc49c'],
  ['dusk', '#ad9cd6'],
  ['night', '#7d8dd0'],
  ['midnight', '#6a7bc4'],
]
export const DIAL_STARS: [time: number, reach: number][] = [
  [0.72, 0.8],
  [0.77, 0.45],
  [0.82, 0.78],
  [0.92, 0.5],
  [0.96, 0.82],
  [0.04, 0.62],
]
