import {
  ALGAE_REMARK_GLOW,
  CIRCLE_TURN_RADIANS,
  NIGHTFALL_TIME,
  RAIN_CONTINUES_AFTER_SECONDS,
  SAILING_SPEED,
  STAYING_IDLE_SECONDS,
  SUNRISE_TIME,
  WIND_REMARK_HOLD_SECONDS,
} from '@/guide/remarks/constants'
import {
  countMoments,
  createMomentCounters,
  type MomentCounters,
  type RemarkStage,
  type WorldReading,
} from '@/guide/remarks/remarkMoments'
import { BOUNDARY_RADIUS } from '@/world/environment/boundary/constants'
import {
  DAWN_ENDS_TIME,
  EDGE_OF_WORLD_MARGIN,
  NIGHT_ENDS_TIME,
  type AchievementKey,
} from './constants'

type MomentReached = (world: WorldReading, counters: MomentCounters) => boolean

interface AchievementWatch {
  previous: WorldReading | null
  lastSeconds: number
  counters: MomentCounters
}

const isSailing = (world: WorldReading) => world.shipSpeed >= SAILING_SPEED

const isDawn = (timeOfDay: number) => timeOfDay >= SUNRISE_TIME && timeOfDay < DAWN_ENDS_TIME

const isNight = (timeOfDay: number) => timeOfDay >= NIGHTFALL_TIME || timeOfDay < NIGHT_ENDS_TIME

const MOMENTS: [AchievementKey, MomentReached][] = [
  ['anchorsAweigh', isSailing],
  ['windrider', (_, counters) => counters.tailwindSeconds >= WIND_REMARK_HOLD_SECONDS],
  [
    'edgeOfTheWorld',
    (world) => Math.hypot(world.shipX, world.shipZ) >= BOUNDARY_RADIUS - EDGE_OF_WORLD_MARGIN,
  ],
  ['glowingWaters', (world) => world.algaeGlow >= ALGAE_REMARK_GLOW],
  ['weatheredTheStorm', (_, counters) => counters.rainSeconds >= RAIN_CONTINUES_AFTER_SECONDS],
  ['stargazer', (world) => world.isClearSky && isNight(world.timeOfDay) && isSailing(world)],
  ['dawnPatrol', (world) => isDawn(world.timeOfDay)],
  ['scenicRoute', (_, counters) => Math.abs(counters.turnedRadians) >= CIRCLE_TURN_RADIANS],
  ['becalmed', (_, counters) => counters.idleSeconds >= STAYING_IDLE_SECONDS],
]

export const createAchievementWatch = (seconds: number): AchievementWatch => ({
  previous: null,
  lastSeconds: seconds,
  counters: createMomentCounters(),
})

export function stepAchievementWatch(
  watch: AchievementWatch,
  world: WorldReading,
  seconds: number,
  stage: RemarkStage
): AchievementKey[] {
  const { previous, counters, lastSeconds } = watch
  watch.previous = world
  watch.lastSeconds = seconds
  if (!previous || world.isWorldPaused) return []
  watch.counters = countMoments(counters, previous, world, seconds - lastSeconds, stage)
  return MOMENTS.filter(([, isReached]) => isReached(world, watch.counters)).map(([key]) => key)
}
