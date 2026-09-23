import * as THREE from 'three'
import { useWhaleStore } from '../../../store/whaleStore'
import { mix, rand, turnToward, wrapAngle } from '../../../utils/math'
import { ISLAND_ZONES, shoreGap } from '../Islands/islandZones'
import {
  BANK_FACTOR,
  BREATH_DELAY_MAX,
  BREATH_DELAY_MIN,
  BREATH_DURATION,
  BREATH_SURFACE_Y,
  CRUISE_DEPTH_MAX,
  CRUISE_DEPTH_MIN,
  CRUISE_SPEED_MAX,
  CRUISE_SPEED_MIN,
  DIVE_RATE,
  GLIDE_FREQ,
  HIDDEN_DEPTH,
  LIFETIME_MAX,
  LIFETIME_MIN,
  PITCH_LIMIT,
  PITCH_SMOOTH,
  RISE_RATE,
  SEPARATION_FACTOR,
  SEPARATION_PUSH,
  SEPARATION_TURN_RATE,
  SHORE_AVOID_DISTANCE,
  SHORE_AVOID_RATE,
  SHY_DEPTH,
  SHY_RADIUS,
  SHY_SPEED_BOOST,
  SHY_TIME,
  SHY_TURN_RATE,
  SPEED_RATE,
  STROKE_FREQ,
  TURTLE_LENGTH,
  TURTLE_SIZE_JITTER,
  WANDER_RATE,
  WHALE_SHY_MARGIN,
} from './constants'

export interface Turtle {
  x: number
  z: number
  y: number
  heading: number
  speed: number
  cruiseSpeed: number
  depth: number
  cruiseDepth: number
  pitch: number
  bank: number
  phase: number
  seed: number
  size: number
  age: number
  lifetime: number
  leaving: boolean
  shyTimer: number
  shyFromX: number
  shyFromZ: number
  breathTimer: number
  breathProgress: number
}

const { clamp, smoothstep } = THREE.MathUtils

export function createTurtle(x: number, z: number, heading: number): Turtle {
  const cruiseSpeed = rand(CRUISE_SPEED_MIN, CRUISE_SPEED_MAX)
  return {
    x,
    z,
    y: -HIDDEN_DEPTH,
    heading,
    speed: cruiseSpeed,
    cruiseSpeed,
    depth: HIDDEN_DEPTH,
    cruiseDepth: rand(CRUISE_DEPTH_MIN, CRUISE_DEPTH_MAX),
    pitch: 0,
    bank: 0,
    phase: Math.random() * Math.PI * 2,
    seed: Math.random() * 100,
    size: TURTLE_LENGTH * rand(1 - TURTLE_SIZE_JITTER, 1 + TURTLE_SIZE_JITTER),
    age: 0,
    lifetime: rand(LIFETIME_MIN, LIFETIME_MAX),
    leaving: false,
    shyTimer: 0,
    shyFromX: 0,
    shyFromZ: 0,
    breathTimer: rand(BREATH_DELAY_MIN, BREATH_DELAY_MAX),
    breathProgress: -1,
  }
}

const targetDepth = (turtle: Turtle) =>
  turtle.leaving ? HIDDEN_DEPTH : turtle.shyTimer > 0 ? SHY_DEPTH : turtle.cruiseDepth

function startle(turtle: Turtle, x: number, z: number, radius: number): void {
  if (Math.hypot(turtle.x - x, turtle.z - z) >= radius) return
  turtle.shyTimer = SHY_TIME
  turtle.shyFromX = x
  turtle.shyFromZ = z
}

// ── Steering ──────────────────────────────────────────────────────────────────

export function steer(
  turtle: Turtle,
  shipX: number,
  shipZ: number,
  time: number,
  dt: number
): void {
  const previousHeading = turtle.heading
  turtle.heading += Math.sin(time * 0.2 + turtle.seed) * WANDER_RATE * dt

  for (const zone of ISLAND_ZONES) {
    if (shoreGap(zone, turtle.x, turtle.z) < SHORE_AVOID_DISTANCE) {
      const away = Math.atan2(turtle.x - zone.x, turtle.z - zone.z)
      turtle.heading = turnToward(turtle.heading, away, SHORE_AVOID_RATE * dt)
    }
  }

  startle(turtle, shipX, shipZ, SHY_RADIUS)
  const whale = useWhaleStore.getState()
  if (whale.active) startle(turtle, whale.x, whale.z, whale.radius + WHALE_SHY_MARGIN)
  if (turtle.shyTimer > 0) {
    turtle.shyTimer -= dt
    const away = Math.atan2(turtle.x - turtle.shyFromX, turtle.z - turtle.shyFromZ)
    turtle.heading = turnToward(turtle.heading, away, SHY_TURN_RATE * dt)
  }

  const targetSpeed = turtle.cruiseSpeed + (turtle.shyTimer > 0 ? SHY_SPEED_BOOST : 0)
  turtle.speed += (targetSpeed - turtle.speed) * Math.min(1, SPEED_RATE * dt)
  turtle.x += Math.sin(turtle.heading) * turtle.speed * dt
  turtle.z += Math.cos(turtle.heading) * turtle.speed * dt

  const yawRate = dt > 0 ? wrapAngle(turtle.heading - previousHeading) / dt : 0
  turtle.bank += (clamp(-yawRate * BANK_FACTOR, -0.4, 0.4) - turtle.bank) * Math.min(1, 3 * dt)

  const depthTarget = targetDepth(turtle)
  const depthRate = depthTarget < turtle.depth ? RISE_RATE : DIVE_RATE
  turtle.depth += clamp(depthTarget - turtle.depth, -depthRate * dt, depthRate * dt)
}

export function separate(turtles: Turtle[], dt: number): void {
  for (const turtle of turtles) {
    let pushX = 0
    let pushZ = 0
    for (const other of turtles) {
      if (other === turtle) continue
      const dx = turtle.x - other.x
      const dz = turtle.z - other.z
      const distance = Math.hypot(dx, dz)
      const reach = (turtle.size + other.size) * SEPARATION_FACTOR
      if (distance >= reach || distance < 1e-3) continue
      const strength = 1 - distance / reach
      pushX += (dx / distance) * strength
      pushZ += (dz / distance) * strength
    }

    const push = Math.hypot(pushX, pushZ)
    if (push === 0) continue
    turtle.heading = turnToward(
      turtle.heading,
      Math.atan2(pushX, pushZ),
      SEPARATION_TURN_RATE * push * dt
    )
    turtle.x += pushX * SEPARATION_PUSH * dt
    turtle.z += pushZ * SEPARATION_PUSH * dt
  }
}

export const isClearOf = (turtles: Turtle[], x: number, z: number, spacing: number) =>
  turtles.every((turtle) => Math.hypot(turtle.x - x, turtle.z - z) >= spacing)

// ── Breathing ─────────────────────────────────────────────────────────────────

export function breathe(turtle: Turtle, dt: number): boolean {
  if (turtle.breathProgress >= 0) {
    const before = turtle.breathProgress
    turtle.breathProgress += dt / BREATH_DURATION
    if (turtle.breathProgress >= 1) {
      turtle.breathProgress = -1
      turtle.breathTimer = rand(BREATH_DELAY_MIN, BREATH_DELAY_MAX)
    }
    return before < 0.3 && turtle.breathProgress >= 0.3
  }

  const settled = Math.abs(turtle.depth - turtle.cruiseDepth) < 0.3
  if (turtle.leaving || turtle.shyTimer > 0 || !settled) return false
  turtle.breathTimer -= dt
  if (turtle.breathTimer <= 0) turtle.breathProgress = 0
  return false
}

// ── Pose ──────────────────────────────────────────────────────────────────────

export function updatePose(turtle: Turtle, time: number, dt: number): void {
  const surfacing =
    turtle.breathProgress >= 0 ? Math.min(1, Math.sin(Math.PI * turtle.breathProgress) * 1.8) : 0
  const y = mix(-turtle.depth, BREATH_SURFACE_Y, surfacing)
  const climb = dt > 0 ? (y - turtle.y) / dt : 0
  turtle.y = y

  const targetPitch = clamp(
    Math.atan2(climb, Math.max(turtle.speed, 0.5)),
    -PITCH_LIMIT,
    PITCH_LIMIT
  )
  turtle.pitch += (targetPitch - turtle.pitch) * Math.min(1, PITCH_SMOOTH * dt)

  const stroking =
    turtle.shyTimer > 0 ? 1 : smoothstep(Math.sin(time * 0.45 + turtle.seed), -0.2, 0.6)
  turtle.phase += dt * Math.PI * 2 * mix(GLIDE_FREQ, STROKE_FREQ, stroking)
}
