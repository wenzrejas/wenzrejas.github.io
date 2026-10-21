import {
  STATION_ARRIVAL_GAP,
  STATION_DWELL_SECONDS,
  TRAIN_ACCELERATION,
  TRAIN_BRAKING,
  TRAIN_CRUISE_SPEED,
} from './constants'
import { wrapDistance, type RailRoute } from './railRoute'

export interface TrainMotion {
  distance: number
  speed: number
  travel: number
  dwellSeconds: number
}

export const createTrainMotion = (stationDistance: number): TrainMotion => ({
  distance: stationDistance,
  speed: 0,
  travel: 0,
  dwellSeconds: STATION_DWELL_SECONDS,
})

export function advanceTrain(
  motion: TrainMotion,
  route: RailRoute,
  stationDistance: number,
  dt: number
): void {
  if (motion.dwellSeconds > 0) {
    motion.dwellSeconds = Math.max(0, motion.dwellSeconds - dt)
    return
  }

  const ahead = wrapDistance(route, stationDistance - motion.distance)
  const gap = ahead > 0 ? ahead : route.length
  const brakingLimit = Math.sqrt(2 * TRAIN_BRAKING * gap)
  motion.speed = Math.min(TRAIN_CRUISE_SPEED, brakingLimit, motion.speed + TRAIN_ACCELERATION * dt)

  const step = Math.min(motion.speed * dt, gap)
  motion.distance = wrapDistance(route, motion.distance + step)
  motion.travel += step
  if (gap - step >= STATION_ARRIVAL_GAP) return

  motion.distance = stationDistance
  motion.speed = 0
  motion.dwellSeconds = STATION_DWELL_SECONDS
}
