import * as THREE from 'three'
import { mix, wrapAngle } from '@/utils/math'
import { startHeadingOf, startSpotOf, type Run } from './checkpointRun'
import {
  SHIP_FADE_IN_SECONDS,
  SHIP_FADE_OUT_SECONDS,
  START_GLIDE_MAX_SECONDS,
  START_GLIDE_MIN_SECONDS,
  START_GLIDE_SPEED,
} from './constants'

const { clamp, smootherstep } = THREE.MathUtils

export interface Arrival {
  phase: 'leaving' | 'gliding' | 'landing' | 'arrived'
  seconds: number
  canGlide: boolean
  glideSeconds: number
  fromX: number
  fromZ: number
  fromHeading: number
}

interface ShipSpot {
  x: number
  z: number
  heading: number
}

export const createArrival = (canGlide: boolean): Arrival => ({
  phase: 'leaving',
  seconds: 0,
  canGlide,
  glideSeconds: 0,
  fromX: 0,
  fromZ: 0,
  fromHeading: 0,
})

export const isArriving = ({ arrival }: Run) => arrival.phase !== 'arrived'

function startGlide(arrival: Arrival, ship: ShipSpot, target: { x: number; z: number }) {
  const distance = Math.hypot(target.x - ship.x, target.z - ship.z)
  arrival.phase = 'gliding'
  arrival.seconds = 0
  arrival.fromX = ship.x
  arrival.fromZ = ship.z
  arrival.fromHeading = ship.heading
  arrival.glideSeconds = arrival.canGlide
    ? clamp(distance / START_GLIDE_SPEED, START_GLIDE_MIN_SECONDS, START_GLIDE_MAX_SECONDS)
    : 0
}

export function stepArrival({ arrival, course }: Run, ship: ShipSpot, dt: number) {
  arrival.seconds += dt
  if (arrival.phase === 'leaving' && arrival.seconds >= SHIP_FADE_OUT_SECONDS) {
    startGlide(arrival, ship, startSpotOf(course))
  } else if (arrival.phase === 'gliding' && arrival.seconds >= arrival.glideSeconds) {
    arrival.phase = 'landing'
    arrival.seconds = 0
    return 'landed'
  } else if (arrival.phase === 'landing' && arrival.seconds >= SHIP_FADE_IN_SECONDS) {
    arrival.phase = 'arrived'
  }
  return null
}

export function shipFadeOf({ arrival: { phase, seconds } }: Run) {
  if (phase === 'leaving') return 1 - Math.min(1, seconds / SHIP_FADE_OUT_SECONDS)
  if (phase === 'gliding') return 0
  if (phase === 'landing') return Math.min(1, seconds / SHIP_FADE_IN_SECONDS)
  return 1
}

export function glideSpotOf({ arrival, course }: Run): ShipSpot {
  const { fromX, fromZ, fromHeading, seconds, glideSeconds } = arrival
  const share = glideSeconds > 0 ? smootherstep(seconds / glideSeconds, 0, 1) : 1
  const { x, z } = startSpotOf(course)
  return {
    x: mix(fromX, x, share),
    z: mix(fromZ, z, share),
    heading: fromHeading + wrapAngle(startHeadingOf(course) - fromHeading) * share,
  }
}
