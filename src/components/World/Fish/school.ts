import * as THREE from 'three'
import { rand, turnToward } from '../../../utils/math'
import { ISLAND_ZONES, shoreGap } from '../Islands/islandZones'
import {
  BOOST_DECAY,
  CATCHUP_SPEED,
  CRUISE_DEPTH_MAX,
  CRUISE_DEPTH_MIN,
  DIVE_RATE,
  FISH_SIZE_JITTER,
  ESCAPE_BOOST,
  FLEE_DAMPING,
  FLEE_DURATION,
  FLEE_SPEED,
  FLEE_SPREAD,
  FLEE_TAIL_FREQ,
  FOLLOW_RATE,
  HEADING_RATE,
  HIDDEN_DEPTH,
  LIFETIME_MAX,
  LIFETIME_MIN,
  LONE_FISH_SIZE,
  LONE_SPEED,
  RISE_RATE,
  SCATTER_DIVE_CHANCE,
  SCHOOL_CHANCE,
  SCHOOL_FISH_SIZE,
  SCHOOL_MAX,
  SCHOOL_MIN,
  SCHOOL_SPEED,
  SCHOOL_SPREAD,
  SHORE_AVOID_DISTANCE,
  SHORE_AVOID_RATE,
  SPEED_JITTER,
  TAIL_FREQ,
  WANDER_RATE,
} from './constants'

interface FishState {
  x: number
  z: number
  vx: number
  vz: number
  heading: number
  depth: number
  targetDepth: number
  phase: number
  tailFreq: number
  size: number
  slotX: number
  slotZ: number
  seed: number
}

export interface School {
  x: number
  z: number
  heading: number
  speed: number
  boost: number
  seed: number
  age: number
  lifetime: number
  leaving: boolean
  fleeTimer: number
  fish: FishState[]
}

const _slot = new THREE.Vector2()

function createFish(slotX: number, slotZ: number, size: number, heading: number): FishState {
  return {
    x: 0,
    z: 0,
    vx: 0,
    vz: 0,
    heading,
    depth: HIDDEN_DEPTH,
    targetDepth: rand(CRUISE_DEPTH_MIN, CRUISE_DEPTH_MAX),
    phase: Math.random() * Math.PI * 2,
    tailFreq: TAIL_FREQ * rand(0.8, 1.2),
    size: size * rand(1 - FISH_SIZE_JITTER, 1 + FISH_SIZE_JITTER),
    slotX,
    slotZ,
    seed: Math.random() * 100,
  }
}

export function createSchool(x: number, z: number, freeSlots: number): School {
  const heading = Math.random() * Math.PI * 2
  const isSchool = Math.random() < SCHOOL_CHANCE && freeSlots >= SCHOOL_MIN
  let fish: FishState[]

  if (isSchool) {
    const count = Math.min(freeSlots, Math.floor(rand(SCHOOL_MIN, SCHOOL_MAX + 1)))
    fish = Array.from({ length: count }, () => {
      const angle = Math.random() * Math.PI * 2
      const radius = SCHOOL_SPREAD * Math.sqrt(Math.random())
      return createFish(
        Math.cos(angle) * radius,
        Math.sin(angle) * radius * 1.4,
        SCHOOL_FISH_SIZE,
        heading
      )
    })
  } else {
    fish = [createFish(0, 0, LONE_FISH_SIZE, heading)]
    if (Math.random() < 0.4 && freeSlots >= 2) {
      fish.push(createFish(rand(-3, 3), -rand(3, 6), LONE_FISH_SIZE, heading))
    }
  }

  const school: School = {
    x,
    z,
    heading,
    speed: (isSchool ? SCHOOL_SPEED : LONE_SPEED) + rand(-SPEED_JITTER, SPEED_JITTER),
    boost: 0,
    seed: Math.random() * 100,
    age: 0,
    lifetime: rand(LIFETIME_MIN, LIFETIME_MAX),
    leaving: false,
    fleeTimer: 0,
    fish,
  }

  for (const f of fish) {
    slotPosition(school, f, 0)
    f.x = _slot.x
    f.z = _slot.y
  }
  return school
}

function slotPosition(school: School, fish: FishState, time: number): THREE.Vector2 {
  const dirX = Math.sin(school.heading)
  const dirZ = Math.cos(school.heading)
  const slotX = fish.slotX + Math.sin(time * 0.8 + fish.seed) * 1.2
  return _slot.set(
    school.x + dirZ * slotX + dirX * fish.slotZ,
    school.z - dirX * slotX + dirZ * fish.slotZ
  )
}

const schoolSpeed = (school: School) => school.speed + school.boost

export function leave(school: School): void {
  school.leaving = true
  for (const fish of school.fish) fish.targetDepth = HIDDEN_DEPTH
}

export function scatter(school: School, shipX: number, shipZ: number): void {
  school.fleeTimer = FLEE_DURATION
  for (const fish of school.fish) {
    const away = Math.atan2(fish.x - shipX, fish.z - shipZ) + rand(-FLEE_SPREAD, FLEE_SPREAD)
    const speed = FLEE_SPEED * rand(0.7, 1.1)
    fish.vx = Math.sin(away) * speed
    fish.vz = Math.cos(away) * speed
  }
}

export function regroup(school: School, shipX: number, shipZ: number): void {
  school.x = school.fish.reduce((sum, member) => sum + member.x, 0) / school.fish.length
  school.z = school.fish.reduce((sum, member) => sum + member.z, 0) / school.fish.length
  school.heading = Math.atan2(school.x - shipX, school.z - shipZ)
  school.boost = ESCAPE_BOOST
  if (!school.leaving && Math.random() < SCATTER_DIVE_CHANCE) leave(school)
}

export function steerSchool(school: School, time: number, dt: number): void {
  school.heading += Math.sin(time * 0.3 + school.seed) * WANDER_RATE * dt
  for (const zone of ISLAND_ZONES) {
    if (shoreGap(zone, school.x, school.z) < SHORE_AVOID_DISTANCE) {
      const away = Math.atan2(school.x - zone.x, school.z - zone.z)
      school.heading = turnToward(school.heading, away, SHORE_AVOID_RATE * dt)
    }
  }
  school.boost *= Math.exp(-BOOST_DECAY * dt)
  school.x += Math.sin(school.heading) * schoolSpeed(school) * dt
  school.z += Math.cos(school.heading) * schoolSpeed(school) * dt
}

export function updateFish(school: School, fish: FishState, time: number, dt: number): void {
  const fleeing = school.fleeTimer > 0
  const speed = schoolSpeed(school)

  if (fleeing) {
    const damping = Math.exp(-FLEE_DAMPING * dt)
    fish.vx *= damping
    fish.vz *= damping
  } else {
    const target = slotPosition(school, fish, time)
    const catchupX = (target.x - fish.x) * FOLLOW_RATE
    const catchupZ = (target.y - fish.z) * FOLLOW_RATE
    const catchup = Math.min(1, CATCHUP_SPEED / Math.max(Math.hypot(catchupX, catchupZ), 1e-3))
    fish.vx = Math.sin(school.heading) * speed + catchupX * catchup
    fish.vz = Math.cos(school.heading) * speed + catchupZ * catchup
  }

  fish.x += fish.vx * dt
  fish.z += fish.vz * dt
  if (Math.hypot(fish.vx, fish.vz) > 0.3) {
    fish.heading = turnToward(fish.heading, Math.atan2(fish.vx, fish.vz), HEADING_RATE * dt)
  }

  const depthRate = fish.targetDepth < fish.depth ? RISE_RATE : DIVE_RATE
  fish.depth += THREE.MathUtils.clamp(
    fish.targetDepth - fish.depth,
    -depthRate * dt,
    depthRate * dt
  )
  fish.phase +=
    dt * Math.PI * 2 * (fleeing ? FLEE_TAIL_FREQ : (fish.tailFreq * speed) / school.speed)
}
