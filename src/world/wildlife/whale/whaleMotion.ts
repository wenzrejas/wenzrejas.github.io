import * as THREE from 'three'
import { useShipStore } from '@/store/shipStore'
import { rand, wrapAngle } from '@/utils/math'
import { isOpenWater } from '@/world/islands/shared/islandZones'
import { depthFade } from '../shared/wildlifeMaterial'
import {
  ACCEL,
  BANK_FACTOR,
  BANK_LIMIT,
  BANK_SMOOTH,
  BLOW_COUNT,
  BLOW_DEPTH,
  BLOW_INTERVAL,
  BLOW_LEAD,
  BLOW_SPEED,
  BLOWHOLE_OFFSET,
  BREACH_ARCH,
  BREACH_CLEARANCE,
  BREACH_GRAVITY,
  BREACH_HEIGHT,
  BREACH_PITCH_BOOST,
  BREACH_PITCH_MAX,
  BREACH_ROLL,
  BREACH_SPEED,
  CHARGE_DEPTH,
  CHARGE_SPEED,
  CHARGE_TIME,
  CLIMB_CURVE_GAIN,
  CROSSING_ANGLE_DEGREES,
  CRUISE_PITCH_MAX,
  CURVE_LIMIT,
  CURVE_SMOOTH,
  DAYLIGHT_FROM,
  DAYLIGHT_UNTIL,
  DEPTH_GAIN,
  DEPTH_REACHED,
  DEPTH_SMOOTH,
  DIVE_RATE,
  FADE_START_DEPTH,
  FLIGHT_PITCH,
  FLIGHT_PITCH_SMOOTH,
  GLIDE_DEPTH,
  GLIDE_SPEED,
  HIDDEN_DEPTH,
  HOVER_TIME_MAX,
  HOVER_TIME_MIN,
  OFFSCREEN_GRACE,
  OPEN_WATER_GAP,
  PITCH_SMOOTH,
  RISE_RATE,
  ROLL_SMOOTH,
  RUN_LOOKAHEAD,
  SPAWN_ASIDE,
  SPAWN_BEHIND,
  SINK_DEPTH,
  SPAWN_LEAD_SECONDS,
  SPOUT_DROPS,
  STROKE_FREQ_AIR,
  STROKE_FREQ_CHARGE,
  STROKE_FREQ_GLIDE,
  STROKE_SMOOTH,
  SURFACE_BOB,
  TURN_CURVE_GAIN,
  WAKE_FADE_DEPTH,
  WANDER_FREQ,
  WANDER_RATE,
  WHALE_LENGTH,
} from './constants'

type Stage = 'rise' | 'blow' | 'glide' | 'charge' | 'launch' | 'flight' | 'sound'

export interface Whale {
  x: number
  z: number
  heading: number
  speed: number
  depth: number
  climb: number
  pitch: number
  bank: number
  roll: number
  turnCurve: number
  climbCurve: number
  strokeRate: number
  phase: number
  seed: number
  age: number
  stage: Stage
  stageTime: number
  hoverTime: number
  breachRoll: number
  blows: number
  spoutDrops: number
  wakeX: number
  wakeZ: number
  emergence: number
}

export interface WhaleView {
  isInFrame: boolean
  isInView: boolean
}

type ShipMotion = ReturnType<typeof useShipStore.getState>

const _blowhole = { x: 0, z: 0 }
const { clamp, damp, degToRad } = THREE.MathUtils
const LAUNCH_ACCEL = (BREACH_GRAVITY * BREACH_HEIGHT) / CHARGE_DEPTH
const CROSSING_ANGLE = degToRad(CROSSING_ANGLE_DEGREES)

export const isDaylight = (timeOfDay: number) =>
  timeOfDay >= DAYLIGHT_FROM && timeOfDay < DAYLIGHT_UNTIL

const isBreaching = (whale: Whale) => whale.stage === 'launch' || whale.stage === 'flight'

export function createWhale(ship: ShipMotion, cameraPosition: THREE.Vector3): Whale {
  const towardCamera = Math.atan2(cameraPosition.x - ship.x, cameraPosition.z - ship.z)
  const heading = towardCamera + Math.sign(Math.random() - 0.5) * CROSSING_ANGLE
  const lead = ship.speed * SPAWN_LEAD_SECONDS
  const passX = ship.x + Math.sin(ship.heading) * lead + Math.sin(towardCamera) * SPAWN_ASIDE
  const passZ = ship.z + Math.cos(ship.heading) * lead + Math.cos(towardCamera) * SPAWN_ASIDE
  const x = passX - Math.sin(heading) * SPAWN_BEHIND
  const z = passZ - Math.cos(heading) * SPAWN_BEHIND
  return {
    x,
    z,
    heading,
    speed: GLIDE_SPEED,
    depth: HIDDEN_DEPTH,
    climb: 0,
    pitch: 0,
    bank: 0,
    roll: 0,
    turnCurve: 0,
    climbCurve: 0,
    strokeRate: STROKE_FREQ_GLIDE,
    phase: Math.random() * Math.PI * 2,
    seed: Math.random() * 100,
    age: 0,
    stage: 'rise',
    stageTime: 0,
    hoverTime: rand(HOVER_TIME_MIN, HOVER_TIME_MAX),
    breachRoll: BREACH_ROLL * Math.sign(Math.random() - 0.5),
    blows: 0,
    spoutDrops: 0,
    wakeX: x,
    wakeZ: z,
    emergence: 0,
  }
}

export const hasClearRun = (whale: Whale) =>
  isOpenWater(whale.x, whale.z, OPEN_WATER_GAP) &&
  isOpenWater(
    whale.x + Math.sin(whale.heading) * RUN_LOOKAHEAD,
    whale.z + Math.cos(whale.heading) * RUN_LOOKAHEAD,
    OPEN_WATER_GAP
  )

const isNear = (depth: number, target: number) => Math.abs(depth - target) < DEPTH_REACHED

const isCruising = (whale: Whale) =>
  whale.stage === 'rise' || whale.stage === 'blow' || whale.stage === 'glide'

export const isGone = (whale: Whale, isOutOfSight: boolean) =>
  whale.stage === 'sound' && (isOutOfSight || isNear(whale.depth, SINK_DEPTH))

export function bodyEndsOf(whale: Whale, snout: THREE.Vector3, tail: THREE.Vector3): void {
  const halfLength = WHALE_LENGTH / 2
  const along = Math.cos(whale.pitch) * halfLength
  const rise = Math.sin(whale.pitch) * halfLength
  const alongX = Math.sin(whale.heading) * along
  const alongZ = Math.cos(whale.heading) * along
  snout.set(whale.x + alongX, -whale.depth + rise, whale.z + alongZ)
  tail.set(whale.x - alongX, -whale.depth - rise, whale.z - alongZ)
}

export function blowholeOf(whale: Whale) {
  const reach = BLOWHOLE_OFFSET * WHALE_LENGTH
  _blowhole.x = whale.x + Math.sin(whale.heading) * reach
  _blowhole.z = whale.z + Math.cos(whale.heading) * reach
  return _blowhole
}

export const wakeStrength = (whale: Whale) =>
  isBreaching(whale) ? 0 : clamp(1 - (whale.depth - BLOW_DEPTH) / WAKE_FADE_DEPTH, 0, 1)

// ── Stages ────────────────────────────────────────────────────────────────────

function enter(whale: Whale, stage: Stage): void {
  whale.stage = stage
  whale.stageTime = 0
}

function advanceStage(whale: Whale, view: WhaleView, shipGap: number): void {
  if (isCruising(whale) && !view.isInView && whale.age > OFFSCREEN_GRACE) {
    enter(whale, 'sound')
    return
  }

  switch (whale.stage) {
    case 'rise':
      if (isNear(whale.depth, BLOW_DEPTH)) enter(whale, 'blow')
      break
    case 'blow':
      if (whale.stageTime > BLOW_LEAD + BLOW_COUNT * BLOW_INTERVAL) enter(whale, 'glide')
      break
    case 'glide':
      if (whale.stageTime > whale.hoverTime && view.isInFrame && shipGap > BREACH_CLEARANCE)
        enter(whale, 'charge')
      break
    case 'charge':
      if (whale.stageTime > CHARGE_TIME && isNear(whale.depth, CHARGE_DEPTH)) enter(whale, 'launch')
      break
    case 'launch':
      if (whale.depth <= 0) enter(whale, 'flight')
      break
    case 'flight':
      if (whale.depth >= 0 && whale.climb < 0) enter(whale, 'sound')
      break
    case 'sound':
      break
  }
}

function startDueBlow(whale: Whale): void {
  if (whale.stage !== 'blow' || whale.blows >= BLOW_COUNT) return
  if (whale.stageTime < BLOW_LEAD + whale.blows * BLOW_INTERVAL) return
  whale.blows++
  whale.spoutDrops = SPOUT_DROPS
}

const targetDepth = (whale: Whale) => {
  switch (whale.stage) {
    case 'rise':
      return BLOW_DEPTH
    case 'blow':
      return (
        BLOW_DEPTH -
        SURFACE_BOB * Math.cos(((whale.stageTime - BLOW_LEAD) / BLOW_INTERVAL) * Math.PI * 2)
      )
    case 'glide':
      return GLIDE_DEPTH
    case 'charge':
      return CHARGE_DEPTH
    default:
      return SINK_DEPTH
  }
}

const cruiseSpeed = (whale: Whale) => {
  if (whale.stage === 'blow') return BLOW_SPEED
  if (whale.stage === 'charge') return CHARGE_SPEED
  if (isBreaching(whale)) return BREACH_SPEED
  return GLIDE_SPEED
}

const strokeFrequency = (whale: Whale) => {
  if (whale.depth < 0) return STROKE_FREQ_AIR
  return whale.stage === 'charge' || whale.stage === 'launch'
    ? STROKE_FREQ_CHARGE
    : STROKE_FREQ_GLIDE
}

// ── Motion ────────────────────────────────────────────────────────────────────

function moveVertically(whale: Whale, dt: number): void {
  if (whale.stage === 'launch') whale.climb += LAUNCH_ACCEL * dt
  else if (whale.stage === 'flight') whale.climb -= BREACH_GRAVITY * dt
  else {
    const wanted = clamp((whale.depth - targetDepth(whale)) * DEPTH_GAIN, -DIVE_RATE, RISE_RATE)
    whale.climb = damp(whale.climb, wanted, DEPTH_SMOOTH, dt)
  }
  whale.depth -= whale.climb * dt
}

function pitchToClimb(whale: Whale, dt: number): void {
  const isSteep = isBreaching(whale) || whale.stage === 'sound'
  const pitchLimit = isSteep ? BREACH_PITCH_MAX : CRUISE_PITCH_MAX
  const boost = isSteep ? BREACH_PITCH_BOOST : 1
  const pitch = clamp(
    Math.atan2(whale.climb, Math.max(whale.speed, 1)) * boost,
    -pitchLimit,
    pitchLimit
  )
  whale.pitch = damp(whale.pitch, pitch, PITCH_SMOOTH, dt)
}

function orientBody(whale: Whale, dt: number): void {
  const isAirborne = whale.stage === 'flight'
  if (isAirborne) whale.pitch = damp(whale.pitch, FLIGHT_PITCH, FLIGHT_PITCH_SMOOTH, dt)
  else pitchToClimb(whale, dt)

  whale.roll = damp(whale.roll, isAirborne ? whale.breachRoll : 0, ROLL_SMOOTH, dt)
}

function flexBody(whale: Whale, yawRate: number, pitchRate: number, dt: number): void {
  const turnCurve = clamp(yawRate * TURN_CURVE_GAIN, -CURVE_LIMIT, CURVE_LIMIT)
  const climbCurve =
    whale.stage === 'flight'
      ? -BREACH_ARCH
      : clamp(pitchRate * CLIMB_CURVE_GAIN, -CURVE_LIMIT, CURVE_LIMIT)
  whale.turnCurve = damp(whale.turnCurve, turnCurve, CURVE_SMOOTH, dt)
  whale.climbCurve = damp(whale.climbCurve, climbCurve, CURVE_SMOOTH, dt)
}

export function updateWhale(
  whale: Whale,
  ship: ShipMotion,
  time: number,
  dt: number,
  view: WhaleView
): void {
  whale.age += dt
  whale.stageTime += dt
  advanceStage(whale, view, Math.hypot(whale.x - ship.x, whale.z - ship.z))
  startDueBlow(whale)

  const previousHeading = whale.heading
  const previousPitch = whale.pitch
  if (isCruising(whale)) {
    whale.heading += Math.sin(time * WANDER_FREQ + whale.seed) * WANDER_RATE * dt
  }

  whale.speed = damp(whale.speed, cruiseSpeed(whale), ACCEL, dt)
  whale.x += Math.sin(whale.heading) * whale.speed * dt
  whale.z += Math.cos(whale.heading) * whale.speed * dt
  moveVertically(whale, dt)
  orientBody(whale, dt)

  const yawRate = dt > 0 ? wrapAngle(whale.heading - previousHeading) / dt : 0
  const pitchRate = dt > 0 ? (whale.pitch - previousPitch) / dt : 0
  const bank = clamp(-yawRate * BANK_FACTOR, -BANK_LIMIT, BANK_LIMIT)
  whale.bank = damp(whale.bank, bank, BANK_SMOOTH, dt)
  flexBody(whale, yawRate, pitchRate, dt)

  whale.strokeRate = damp(whale.strokeRate, strokeFrequency(whale), STROKE_SMOOTH, dt)
  whale.phase += dt * Math.PI * 2 * whale.strokeRate
  whale.emergence = Math.max(
    whale.emergence,
    depthFade(whale.depth, FADE_START_DEPTH, HIDDEN_DEPTH)
  )
}
