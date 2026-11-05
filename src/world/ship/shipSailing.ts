import * as THREE from 'three'
import type { Keys } from '@/hooks/useKeyboardInput'
import { sailingInput } from '@/controls/sailingInput'
import { COURSE_WINDS, surgeBoostOf, type Run } from '@/minigames/checkpoint-run/checkpointRun'
import { RACE_WIND_STRENGTH } from '@/minigames/checkpoint-run/constants'
import { glideSpotOf } from '@/minigames/checkpoint-run/raceArrival'
import { useCheckpointStore } from '@/store/checkpointStore'
import { useCoastStore } from '@/store/coastStore'
import { useDebugStore } from '@/store/debugStore'
import { useRevealStore } from '@/store/revealStore'
import { sailingPace } from '@/store/settingsStore'
import { useShipStore, type ShipState } from '@/store/shipStore'
import { useWeatherStore } from '@/store/weatherStore'
import { useWindStore } from '@/store/windStore'
import { mix } from '@/utils/math'
import { FALLBACK_FRAME_SECONDS, MAX_FRAME_SECONDS } from '@/utils/time'
import { BOUNDARY_RADIUS } from '../environment/boundary/constants'
import { REVEAL_SPEED } from '../islands/shared/constants'
import { ISLAND_KEYS, ISLAND_SPECS } from '../islands/shared/islandSpecs'
import { createIslandTransform, islandTransform, toWorld } from '../islands/shared/islandTransform'
import {
  INITIAL_HEADING,
  SURGE_SHOW_RATE,
  TAILWIND_ALIGN_FULL,
  TAILWIND_ALIGN_START,
  TAILWIND_RATE,
  VELOCITY_RESPONSE_RATE,
  WHIRLPOOL_LEAN_RATE,
  WIND_ASSIST,
  WIND_ASSIST_CAP,
} from './constants'
import { keepHullOffCoasts } from './hullCollision'
import { shipBobHeight } from './shipBob'
import { whirlpoolCurrent, whirlpoolLean } from './whirlpoolDrift'

export interface ShipSailing {
  heading: number
  tilt: number
  steering: number
  tailwind: number
  surgeShow: number
  sailFill: number
  lean: THREE.Vector2
  velocityX: number
  velocityZ: number
}

const BLOCKING_ISLANDS = ISLAND_KEYS.filter((key) => ISLAND_SPECS[key].collision.length > 0)

const _transform = createIslandTransform()
const _circleCentre = new THREE.Vector2()
const _current = new THREE.Vector2()
const _leanTarget = new THREE.Vector2()

export const createShipSailing = (): ShipSailing => ({
  heading: INITIAL_HEADING,
  tilt: 0,
  steering: 0,
  tailwind: 0,
  surgeShow: 0,
  sailFill: 0,
  lean: new THREE.Vector2(),
  velocityX: 0,
  velocityZ: 0,
})

export function restartSailingAt(sailing: ShipSailing, group: THREE.Group, ship: ShipState) {
  group.position.x = ship.x
  group.position.z = ship.z
  sailing.heading = ship.heading - Math.PI
  sailing.velocityX = 0
  sailing.velocityZ = 0
  sailing.tilt = 0
  sailing.tailwind = 0
  sailing.lean.set(0, 0)
}

const safeFrameSeconds = (delta: number) =>
  isFinite(delta) && delta >= 0 ? Math.min(delta, MAX_FRAME_SECONDS) : FALLBACK_FRAME_SECONDS

function steerVelocity(
  sailing: ShipSailing,
  throttle: number,
  forwardX: number,
  forwardZ: number,
  alignment: number,
  moveSpeed: number,
  windStrength: number,
  dt: number
) {
  let targetX = 0
  let targetZ = 0
  if (throttle !== 0) {
    const windBoost =
      1 + Math.max(0, alignment) * WIND_ASSIST * Math.min(windStrength, WIND_ASSIST_CAP)
    const speed = moveSpeed * mix(1, REVEAL_SPEED, useRevealStore.getState().blend)
    targetX = forwardX * speed * windBoost * throttle
    targetZ = forwardZ * speed * windBoost * throttle
  }
  const response = Math.min(1, VELOCITY_RESPONSE_RATE * dt)
  sailing.velocityX += (targetX - sailing.velocityX) * response
  sailing.velocityZ += (targetZ - sailing.velocityZ) * response
}

function driftAlong(sailing: ShipSailing, position: THREE.Vector3, dt: number) {
  whirlpoolCurrent(position.x, position.z, _current)
  position.x += (sailing.velocityX + _current.x) * dt
  position.z += (sailing.velocityZ + _current.y) * dt
}

function fillSail(
  sailing: ShipSailing,
  forwardX: number,
  forwardZ: number,
  alignment: number,
  moveSpeed: number,
  surgeBoost: number,
  dt: number
) {
  const forwardSpeed = sailing.velocityX * forwardX + sailing.velocityZ * forwardZ
  const forwardShare = THREE.MathUtils.clamp(forwardSpeed / Math.max(moveSpeed, 1), 0, 1)
  const tailwindTarget =
    THREE.MathUtils.smoothstep(alignment, TAILWIND_ALIGN_START, TAILWIND_ALIGN_FULL) * forwardShare
  sailing.tailwind += (tailwindTarget - sailing.tailwind) * Math.min(1, TAILWIND_RATE * dt)
  const surgeTarget = surgeBoost > 0 ? 1 : 0
  sailing.surgeShow += (surgeTarget - sailing.surgeShow) * Math.min(1, SURGE_SHOW_RATE * dt)
  sailing.sailFill = Math.max(sailing.tailwind, sailing.surgeShow)
}

function keepInsideBoundary(position: THREE.Vector3) {
  const distance = Math.sqrt(position.x ** 2 + position.z ** 2)
  if (distance <= BOUNDARY_RADIUS) return
  const scale = BOUNDARY_RADIUS / distance
  position.x *= scale
  position.z *= scale
}

function pushOffIslands(position: THREE.Vector3) {
  const tuning = useDebugStore.getState().islands
  for (const key of BLOCKING_ISLANDS) {
    islandTransform(key, tuning[key], _transform)

    for (const circle of ISLAND_SPECS[key].collision) {
      toWorld(_transform, circle.x, circle.z, _circleCentre)
      const radius = circle.radius * _transform.scale

      const offsetX = position.x - _circleCentre.x
      const offsetZ = position.z - _circleCentre.y
      const distance = Math.sqrt(offsetX * offsetX + offsetZ * offsetZ)
      if (distance > 0 && distance < radius) {
        const push = radius / distance
        position.x = _circleCentre.x + offsetX * push
        position.z = _circleCentre.y + offsetZ * push
      }
    }
  }
}

function followRaceGlide(sailing: ShipSailing, position: THREE.Vector3, run: Run | null) {
  if (run?.arrival.phase !== 'gliding') return
  if (run.placements !== useShipStore.getState().placements) return
  const spot = glideSpotOf(run)
  position.x = spot.x
  position.z = spot.z
  sailing.heading = spot.heading - Math.PI
  sailing.velocityX = 0
  sailing.velocityZ = 0
}

function settleTiltAndLean(
  sailing: ShipSailing,
  group: THREE.Group,
  tiltMax: number,
  tiltSpeed: number,
  dt: number
) {
  const tiltTarget = sailing.steering * tiltMax
  sailing.tilt += (tiltTarget - sailing.tilt) * Math.min(1, tiltSpeed * dt)

  whirlpoolLean(group.position.x, group.position.z, sailing.heading, _leanTarget)
  sailing.lean.lerp(_leanTarget, Math.min(1, WHIRLPOOL_LEAN_RATE * dt))
  group.rotation.set(sailing.lean.x, sailing.heading, sailing.tilt + sailing.lean.y, 'YXZ')
}

function publishShipMotion(sailing: ShipSailing, position: THREE.Vector3) {
  const motion = useShipStore.getState()
  motion.x = position.x
  motion.z = position.z
  motion.velocityX = sailing.velocityX
  motion.velocityZ = sailing.velocityZ
  motion.speed = Math.hypot(sailing.velocityX, sailing.velocityZ)
  motion.heading = sailing.heading + Math.PI
  motion.tailwind = sailing.tailwind
}

export function stepSailing(
  sailing: ShipSailing,
  group: THREE.Group,
  pressedKeys: Keys,
  time: number,
  delta: number
) {
  const dt = safeFrameSeconds(delta)
  const { throttle, turn, steering } = sailingInput(pressedKeys, sailing.heading)
  const tuning = useDebugStore.getState().ship
  const { run } = useCheckpointStore.getState()
  const surgeBoost = run ? surgeBoostOf(run) : 0
  const moveSpeed = tuning.moveSpeed * (run ? 1 + surgeBoost : sailingPace())
  const wind = run ? COURSE_WINDS[run.course] : useWindStore.getState().direction
  const windStrength = run ? RACE_WIND_STRENGTH : useWeatherStore.getState().windMultiplier
  const { position } = group

  sailing.heading += tuning.turnSpeed * turn * dt
  const forwardX = -Math.sin(sailing.heading)
  const forwardZ = -Math.cos(sailing.heading)
  const alignment = forwardX * wind.x + forwardZ * wind.y

  steerVelocity(sailing, throttle, forwardX, forwardZ, alignment, moveSpeed, windStrength, dt)
  driftAlong(sailing, position, dt)
  fillSail(sailing, forwardX, forwardZ, alignment, moveSpeed, surgeBoost, dt)
  keepInsideBoundary(position)
  pushOffIslands(position)
  keepHullOffCoasts(
    position,
    sailing.heading,
    tuning.modelSize,
    useCoastStore.getState().collisions
  )
  followRaceGlide(sailing, position, run)

  sailing.steering = steering
  settleTiltAndLean(sailing, group, tuning.tiltMax, tuning.tiltSpeed, dt)
  publishShipMotion(sailing, position)
  position.y = shipBobHeight(tuning, time, position.x, position.z)
}
