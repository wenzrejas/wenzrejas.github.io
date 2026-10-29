import { PHASES } from '@/world/environment/day-night-cycle/dayNightKeyframes'
import type { RemarkKey } from '@/data/guideCopy'
import type { IslandKey } from '@/world/islands/shared/constants'

// ── Pacing (real seconds; a remark's first time each visit skips the gap) ─────
export const REMARK_POLL_SECONDS = 0.25
export const REMARK_GAP_SECONDS = 90
export const REMARK_BREATHER_SECONDS = 12
export const REMARK_REPEAT_SECONDS = 600
export const REMARK_WAIT_SECONDS = 20
export const REMARK_SHOW_SECONDS = 8

// ── Moments ───────────────────────────────────────────────────────────────────
export const SUNRISE_TIME = PHASES.sunrise
export const SUNSET_TIME = PHASES.sunset
export const NIGHTFALL_TIME = PHASES.night
export const STARRY_NIGHT_TIME = PHASES.midnight
export const RAIN_CONTINUES_AFTER_SECONDS = 100
export const ALGAE_REMARK_GLOW = 0.5
export const WIND_REMARK_TAILWIND = 0.5
export const WIND_REMARK_HOLD_SECONDS = 1

// ── Voyage (ship speeds in world units per second) ────────────────────────────
export const SAILING_SPEED = 15
export const STOPPED_SPEED = 1
export const SAILING_FOR_A_WHILE_SECONDS = 60
export const STAYING_IDLE_SECONDS = 45
export const CIRCLE_TURN_RADIANS = Math.PI * 2

// ── World map (spoken over the open map) ──────────────────────────────────────
export const MAP_REMARKS: RemarkKey[] = ['openedWorldMap']

// ── Island reveals ────────────────────────────────────────────────────────────
export const ISLAND_REMARKS: Record<IslandKey, RemarkKey> = {
  buildshore: 'reachedBuildshore',
  tech: 'reachedTechGrove',
  timewell: 'reachedTimewell',
  lumina: 'reachedLuminaPoint',
  cozy: 'reachedCozyIsle',
}

// ── Once per visitor (remembered across visits) ───────────────────────────────
export const ONCE_EVER_REMARKS: RemarkKey[] = [
  'openedWorldMap',
  'ridingTheWind',
  'sentMessage',
  ...Object.values(ISLAND_REMARKS),
]
