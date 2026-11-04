import { MathUtils, type Camera, type Vector2 } from 'three'
import { eventDelta } from '@/store/cinematicStore'
import { useNightEventStore } from '@/store/nightEventStore'
import { isMotionReduced } from '@/store/settingsStore'
import { useShipStore } from '@/store/shipStore'
import { useWindStore } from '@/store/windStore'
import { retain } from '@/utils/array'
import { rand } from '@/utils/math'
import { isOpenWater } from '@/world/islands/shared/islandZones'
import { hullGapToPoint } from '@/world/ship/hullCollision'
import { viewReach } from '@/world/wildlife/algae/patches'
import { addPatchAround, addPatchBesideShip, placeNextFew, settleInPatch } from './bloomPatches'
import { bloom, type Jelly, type JellyPatch } from './bloomState'
import {
  JELLY_BRUSH_CHECK_DISTANCE,
  JELLY_BRUSH_REACH,
  JELLY_BRUSHABLE_RISE,
  JELLY_CLEAR_EASE_SECONDS,
  JELLY_CLEAR_SECONDS_MAX,
  JELLY_CLEAR_SECONDS_MIN,
  JELLY_CLEAR_SPEED,
  JELLY_CLEARANCE,
  JELLY_CURRENT_SPEED,
  JELLY_DIVE_SECONDS,
  JELLY_MAX_PATCHES,
  JELLY_NEAR_SHORE_MARGIN,
  JELLY_PATCH_CHANCE,
  JELLY_PATCH_CHECK_SECONDS,
  JELLY_PATCH_DESPAWN_DISTANCE,
  JELLY_PATCH_EDGE_REACH,
  JELLY_RETURN_SECONDS_MAX,
  JELLY_RETURN_SECONDS_MIN,
  JELLY_RISE_SECONDS,
  JELLY_SHORE_GAP,
  JELLY_WANDER_GRAIN,
  JELLY_WANDER_SPEED,
  JELLY_WANDER_SPREAD,
  JELLY_WANDER_TURN_RATE,
} from './constants'

interface BloomFrame {
  shipX: number
  shipZ: number
  shipHeading: number
  reach: number
  isOn: boolean
  isDrifting: boolean
  wind: Vector2
  time: number
  dt: number
}

function drift(jelly: Jelly, { wind, time, dt }: BloomFrame) {
  const heading =
    jelly.x * JELLY_WANDER_GRAIN + jelly.seed * JELLY_WANDER_SPREAD + time * JELLY_WANDER_TURN_RATE
  jelly.x += (wind.x * JELLY_CURRENT_SPEED + Math.sin(heading) * JELLY_WANDER_SPEED) * dt
  jelly.z += (wind.y * JELLY_CURRENT_SPEED + Math.cos(heading) * JELLY_WANDER_SPEED) * dt
}

function checkHullBrush(jelly: Jelly, { shipX, shipZ }: BloomFrame) {
  if (jelly.rise < JELLY_BRUSHABLE_RISE) return
  if (Math.hypot(jelly.x - shipX, jelly.z - shipZ) > JELLY_BRUSH_CHECK_DISTANCE) return
  if (hullGapToPoint(jelly.x, jelly.z) > jelly.radius + JELLY_BRUSH_REACH) return
  jelly.brush = 'clearing'
  jelly.clearSeconds = 0
}

function pushClearOfHull(jelly: Jelly, { shipX, shipZ, shipHeading, dt }: BloomFrame) {
  const forwardX = Math.sin(shipHeading)
  const forwardZ = Math.cos(shipHeading)
  const toX = jelly.x - shipX
  const toZ = jelly.z - shipZ
  const side = toX * forwardZ - toZ * forwardX >= 0 ? 1 : -1
  const push =
    JELLY_CLEAR_SPEED * MathUtils.smoothstep(jelly.clearSeconds, 0, JELLY_CLEAR_EASE_SECONDS)
  jelly.x += forwardZ * side * push * dt
  jelly.z -= forwardX * side * push * dt
  jelly.clearSeconds += dt
  const isClear = hullGapToPoint(jelly.x, jelly.z) >= JELLY_CLEARANCE
  if (
    (isClear && jelly.clearSeconds >= JELLY_CLEAR_SECONDS_MIN) ||
    jelly.clearSeconds >= JELLY_CLEAR_SECONDS_MAX
  ) {
    jelly.brush = 'diving'
    jelly.returnSeconds = rand(JELLY_RETURN_SECONDS_MIN, JELLY_RETURN_SECONDS_MAX)
  }
}

function diveAndReturn(jelly: Jelly, patch: JellyPatch, frame: BloomFrame) {
  if (jelly.rise > 0) {
    jelly.rise = Math.max(0, jelly.rise - frame.dt / JELLY_DIVE_SECONDS)
    return
  }
  jelly.returnSeconds -= frame.dt
  if (jelly.returnSeconds > 0) return
  settleInPatch(jelly, patch, frame.shipX, frame.shipZ)
  jelly.brush = 'none'
}

function stepJelly(jelly: Jelly, patch: JellyPatch, frame: BloomFrame, isNearShore: boolean) {
  if (frame.isDrifting) drift(jelly, frame)
  if (jelly.brush === 'clearing') {
    pushClearOfHull(jelly, frame)
    return
  }
  if (jelly.brush === 'diving') {
    diveAndReturn(jelly, patch, frame)
    return
  }
  const isWanted =
    patch.age >= jelly.wakeAt && (!isNearShore || isOpenWater(jelly.x, jelly.z, JELLY_SHORE_GAP))
  jelly.rise = isWanted
    ? Math.min(1, jelly.rise + frame.dt / JELLY_RISE_SECONDS)
    : Math.max(0, jelly.rise - frame.dt / JELLY_DIVE_SECONDS)
  checkHullBrush(jelly, frame)
}

function stepPatch(patch: JellyPatch, frame: BloomFrame): boolean {
  const { shipX, shipZ, reach, isOn, isDrifting, wind, dt } = frame
  if (isDrifting) {
    patch.x += wind.x * JELLY_CURRENT_SPEED * dt
    patch.z += wind.y * JELLY_CURRENT_SPEED * dt
  }
  patch.age = MathUtils.clamp(patch.age + (isOn ? dt : -dt), 0, patch.lastWake)

  const distance = Math.hypot(patch.x - shipX, patch.z - shipZ)
  patch.isInView = distance < reach + patch.radius * JELLY_PATCH_EDGE_REACH

  const shoreCheckGap =
    JELLY_SHORE_GAP + patch.radius * JELLY_PATCH_EDGE_REACH + JELLY_NEAR_SHORE_MARGIN
  const isNearShore = !isOpenWater(patch.x, patch.z, shoreCheckGap)

  let isAnyUp = false
  for (const jelly of patch.jellies) {
    stepJelly(jelly, patch, frame, isNearShore)
    isAnyUp ||= jelly.rise > 0
  }
  return isOn ? distance <= JELLY_PATCH_DESPAWN_DISTANCE : isAnyUp
}

function growBloom({ shipX, shipZ, reach, dt }: BloomFrame, boost: number) {
  if (bloom.patches.length === 0) addPatchBesideShip(shipX, shipZ, boost)
  bloom.checkSeconds -= eventDelta(dt)
  if (bloom.checkSeconds <= 0) {
    bloom.checkSeconds = JELLY_PATCH_CHECK_SECONDS
    const hasRoom = bloom.patches.length < JELLY_MAX_PATCHES
    if (hasRoom && Math.random() < JELLY_PATCH_CHANCE) addPatchAround(shipX, shipZ, reach, boost)
  }
  placeNextFew(shipX, shipZ)
}

export function stepBloom(dt: number, time: number, camera: Camera, boost: number): boolean {
  const { kind, run } = useNightEventStore.getState()
  const isOn = kind === 'jellyfish'

  if (run !== bloom.run) {
    bloom.run = run
    if (kind === 'jellyfish') {
      bloom.patches.length = 0
      bloom.checkSeconds = JELLY_PATCH_CHECK_SECONDS
    }
  }
  if (!isOn && bloom.patches.length === 0) return false

  const ship = useShipStore.getState()
  const frame: BloomFrame = {
    shipX: ship.x,
    shipZ: ship.z,
    shipHeading: ship.heading,
    reach: viewReach(camera, ship.x, ship.z),
    isOn,
    isDrifting: !isMotionReduced(),
    wind: useWindStore.getState().dir,
    time,
    dt,
  }
  if (isOn) growBloom(frame, boost)
  retain(bloom.patches, (patch) => stepPatch(patch, frame))
  return bloom.patches.length > 0
}
