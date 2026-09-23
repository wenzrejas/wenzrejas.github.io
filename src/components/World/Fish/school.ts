import * as THREE from 'three'
import { useWhaleStore } from '../../../store/whaleStore'
import { rand, turnToward } from '../../../utils/math'
import { ISLAND_ZONES, shoreGap } from '../Islands/islandZones'
import { runChance } from './habitat'
import {
  BOOST_DECAY,
  CATCHUP_SPEED,
  CRUISE_DEPTH_MAX,
  CRUISE_DEPTH_MIN,
  DIVE_RATE,
  FIN_REACH,
  FISH_SIZE_JITTER,
  ESCAPE_BOOST,
  FLEE_DAMPING,
  FLEE_DURATION,
  FLEE_SPEED,
  FLEE_SPREAD,
  FLEE_TURN_RATE,
  FLEE_TURN_LIMIT,
  FLEE_TAIL_FREQ,
  FOLLOW_RATE,
  HEADING_RATE,
  HIDDEN_DEPTH,
  LIFETIME_MAX,
  LIFETIME_MIN,
  LONE_FISH_SIZE,
  LONE_SPEED,
  RISE_RATE,
  RUN_FISH_SIZE,
  RUN_LENGTH,
  RUN_MAX,
  RUN_MIN,
  RUN_SPEED,
  RUN_SPREAD,
  SCATTER_DIVE_CHANCE,
  SCATTER_RADIUS,
  SCHOOL_CHANCE,
  SCHOOL_FISH_SIZE,
  SCHOOL_LENGTH,
  SCHOOL_MAX,
  SCHOOL_MIN,
  SCHOOL_SPEED,
  SCHOOL_SPREAD,
  SHORE_AVOID_DISTANCE,
  SHORE_AVOID_RATE,
  SPEED_JITTER,
  SURFACE_CLEARANCE,
  TAIL_FREQ,
  WANDER_RATE,
  WHALE_SCATTER_MARGIN,
} from './constants'

interface FishState {
  x: number
  z: number
  vx: number
  vz: number
  fleeHeading: number
  fleeSpeed: number
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
  kind: Shoal
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
  fleeFromX: number
  fleeFromZ: number
  fish: FishState[]
}

export type Shoal = 'run' | 'school' | 'lone'

const SHOAL_SPEEDS: Record<Shoal, number> = {
  run: RUN_SPEED,
  school: SCHOOL_SPEED,
  lone: LONE_SPEED,
}

const _slot = new THREE.Vector2()

function createFish(slotX: number, slotZ: number, size: number, heading: number): FishState {
  const scale = size * rand(1 - FISH_SIZE_JITTER, 1 + FISH_SIZE_JITTER)
  return {
    x: 0,
    z: 0,
    vx: 0,
    vz: 0,
    fleeHeading: heading,
    fleeSpeed: 0,
    heading,
    depth: HIDDEN_DEPTH,
    targetDepth: Math.max(
      rand(CRUISE_DEPTH_MIN, CRUISE_DEPTH_MAX),
      scale * FIN_REACH + SURFACE_CLEARANCE
    ),
    phase: Math.random() * Math.PI * 2,
    tailFreq: TAIL_FREQ * rand(0.8, 1.2),
    size: scale,
    slotX,
    slotZ,
    seed: Math.random() * 100,
  }
}

function shoalKind(x: number, z: number, freeSlots: number): Shoal {
  const roll = Math.random()
  if (roll < runChance(x, z) && freeSlots >= RUN_MIN) return 'run'
  if (roll < SCHOOL_CHANCE && freeSlots >= SCHOOL_MIN) return 'school'
  return 'lone'
}

function cluster(
  count: number,
  spread: number,
  stretch: number,
  size: number,
  heading: number
): FishState[] {
  return Array.from({ length: count }, () => {
    const angle = Math.random() * Math.PI * 2
    const radius = spread * Math.sqrt(Math.random())
    return createFish(Math.cos(angle) * radius, Math.sin(angle) * radius * stretch, size, heading)
  })
}

export function createSchool(x: number, z: number, freeSlots: number): School {
  const heading = Math.random() * Math.PI * 2
  const kind = shoalKind(x, z, freeSlots)
  let fish: FishState[]

  if (kind === 'run') {
    const count = Math.min(freeSlots, Math.floor(rand(RUN_MIN, RUN_MAX + 1)))
    fish = cluster(count, RUN_SPREAD, RUN_LENGTH, RUN_FISH_SIZE, heading)
  } else if (kind === 'school') {
    const count = Math.min(freeSlots, Math.floor(rand(SCHOOL_MIN, SCHOOL_MAX + 1)))
    fish = cluster(count, SCHOOL_SPREAD, SCHOOL_LENGTH, SCHOOL_FISH_SIZE, heading)
  } else {
    fish = [createFish(0, 0, LONE_FISH_SIZE, heading)]
    if (Math.random() < 0.4 && freeSlots >= 2) {
      fish.push(createFish(rand(-3, 3), -rand(3, 6), LONE_FISH_SIZE, heading))
    }
  }

  const school: School = {
    kind,
    x,
    z,
    heading,
    speed: SHOAL_SPEEDS[kind] + rand(-SPEED_JITTER, SPEED_JITTER),
    boost: 0,
    seed: Math.random() * 100,
    age: 0,
    lifetime: rand(LIFETIME_MIN, LIFETIME_MAX),
    leaving: false,
    fleeTimer: 0,
    fleeFromX: 0,
    fleeFromZ: 0,
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

function startled(school: School, x: number, z: number, radius: number): boolean {
  return school.fish.some(
    (fish) => fish.depth < HIDDEN_DEPTH && Math.hypot(fish.x - x, fish.z - z) < radius
  )
}

export function scatterFromThreats(school: School, shipX: number, shipZ: number): void {
  if (school.kind !== 'run' && startled(school, shipX, shipZ, SCATTER_RADIUS)) {
    scatter(school, shipX, shipZ)
    return
  }

  const whale = useWhaleStore.getState()
  if (whale.active && startled(school, whale.x, whale.z, whale.radius + WHALE_SCATTER_MARGIN)) {
    scatter(school, whale.x, whale.z)
  }
}

function scatter(school: School, threatX: number, threatZ: number): void {
  school.fleeTimer = FLEE_DURATION
  school.fleeFromX = threatX
  school.fleeFromZ = threatZ
  for (const fish of school.fish) {
    const away = Math.atan2(fish.x - threatX, fish.z - threatZ) + rand(-FLEE_SPREAD, FLEE_SPREAD)
    fish.fleeHeading = turnToward(fish.heading, away, FLEE_TURN_LIMIT)
    fish.fleeSpeed = FLEE_SPEED * rand(0.7, 1.1)
  }
}

export function regroup(school: School): void {
  school.x = school.fish.reduce((sum, member) => sum + member.x, 0) / school.fish.length
  school.z = school.fish.reduce((sum, member) => sum + member.z, 0) / school.fish.length
  school.heading = Math.atan2(school.x - school.fleeFromX, school.z - school.fleeFromZ)
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
    fish.heading = turnToward(fish.heading, fish.fleeHeading, FLEE_TURN_RATE * dt)
    fish.fleeSpeed *= Math.exp(-FLEE_DAMPING * dt)
    fish.vx = Math.sin(fish.heading) * fish.fleeSpeed
    fish.vz = Math.cos(fish.heading) * fish.fleeSpeed
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
  if (!fleeing && Math.hypot(fish.vx, fish.vz) > 0.3) {
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
