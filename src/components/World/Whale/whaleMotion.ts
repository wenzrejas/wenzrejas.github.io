import * as THREE from 'three'
import { useShipStore } from '../../../store/shipStore'
import { rand, wrapAngle } from '../../../utils/math'
import { isOpenWater } from '../Islands/islandZones'
import {
  ACCEL,
  BANK_FACTOR,
  BANK_LIMIT,
  BANK_SMOOTH,
  BREACH_CLEARANCE,
  BREACH_DURATION,
  BREACH_HEIGHT,
  BREACH_ROLL,
  BREACH_SPEED,
  CHARGE_DEPTH,
  CHARGE_SPEED,
  CHARGE_TIME,
  DAYLIGHT_FROM,
  DAYLIGHT_UNTIL,
  DIVE_RATE,
  GLIDE_DEPTH,
  GLIDE_SPEED_MAX,
  GLIDE_SPEED_MIN,
  HIDDEN_DEPTH,
  HOVER_TIME_MAX,
  HOVER_TIME_MIN,
  OFFSCREEN_GRACE,
  OPEN_WATER_GAP,
  RISE_RATE,
  RUN_LOOKAHEAD,
  SPAWN_YAW_MAX,
  SPAWN_YAW_MIN,
  STROKE_FREQ_AIR,
  STROKE_FREQ_CHARGE,
  STROKE_FREQ_GLIDE,
  WANDER_FREQ,
  WANDER_RATE,
} from './constants'

type Stage = 'rise' | 'glide' | 'charge' | 'breach' | 'sound'

export interface Whale {
  x: number
  z: number
  y: number
  heading: number
  speed: number
  glideSpeed: number
  depth: number
  climb: number
  pitch: number
  bank: number
  phase: number
  seed: number
  age: number
  stage: Stage
  stageTime: number
  hoverTime: number
  breachRoll: number
  prevSnoutY: number
}

interface Pose {
  y: number
  climb: number
  roll: number
}

type ShipMotion = ReturnType<typeof useShipStore.getState>

const _pose: Pose = { y: 0, climb: 0, roll: 0 }
const { clamp } = THREE.MathUtils

export const isDaylight = (timeOfDay: number) =>
  timeOfDay >= DAYLIGHT_FROM && timeOfDay < DAYLIGHT_UNTIL

export function createWhale(ship: ShipMotion): Whale {
  const glideSpeed = rand(GLIDE_SPEED_MIN, GLIDE_SPEED_MAX)
  return {
    x: ship.x,
    z: ship.z,
    y: -HIDDEN_DEPTH,
    heading: ship.heading + Math.sign(Math.random() - 0.5) * rand(SPAWN_YAW_MIN, SPAWN_YAW_MAX),
    speed: glideSpeed,
    glideSpeed,
    depth: HIDDEN_DEPTH,
    climb: 0,
    pitch: 0,
    bank: 0,
    phase: Math.random() * Math.PI * 2,
    seed: Math.random() * 100,
    age: 0,
    stage: 'rise',
    stageTime: 0,
    hoverTime: rand(HOVER_TIME_MIN, HOVER_TIME_MAX),
    breachRoll: BREACH_ROLL * Math.sign(Math.random() - 0.5),
    prevSnoutY: -HIDDEN_DEPTH,
  }
}

export const hasClearRun = (whale: Whale) =>
  isOpenWater(whale.x, whale.z, OPEN_WATER_GAP) &&
  isOpenWater(
    whale.x + Math.sin(whale.heading) * RUN_LOOKAHEAD,
    whale.z + Math.cos(whale.heading) * RUN_LOOKAHEAD,
    OPEN_WATER_GAP
  )

export const isGone = (whale: Whale, visible: boolean) => {
  if (whale.stage === 'sound') return whale.depth >= HIDDEN_DEPTH
  if (whale.stage === 'rise' || whale.stage === 'glide')
    return !visible && whale.age > OFFSCREEN_GRACE
  return false
}

// ── Stages ────────────────────────────────────────────────────────────────────

function enter(whale: Whale, stage: Stage): void {
  whale.stage = stage
  whale.stageTime = 0
}

function advanceStage(whale: Whale, inFrame: boolean, shipGap: number): void {
  switch (whale.stage) {
    case 'rise':
      if (Math.abs(whale.depth - GLIDE_DEPTH) < 0.3) enter(whale, 'glide')
      break
    case 'glide':
      if (whale.stageTime > whale.hoverTime && inFrame && shipGap > BREACH_CLEARANCE)
        enter(whale, 'charge')
      break
    case 'charge':
      if (whale.stageTime > CHARGE_TIME && Math.abs(whale.depth - CHARGE_DEPTH) < 0.5)
        enter(whale, 'breach')
      break
    case 'breach':
      if (whale.stageTime > BREACH_DURATION) enter(whale, 'sound')
      break
    case 'sound':
      break
  }
}

const targetDepth = (whale: Whale) => {
  switch (whale.stage) {
    case 'rise':
    case 'glide':
      return GLIDE_DEPTH
    case 'charge':
      return CHARGE_DEPTH
    case 'breach':
      return whale.depth
    case 'sound':
      return HIDDEN_DEPTH
  }
}

const targetSpeed = (whale: Whale) => {
  if (whale.stage === 'charge') return CHARGE_SPEED
  if (whale.stage === 'breach') return BREACH_SPEED
  return whale.glideSpeed
}

const strokeFrequency = (whale: Whale) => {
  if (whale.y > 0) return STROKE_FREQ_AIR
  return whale.stage === 'charge' || whale.stage === 'breach'
    ? STROKE_FREQ_CHARGE
    : STROKE_FREQ_GLIDE
}

// ── Motion ────────────────────────────────────────────────────────────────────

export function updateWhale(
  whale: Whale,
  ship: ShipMotion,
  time: number,
  dt: number,
  inFrame: boolean
): void {
  whale.age += dt
  whale.stageTime += dt
  advanceStage(whale, inFrame, Math.hypot(whale.x - ship.x, whale.z - ship.z))

  const previousHeading = whale.heading
  if (whale.stage === 'rise' || whale.stage === 'glide') {
    whale.heading += Math.sin(time * WANDER_FREQ + whale.seed) * WANDER_RATE * dt
  }

  whale.speed += (targetSpeed(whale) - whale.speed) * Math.min(1, ACCEL * dt)
  whale.x += Math.sin(whale.heading) * whale.speed * dt
  whale.z += Math.cos(whale.heading) * whale.speed * dt

  const depth = targetDepth(whale)
  const depthRate = depth < whale.depth ? RISE_RATE : DIVE_RATE
  const step = clamp(depth - whale.depth, -depthRate * dt, depthRate * dt)
  whale.depth += step
  whale.climb = dt > 0 ? -step / dt : 0

  const yawRate = dt > 0 ? wrapAngle(whale.heading - previousHeading) / dt : 0
  const bank = clamp(-yawRate * BANK_FACTOR, -BANK_LIMIT, BANK_LIMIT)
  whale.bank += (bank - whale.bank) * Math.min(1, BANK_SMOOTH * dt)

  whale.phase += dt * Math.PI * 2 * strokeFrequency(whale)
}

export function pose(whale: Whale): Pose {
  if (whale.stage !== 'breach') {
    _pose.y = -whale.depth
    _pose.climb = whale.climb
    _pose.roll = 0
    return _pose
  }

  const t = Math.min(whale.stageTime / BREACH_DURATION, 1)
  const rise = BREACH_HEIGHT + whale.depth
  _pose.y = -whale.depth + rise * 4 * t * (1 - t)
  _pose.climb = (rise * 4 * (1 - 2 * t)) / BREACH_DURATION
  _pose.roll = whale.breachRoll * Math.sin(Math.PI * t)
  return _pose
}
