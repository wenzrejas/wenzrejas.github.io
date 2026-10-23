import * as THREE from 'three'
import { SURFACING_LIFTOFF_SECONDS } from '@/depths/dive/constants'
import { clockLandingSpot, ruinRotation, type RuinPlacement } from '../sunken-ruins/ruinLayout'
import type { Surfacing } from '../surfacing/surfacing'
import { DEEPEST_LEVEL, hasReachedBottom, type Timeline } from '../timeline/timeline'
import {
  DEPTHS_SHIP_HEADING_DEGREES,
  DRIFT_FADE_LEVELS,
  LANDED_CALM,
  LANDED_SHARE,
  LANDING_SECONDS,
  PLUNGE_DROP,
  PLUNGE_PITCH_DEGREES,
  PLUNGE_ROLL_DEGREES,
  PLUNGE_SPRING_DAMPING,
  PLUNGE_SPRING_RATE,
  SHIP_BOB_HEIGHT,
  SHIP_BOB_RATE,
  SHIP_DRIFT_ACROSS,
  SHIP_DRIFT_RATE,
  SHIP_LIFTOFF_HEIGHT,
  SHIP_LIFTOFF_PITCH_DEGREES,
  SHIP_ROCK_DEGREES,
  SHIP_ROCK_RATE,
  SHIP_ROLL_DEGREES,
  SHIP_ROLL_RATE,
  SHIP_TILT_DEGREES_PER_LEVEL_SPEED,
  SHIP_TILT_EASE_RATE,
  SHIP_TILT_MAX_DEGREES,
  SHIP_YAW_DEGREES,
  SHIP_YAW_RATE,
} from './constants'

export interface ShipMotion {
  spot: THREE.Vector3
  keelDepth: number
  scrollTilt: number
  driftShare: number
  landingProgress: number
  landing: number
  landingSpot: THREE.Vector3
  landingTurn: THREE.Quaternion
  liftoff: number
}

const { clamp, damp, degToRad, smootherstep } = THREE.MathUtils

const HEADING = degToRad(DEPTHS_SHIP_HEADING_DEGREES)
const LIFTOFF_PITCH = degToRad(SHIP_LIFTOFF_PITCH_DEGREES)
const PLUNGE_PITCH = degToRad(PLUNGE_PITCH_DEGREES)
const PLUNGE_ROLL = degToRad(PLUNGE_ROLL_DEGREES)
const ROLL = degToRad(SHIP_ROLL_DEGREES)
const ROCK = degToRad(SHIP_ROCK_DEGREES)
const YAW = degToRad(SHIP_YAW_DEGREES)
const TILT_PER_LEVEL_SPEED = degToRad(SHIP_TILT_DEGREES_PER_LEVEL_SPEED)
const TILT_MAX = degToRad(SHIP_TILT_MAX_DEGREES)
const UNTURNED = new THREE.Quaternion()
const SPRING_DECAY = PLUNGE_SPRING_RATE * PLUNGE_SPRING_DAMPING
const SPRING_SWING_RATE = PLUNGE_SPRING_RATE * Math.sqrt(1 - PLUNGE_SPRING_DAMPING ** 2)

const _hover = new THREE.Vector3()
const _clockRotation = new THREE.Euler()
const _landedTurn = new THREE.Quaternion()

export const createShipMotion = (spot: THREE.Vector3, keelDepth: number): ShipMotion => ({
  spot,
  keelDepth,
  scrollTilt: 0,
  driftShare: 1,
  landingProgress: 0,
  landing: 0,
  landingSpot: new THREE.Vector3(),
  landingTurn: new THREE.Quaternion(),
  liftoff: 0,
})

export function stepShipMotion(
  motion: ShipMotion,
  timeline: Timeline,
  surfacing: Surfacing,
  dt: number
) {
  const tilt = clamp(timeline.levelsPerSecond * TILT_PER_LEVEL_SPEED, -TILT_MAX, TILT_MAX)
  motion.scrollTilt = damp(motion.scrollTilt, tilt, SHIP_TILT_EASE_RATE, dt)
  motion.driftShare =
    1 - smootherstep(timeline.viewedLevel, DEEPEST_LEVEL - DRIFT_FADE_LEVELS, DEEPEST_LEVEL)
  motion.liftoff = smootherstep(surfacing.seconds, 0, SURFACING_LIFTOFF_SECONDS)
  const isLanding = !surfacing.isUnderway && hasReachedBottom(timeline)
  const landingStep = dt / LANDING_SECONDS
  motion.landingProgress = clamp(
    motion.landingProgress + (isLanding ? landingStep : -landingStep),
    0,
    1
  )
  motion.landing = smootherstep(motion.landingProgress, 0, 1)
}

export function followClockRuin(motion: ShipMotion, clockRuin: RuinPlacement, time: number) {
  clockLandingSpot(clockRuin, motion.keelDepth, time, motion.landingSpot)
  motion.landingTurn.setFromEuler(ruinRotation(clockRuin, _clockRotation))
}

function plungeSpring(plungeSeconds: number) {
  const swing =
    Math.cos(SPRING_SWING_RATE * plungeSeconds) +
    (SPRING_DECAY / SPRING_SWING_RATE) * Math.sin(SPRING_SWING_RATE * plungeSeconds)
  return Math.exp(-SPRING_DECAY * plungeSeconds) * swing
}

export const isShipLanded = ({ landing }: ShipMotion) => landing >= LANDED_SHARE

export function poseShip(
  ship: THREE.Object3D,
  motion: ShipMotion,
  focus: THREE.Vector3,
  plungeSeconds: number,
  time: number
) {
  const fall = plungeSpring(plungeSeconds)
  const { liftoff } = motion
  const calm = 1 - motion.landing * LANDED_CALM
  _hover.set(
    focus.x + Math.sin(time * SHIP_DRIFT_RATE) * SHIP_DRIFT_ACROSS * calm * motion.driftShare,
    focus.y +
      PLUNGE_DROP * fall +
      SHIP_LIFTOFF_HEIGHT * liftoff +
      Math.sin(time * SHIP_BOB_RATE) * SHIP_BOB_HEIGHT * calm,
    focus.z
  )
  motion.spot.lerpVectors(_hover, motion.landingSpot, motion.landing)
  ship.position.copy(motion.spot)
  const sway = Math.sin(time * SHIP_ROCK_RATE) * ROCK * calm
  const pitch =
    sway - motion.scrollTilt * (1 - motion.landing) - PLUNGE_PITCH * fall + LIFTOFF_PITCH * liftoff
  const roll = Math.sin(time * SHIP_ROLL_RATE) * ROLL * calm + PLUNGE_ROLL * fall
  const yaw = HEADING + Math.sin(time * SHIP_YAW_RATE) * YAW * calm
  ship.rotation.set(pitch, yaw, roll, 'YXZ')
  _landedTurn.slerpQuaternions(UNTURNED, motion.landingTurn, motion.landing)
  ship.quaternion.premultiply(_landedTurn)
}
