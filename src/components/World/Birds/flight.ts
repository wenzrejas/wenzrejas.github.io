import * as THREE from 'three'
import { mix, rand } from '../../../utils/math'
import { CAMERA_OFFSET } from '../../Experience/constants'
import {
  ALTITUDE_MAX,
  ALTITUDE_MIN,
  BIRD_SIZE_JITTER,
  BIRD_SPAN,
  FLAP_AMP,
  FLAP_BLEND_RATE,
  FLAP_FREQ,
  FLAP_TIME_MAX,
  FLAP_TIME_MIN,
  FLIGHT_LANE,
  FLIGHT_RADIUS,
  FLIGHT_SPEED,
  FLIGHT_SPEED_JITTER,
  FLOCK_CHANCE,
  FLOCK_MAX,
  FLOCK_MIN,
  FLOCK_SPACING,
  GLIDE_LIFT,
  GLIDE_TIME_MAX,
  GLIDE_TIME_MIN,
  TURN_RATE,
} from './constants'

interface Bird {
  offsetX: number
  offsetY: number
  offsetZ: number
  size: number
  phase: number
  flapRate: number
  flapping: boolean
  timer: number
  blend: number
  bobPhase: number
}

export interface Flight {
  x: number
  z: number
  y: number
  heading: number
  turn: number
  speed: number
  travelled: number
  birds: Bird[]
}

function createBird(offsetX: number, offsetY: number, offsetZ: number): Bird {
  const flapping = Math.random() < 0.5
  return {
    offsetX,
    offsetY,
    offsetZ,
    size: BIRD_SPAN * rand(1 - BIRD_SIZE_JITTER, 1 + BIRD_SIZE_JITTER),
    phase: Math.random() * Math.PI * 2,
    flapRate: FLAP_FREQ * rand(0.85, 1.15),
    flapping,
    timer: flapping ? rand(FLAP_TIME_MIN, FLAP_TIME_MAX) : rand(GLIDE_TIME_MIN, GLIDE_TIME_MAX),
    blend: flapping ? 1 : 0,
    bobPhase: Math.random() * Math.PI * 2,
  }
}

function createFormation(freeSlots: number): Bird[] {
  if (Math.random() < FLOCK_CHANCE && freeSlots >= FLOCK_MIN) {
    const count = Math.min(freeSlots, Math.floor(rand(FLOCK_MIN, FLOCK_MAX + 1)))
    return Array.from({ length: count }, (_, i) => {
      const side = i % 2 === 0 ? -1 : 1
      const rank = Math.ceil(i / 2)
      return createBird(
        side * rank * FLOCK_SPACING * 0.8 + rand(-2, 2),
        rand(-2, 2),
        -rank * FLOCK_SPACING * 0.7 + rand(-2.5, 2.5)
      )
    })
  }

  const birds = [createBird(0, 0, 0)]
  if (Math.random() < 0.5 && freeSlots >= 2) {
    birds.push(createBird(rand(3, 6) * Math.sign(Math.random() - 0.5), rand(-2, 2), -rand(2, 6)))
  }
  return birds
}

export function createFlight(originX: number, originZ: number, freeSlots: number): Flight {
  const heading = Math.random() * Math.PI * 2
  const dirX = Math.sin(heading)
  const dirZ = Math.cos(heading)
  const lane = rand(-FLIGHT_LANE, FLIGHT_LANE)
  const altitude = rand(ALTITUDE_MIN, ALTITUDE_MAX)
  const midHeight = altitude / 2
  const centerX = originX + (midHeight * CAMERA_OFFSET[0]) / CAMERA_OFFSET[1]
  const centerZ = originZ + (midHeight * CAMERA_OFFSET[2]) / CAMERA_OFFSET[1]

  return {
    x: centerX - dirX * FLIGHT_RADIUS + dirZ * lane,
    z: centerZ - dirZ * FLIGHT_RADIUS - dirX * lane,
    y: altitude,
    heading,
    turn: rand(-TURN_RATE, TURN_RATE),
    speed: FLIGHT_SPEED + rand(-FLIGHT_SPEED_JITTER, FLIGHT_SPEED_JITTER),
    travelled: 0,
    birds: createFormation(freeSlots),
  }
}

export function updateWings(bird: Bird, dt: number): number {
  bird.timer -= dt
  if (bird.timer <= 0) {
    bird.flapping = !bird.flapping
    bird.timer = bird.flapping
      ? rand(FLAP_TIME_MIN, FLAP_TIME_MAX)
      : rand(GLIDE_TIME_MIN, GLIDE_TIME_MAX)
  }

  const target = bird.flapping ? 1 : 0
  bird.blend += THREE.MathUtils.clamp(
    target - bird.blend,
    -FLAP_BLEND_RATE * dt,
    FLAP_BLEND_RATE * dt
  )
  bird.phase += dt * bird.flapRate * Math.PI * 2

  return mix(GLIDE_LIFT, Math.sin(bird.phase) * FLAP_AMP, bird.blend)
}
