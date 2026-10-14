import type { RemarkKey } from '@/data/guideCopy'
import type { IslandKey } from '@/world/islands/shared/constants'
import {
  ALGAE_REMARK_GLOW,
  CIRCLE_TURN_RADIANS,
  ISLAND_REMARKS,
  NIGHTFALL_TIME,
  RAIN_CONTINUES_AFTER_SECONDS,
  SAILING_FOR_A_WHILE_SECONDS,
  SAILING_SPEED,
  STARRY_NIGHT_TIME,
  STAYING_IDLE_SECONDS,
  STOPPED_SPEED,
  SUNRISE_TIME,
  SUNSET_TIME,
  WIND_REMARK_HOLD_SECONDS,
  WIND_REMARK_TAILWIND,
} from './constants'

export type RemarkStage = 'world' | 'map' | 'none'

export interface WorldReading {
  timeOfDay: number
  isRaining: boolean
  isClearSky: boolean
  algaeGlow: number
  tailwind: number
  revealingIsland: IslandKey | null
  nearbyIsland: IslandKey | null
  isMapUnfolded: boolean
  isWorldPaused: boolean
  shipSpeed: number
  shipHeading: number
  shipPlacements: number
}

export interface MomentCounters {
  rainSeconds: number
  tailwindSeconds: number
  sailingSeconds: number
  idleSeconds: number
  turnedRadians: number
}

export const createMomentCounters = (): MomentCounters => ({
  rainSeconds: 0,
  tailwindSeconds: 0,
  sailingSeconds: 0,
  idleSeconds: 0,
  turnedRadians: 0,
})

const headingChange = (from: number, to: number) =>
  Math.atan2(Math.sin(to - from), Math.cos(to - from))

export function countMoments(
  counters: MomentCounters,
  previous: WorldReading,
  world: WorldReading,
  dt: number,
  stage: RemarkStage
): MomentCounters {
  if (world.isWorldPaused) return counters
  const isMoving = world.shipSpeed >= STOPPED_SPEED
  const isSameCourse = isMoving && world.shipPlacements === previous.shipPlacements
  return {
    rainSeconds: world.isRaining ? counters.rainSeconds + dt : 0,
    tailwindSeconds: world.tailwind >= WIND_REMARK_TAILWIND ? counters.tailwindSeconds + dt : 0,
    sailingSeconds: world.shipSpeed >= SAILING_SPEED ? counters.sailingSeconds + dt : 0,
    idleSeconds: !isMoving && stage === 'world' ? counters.idleSeconds + dt : 0,
    turnedRadians: isSameCourse
      ? counters.turnedRadians + headingChange(previous.shipHeading, world.shipHeading)
      : 0,
  }
}

export function restartCounterOf(moment: RemarkKey, counters: MomentCounters): MomentCounters {
  if (moment === 'sailingForAWhile') return { ...counters, sailingSeconds: 0 }
  if (moment === 'stayingIdle') return { ...counters, idleSeconds: 0 }
  if (moment === 'sailingInCircles') return { ...counters, turnedRadians: 0 }
  return counters
}

const hasPassed = (from: number, to: number, time: number) =>
  from <= to ? from < time && time <= to : time > from || time <= to

const hasReached = (from: number, to: number, level: number) => from < level && to >= level

export function noticeMoment(
  previous: WorldReading,
  world: WorldReading,
  before: MomentCounters,
  after: MomentCounters
): RemarkKey | null {
  const passed = (time: number) => hasPassed(previous.timeOfDay, world.timeOfDay, time)
  const island = world.revealingIsland
  const nearby = world.nearbyIsland
  if (island && island !== previous.revealingIsland) return ISLAND_REMARKS[island]
  if (world.isMapUnfolded && !previous.isMapUnfolded) return 'openedWorldMap'
  if (nearby && nearby !== previous.nearbyIsland && nearby !== island) return 'familiarIsland'
  if (passed(SUNRISE_TIME) && !world.isRaining) return 'sunrise'
  if (passed(SUNSET_TIME)) return 'sunset'
  if (passed(NIGHTFALL_TIME)) return 'nightfall'
  if (passed(STARRY_NIGHT_TIME) && world.isClearSky) return 'starryNight'
  if (world.isRaining && !previous.isRaining) return 'rainBegins'
  if (!world.isRaining && previous.isRaining) return 'rainStops'
  if (hasReached(before.rainSeconds, after.rainSeconds, RAIN_CONTINUES_AFTER_SECONDS))
    return 'rainContinues'
  if (hasReached(previous.algaeGlow, world.algaeGlow, ALGAE_REMARK_GLOW)) return 'glowingAlgae'
  if (hasReached(before.tailwindSeconds, after.tailwindSeconds, WIND_REMARK_HOLD_SECONDS))
    return 'ridingTheWind'
  if (Math.abs(after.turnedRadians) >= CIRCLE_TURN_RADIANS) return 'sailingInCircles'
  if (after.sailingSeconds >= SAILING_FOR_A_WHILE_SECONDS) return 'sailingForAWhile'
  if (after.idleSeconds >= STAYING_IDLE_SECONDS) return 'stayingIdle'
  return null
}
