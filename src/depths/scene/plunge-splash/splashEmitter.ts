import type * as THREE from 'three'
import { mix, rand } from '@/utils/math'
import { pointPixelScale } from '@/utils/screen'
import type { WallClock } from '@/utils/time'
import {
  BUBBLE_ABOVE_SHIP,
  BUBBLE_BELOW_SHIP,
  BUBBLE_BURST_MAX,
  BUBBLE_BURST_MIN,
  BUBBLE_BURST_UP_SHARE,
  BUBBLE_CAPACITY,
  BUBBLE_FORWARD_SHIFT,
  BUBBLE_LIFE_MAX,
  BUBBLE_LIFE_MIN,
  BUBBLE_RISE_MAX,
  BUBBLE_RISE_MIN,
  BUBBLE_SIZE_MAX,
  BUBBLE_SIZE_MIN,
  BUBBLE_SIZE_SKEW,
  BUBBLE_SPREAD_ACROSS,
  BUBBLE_WAKE_CARRY,
  BUBBLES_PER_SECOND,
  BUBBLES_PER_UNIT_FALLEN,
  FOAM_ABOVE_SHIP,
  FOAM_BELOW_SHIP,
  FOAM_BURST_MAX,
  FOAM_BURST_MIN,
  FOAM_CAPACITY,
  FOAM_END_SIZE_MAX,
  FOAM_END_SIZE_MIN,
  FOAM_FORWARD_SHIFT,
  FOAM_LIFE_MAX,
  FOAM_LIFE_MIN,
  FOAM_PER_SECOND,
  FOAM_PER_UNIT_FALLEN,
  FOAM_SPREAD_ACROSS,
  FOAM_START_SIZE_MAX,
  FOAM_START_SIZE_MIN,
  FOAM_WAKE_CARRY,
} from './constants'

export interface SprayLayer {
  capacity: number
  owedParticles: number
  nextSlot: number
  lastPopTime: number
}

export interface SplashEmitter {
  lastShipY: number | null
  foam: SprayLayer
  bubbles: SprayLayer
}

interface SplashSource {
  spot: THREE.Vector3
  sinkSpeed: number
  time: number
}

interface SpawnBand {
  across: number
  below: number
  above: number
  forward: number
}

type Release = (geometry: THREE.BufferGeometry, slot: number, source: SplashSource) => number

const FOAM_BAND: SpawnBand = {
  across: FOAM_SPREAD_ACROSS,
  below: FOAM_BELOW_SHIP,
  above: FOAM_ABOVE_SHIP,
  forward: FOAM_FORWARD_SHIFT,
}

const BUBBLE_BAND: SpawnBand = {
  across: BUBBLE_SPREAD_ACROSS,
  below: BUBBLE_BELOW_SHIP,
  above: BUBBLE_ABOVE_SHIP,
  forward: BUBBLE_FORWARD_SHIFT,
}

const createSprayLayer = (capacity: number): SprayLayer => ({
  capacity,
  owedParticles: 0,
  nextSlot: 0,
  lastPopTime: 0,
})

export const createSplashEmitter = (): SplashEmitter => ({
  lastShipY: null,
  foam: createSprayLayer(FOAM_CAPACITY),
  bubbles: createSprayLayer(BUBBLE_CAPACITY),
})

function placeAroundShip(
  geometry: THREE.BufferGeometry,
  slot: number,
  spot: THREE.Vector3,
  { across, below, above, forward }: SpawnBand
) {
  const angle = Math.random() * Math.PI * 2
  const reach = Math.sqrt(Math.random()) * across
  geometry.attributes.position.setXYZ(
    slot,
    spot.x + Math.cos(angle) * reach,
    spot.y + rand(-below, above),
    spot.z + Math.sin(angle) * reach + forward
  )
  return angle
}

function releaseFoam(geometry: THREE.BufferGeometry, slot: number, source: SplashSource) {
  const { velocity, birth, traits } = geometry.attributes
  const angle = placeAroundShip(geometry, slot, source.spot, FOAM_BAND)
  const burst = rand(FOAM_BURST_MIN, FOAM_BURST_MAX)
  const life = rand(FOAM_LIFE_MIN, FOAM_LIFE_MAX)
  velocity.setXYZ(
    slot,
    Math.cos(angle) * burst,
    -source.sinkSpeed * FOAM_WAKE_CARRY,
    Math.sin(angle) * burst
  )
  birth.setX(slot, source.time)
  traits.setXYZW(
    slot,
    rand(FOAM_START_SIZE_MIN, FOAM_START_SIZE_MAX),
    rand(FOAM_END_SIZE_MIN, FOAM_END_SIZE_MAX),
    life,
    Math.random()
  )
  return life
}

function releaseBubble(geometry: THREE.BufferGeometry, slot: number, source: SplashSource) {
  const { velocity, birth, traits } = geometry.attributes
  const angle = placeAroundShip(geometry, slot, source.spot, BUBBLE_BAND)
  const burst = rand(BUBBLE_BURST_MIN, BUBBLE_BURST_MAX)
  const sizeShare = Math.random() ** BUBBLE_SIZE_SKEW
  const life = rand(BUBBLE_LIFE_MIN, BUBBLE_LIFE_MAX)
  velocity.setXYZ(
    slot,
    Math.cos(angle) * burst,
    rand(-1, 1) * burst * BUBBLE_BURST_UP_SHARE - source.sinkSpeed * BUBBLE_WAKE_CARRY,
    Math.sin(angle) * burst
  )
  birth.setX(slot, source.time)
  traits.setXYZW(
    slot,
    mix(BUBBLE_SIZE_MIN, BUBBLE_SIZE_MAX, sizeShare),
    life,
    mix(BUBBLE_RISE_MIN, BUBBLE_RISE_MAX, sizeShare),
    Math.random()
  )
  return life
}

function spray(
  layer: SprayLayer,
  geometry: THREE.BufferGeometry,
  amount: number,
  release: Release,
  source: SplashSource
) {
  layer.owedParticles += amount
  if (layer.owedParticles < 1) return
  while (layer.owedParticles >= 1) {
    layer.owedParticles -= 1
    const life = release(geometry, layer.nextSlot, source)
    layer.nextSlot = (layer.nextSlot + 1) % layer.capacity
    layer.lastPopTime = Math.max(layer.lastPopTime, source.time + life)
  }
  for (const attribute of Object.values(geometry.attributes)) attribute.needsUpdate = true
}

export function emitSplash(
  emitter: SplashEmitter,
  foamGeometry: THREE.BufferGeometry,
  bubbleGeometry: THREE.BufferGeometry,
  shipSpot: THREE.Vector3,
  plunge: number,
  { delta, elapsed }: WallClock
) {
  const fall = emitter.lastShipY === null ? 0 : Math.max(emitter.lastShipY - shipSpot.y, 0)
  emitter.lastShipY = shipSpot.y
  const isPlunging = plunge > 0 && plunge < 1
  if (!isPlunging || delta <= 0) return
  const source = { spot: shipSpot, sinkSpeed: fall / delta, time: elapsed }
  const foamAmount = fall * FOAM_PER_UNIT_FALLEN + delta * FOAM_PER_SECOND
  const bubbleAmount = fall * BUBBLES_PER_UNIT_FALLEN + delta * BUBBLES_PER_SECOND
  spray(emitter.foam, foamGeometry, foamAmount, releaseFoam, source)
  spray(emitter.bubbles, bubbleGeometry, bubbleAmount, releaseBubble, source)
}

export function shadeSpray(
  points: THREE.Points,
  layer: SprayLayer,
  plunge: number,
  camera: THREE.PerspectiveCamera,
  drawingHeight: number,
  time: number
) {
  points.visible = plunge < 1 || time < layer.lastPopTime
  const { uniforms } = points.material as THREE.ShaderMaterial
  uniforms.uTime.value = time
  uniforms.uPixelScale.value = pointPixelScale(camera, drawingHeight)
}
