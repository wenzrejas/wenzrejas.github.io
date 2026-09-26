import * as THREE from 'three'
import { useShipStore } from '../../../store/shipStore'
import { useWhaleStore } from '../../../store/whaleStore'
import { mix, rand, wrapAngle } from '../../../utils/math'
import { ISLAND_ZONES, isOpenWater, shoreGap } from '../Islands/islandZones'
import {
  ACCEL,
  ACTION_DELAY_MAX,
  ACTION_DELAY_MIN,
  ACTIVE_FROM,
  ACTIVE_UNTIL,
  CRUISE_DEPTH_MAX,
  CRUISE_DEPTH_MIN,
  DIVE_RATE,
  FOLLOW_GAIN,
  FOLLOW_TIME_MAX,
  FOLLOW_TIME_MIN,
  HIDDEN_DEPTH,
  LEAP_ARCH,
  LEAP_CHANCE,
  LEAP_DURATION,
  LEAP_HEIGHT,
  LEAP_HEIGHT_JITTER,
  LEAP_MIN_SPEED,
  LEAP_ROLL,
  LEAVE_DRIFT,
  MAX_SPEED,
  MAX_YAW_RATE,
  NOON_CHANCE,
  NOON_UNTIL,
  POD_MAX,
  POD_MIN,
  RISE_RATE,
  ROAM_ANCHOR_GAP,
  ROAM_END_GAP,
  ROAM_RATE,
  ROAM_START_GAP,
  SEPARATION_RADIUS,
  SEPARATION_STRENGTH,
  SHIP_CLEARANCE,
  SLOT_ANGLE_JITTER,
  SLOT_ANGLE_MIN,
  SLOT_ANGLE_STEP,
  SLOT_RADIUS_MAX,
  SLOT_RADIUS_MIN,
  SURFACE_ARCH,
  SURFACE_DURATION,
  SURFACE_LIFT,
  TURN_GAIN,
  TURN_SLOWDOWN,
  WHALE_CLEARANCE,
  YAW_SMOOTH,
} from './constants'

type Action = 'cruise' | 'surface' | 'leap'

interface Dolphin {
  x: number
  z: number
  heading: number
  yawRate: number
  speed: number
  pitch: number
  depth: number
  targetDepth: number
  slotAngle: number
  slotRadius: number
  roamPhase: number
  phase: number
  action: Action
  actionTimer: number
  actionProgress: number
  leapHeight: number
  leapDuration: number
  leapRoll: number
  prevY: number
  wakeX: number
  wakeZ: number
}

export interface Pod {
  age: number
  followTime: number
  leaving: boolean
  orbit: number
  roaming: boolean
  roamX: number
  roamZ: number
  roamAngle: number
  dolphins: Dolphin[]
}

type ShipMotion = ReturnType<typeof useShipStore.getState>

interface Pose {
  y: number
  climb: number
  arch: number
  roll: number
}

const _pose: Pose = { y: 0, climb: 0, arch: 0, roll: 0 }
const { clamp } = THREE.MathUtils

export function timeOfDayChance(time: number): number {
  if (time >= ACTIVE_FROM && time < ACTIVE_UNTIL) return 1
  if (time >= ACTIVE_UNTIL && time < NOON_UNTIL) return NOON_CHANCE
  return 0
}

export function createPod(ship: ShipMotion): Pod {
  const count = Math.floor(rand(POD_MIN, POD_MAX + 1))
  const dolphins = Array.from({ length: count }, (_, i): Dolphin => {
    const side = i % 2 === 0 ? 1 : -1
    const rank = Math.floor(i / 2)
    const slotAngle =
      side * (SLOT_ANGLE_MIN + rank * SLOT_ANGLE_STEP + rand(-SLOT_ANGLE_JITTER, SLOT_ANGLE_JITTER))
    const slotRadius = rand(SLOT_RADIUS_MIN, SLOT_RADIUS_MAX)
    const angle = ship.heading + slotAngle
    const x = ship.x + Math.sin(angle) * slotRadius
    const z = ship.z + Math.cos(angle) * slotRadius
    return {
      x,
      z,
      heading: ship.heading,
      yawRate: 0,
      speed: Math.hypot(ship.vx, ship.vz),
      pitch: 0,
      depth: HIDDEN_DEPTH,
      targetDepth: rand(CRUISE_DEPTH_MIN, CRUISE_DEPTH_MAX),
      slotAngle,
      slotRadius,
      roamPhase: (i / count) * Math.PI * 2,
      phase: Math.random() * Math.PI * 2,
      action: 'cruise',
      actionTimer: rand(ACTION_DELAY_MIN, ACTION_DELAY_MAX),
      actionProgress: 0,
      leapHeight: LEAP_HEIGHT,
      leapDuration: LEAP_DURATION,
      leapRoll: 0,
      prevY: -HIDDEN_DEPTH,
      wakeX: x,
      wakeZ: z,
    }
  })
  return {
    age: 0,
    followTime: rand(FOLLOW_TIME_MIN, FOLLOW_TIME_MAX),
    leaving: false,
    orbit: 0,
    roaming: false,
    roamX: 0,
    roamZ: 0,
    roamAngle: 0,
    dolphins,
  }
}

// ── Roaming ───────────────────────────────────────────────────────────────────

function anchorInOpenWater(pod: Pod): void {
  let x = 0
  let z = 0
  for (const dolphin of pod.dolphins) {
    x += dolphin.x / pod.dolphins.length
    z += dolphin.z / pod.dolphins.length
  }
  for (const zone of ISLAND_ZONES) {
    const gap = shoreGap(zone, x, z)
    if (gap >= ROAM_ANCHOR_GAP) continue
    const push = (ROAM_ANCHOR_GAP - gap) / Math.max(Math.hypot(x - zone.x, z - zone.z), 1)
    x += (x - zone.x) * push
    z += (z - zone.z) * push
  }
  pod.roamX = x
  pod.roamZ = z
}

export function updateRoaming(pod: Pod, ship: ShipMotion, dt: number): void {
  if (pod.roaming) {
    pod.roamAngle += ROAM_RATE * dt
    if (isOpenWater(ship.x, ship.z, ROAM_END_GAP)) pod.roaming = false
  } else if (!isOpenWater(ship.x, ship.z, ROAM_START_GAP)) {
    pod.roaming = true
    anchorInOpenWater(pod)
  }
}

// ── Steering ──────────────────────────────────────────────────────────────────

const _push = new THREE.Vector2()

function addRepulsion(dolphin: Dolphin, x: number, z: number, radius: number): void {
  const dx = dolphin.x - x
  const dz = dolphin.z - z
  const distance = Math.hypot(dx, dz)
  if (distance >= radius || distance < 1e-3) return
  const strength = (1 - distance / radius) * SEPARATION_STRENGTH
  _push.x += (dx / distance) * strength
  _push.y += (dz / distance) * strength
}

export function swim(dolphin: Dolphin, pod: Pod, ship: ShipMotion, dt: number): void {
  if (pod.leaving) dolphin.slotRadius += LEAVE_DRIFT * dt

  const angle = pod.roaming
    ? pod.roamAngle + dolphin.roamPhase
    : ship.heading + dolphin.slotAngle + pod.orbit
  const centerX = pod.roaming ? pod.roamX : ship.x
  const centerZ = pod.roaming ? pod.roamZ : ship.z
  const targetX = centerX + Math.sin(angle) * dolphin.slotRadius
  const targetZ = centerZ + Math.cos(angle) * dolphin.slotRadius
  const leadX = pod.roaming ? Math.cos(angle) * ROAM_RATE * dolphin.slotRadius : ship.vx
  const leadZ = pod.roaming ? -Math.sin(angle) * ROAM_RATE * dolphin.slotRadius : ship.vz

  _push.set(0, 0)
  for (const other of pod.dolphins) {
    if (other !== dolphin) addRepulsion(dolphin, other.x, other.z, SEPARATION_RADIUS)
  }
  addRepulsion(dolphin, ship.x, ship.z, SHIP_CLEARANCE)
  const whale = useWhaleStore.getState()
  if (whale.active) addRepulsion(dolphin, whale.x, whale.z, whale.radius + WHALE_CLEARANCE)

  const desiredX = leadX + (targetX - dolphin.x) * FOLLOW_GAIN + _push.x
  const desiredZ = leadZ + (targetZ - dolphin.z) * FOLLOW_GAIN + _push.y
  const desiredSpeed = Math.min(Math.hypot(desiredX, desiredZ), MAX_SPEED)

  const turn = wrapAngle(Math.atan2(desiredX, desiredZ) - dolphin.heading)
  const targetYaw = clamp(turn * TURN_GAIN, -MAX_YAW_RATE, MAX_YAW_RATE)
  dolphin.yawRate += (targetYaw - dolphin.yawRate) * Math.min(1, YAW_SMOOTH * dt)
  dolphin.heading += dolphin.yawRate * dt

  const alignment = (1 + Math.cos(turn)) / 2
  let targetSpeed = desiredSpeed * mix(TURN_SLOWDOWN, 1, alignment)
  if (dolphin.action === 'leap') targetSpeed = Math.max(targetSpeed, dolphin.speed)
  dolphin.speed += (targetSpeed - dolphin.speed) * Math.min(1, ACCEL * dt)

  dolphin.x += Math.sin(dolphin.heading) * dolphin.speed * dt
  dolphin.z += Math.cos(dolphin.heading) * dolphin.speed * dt

  const depthRate = dolphin.targetDepth < dolphin.depth ? RISE_RATE : DIVE_RATE
  dolphin.depth += clamp(dolphin.targetDepth - dolphin.depth, -depthRate * dt, depthRate * dt)
}

// ── Surfacing & leaping ───────────────────────────────────────────────────────

export function updateAction(dolphin: Dolphin, leaving: boolean, dt: number): void {
  if (dolphin.action !== 'cruise') {
    const duration = dolphin.action === 'leap' ? dolphin.leapDuration : SURFACE_DURATION
    dolphin.actionProgress += dt / duration
    if (dolphin.actionProgress >= 1) {
      dolphin.action = 'cruise'
      dolphin.actionTimer = rand(ACTION_DELAY_MIN, ACTION_DELAY_MAX)
    }
    return
  }

  const settled = Math.abs(dolphin.depth - dolphin.targetDepth) < 0.3
  if (leaving || !settled) return
  dolphin.actionTimer -= dt
  if (dolphin.actionTimer > 0) return

  dolphin.actionProgress = 0
  if (dolphin.speed > LEAP_MIN_SPEED && Math.random() < LEAP_CHANCE) {
    const heightScale = rand(1 - LEAP_HEIGHT_JITTER, 1 + LEAP_HEIGHT_JITTER)
    dolphin.action = 'leap'
    dolphin.leapHeight = LEAP_HEIGHT * heightScale
    dolphin.leapDuration = LEAP_DURATION * Math.sqrt(heightScale)
    dolphin.leapRoll = LEAP_ROLL * Math.sign(Math.random() - 0.5)
  } else {
    dolphin.action = 'surface'
  }
}

export function pose(dolphin: Dolphin): Pose {
  const t = dolphin.actionProgress
  const arc = Math.sin(Math.PI * t)

  if (dolphin.action === 'leap') {
    const rise = dolphin.leapHeight + dolphin.depth
    _pose.y = -dolphin.depth + rise * 4 * t * (1 - t)
    _pose.climb = (rise * 4 * (1 - 2 * t)) / dolphin.leapDuration
    _pose.arch = LEAP_ARCH * arc
    _pose.roll = dolphin.leapRoll * arc
  } else if (dolphin.action === 'surface') {
    _pose.y = -dolphin.depth + SURFACE_LIFT * arc * arc
    _pose.climb = (SURFACE_LIFT * Math.PI * Math.sin(2 * Math.PI * t)) / SURFACE_DURATION
    _pose.arch = SURFACE_ARCH * arc
    _pose.roll = 0
  } else {
    _pose.y = -dolphin.depth
    _pose.climb = 0
    _pose.arch = 0
    _pose.roll = 0
  }
  return _pose
}

// ── Component ─────────────────────────────────────────────────────────────────
