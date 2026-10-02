import * as THREE from 'three'
import type { WakeControls } from '@/app/debug/types'
import { whirlpoolDip } from '../islands/timewell-depth/whirlpoolFunnel'
import {
  WAKE_FADE_MAX,
  WAKE_FADE_RATE,
  WAKE_INNER_MIN,
  WAKE_REVEAL_RATE,
  WAKE_TRAIL_LENGTH,
  WAKE_TRAIL_Y,
} from './constants'
import { whirlpoolCurrent } from './whirlpoolDrift'

interface TrailPoint {
  x: number
  z: number
}

export interface WakeRibbon {
  points: TrailPoint[]
  head: number
  count: number
  lastSample: TrailPoint
  isDirty: boolean
  fade: number
  wasStationary: boolean
}

const FLOATS_PER_SAMPLE = 12
const INDICES_PER_SEGMENT = 12

const _current = new THREE.Vector2()

export const createWakeRibbon = (): WakeRibbon => ({
  points: Array.from({ length: WAKE_TRAIL_LENGTH }, () => ({ x: 0, z: 0 })),
  head: 0,
  count: 0,
  lastSample: { x: Infinity, z: Infinity },
  isDirty: false,
  fade: WAKE_FADE_MAX,
  wasStationary: true,
})

const pointAt = (ribbon: WakeRibbon, index: number) =>
  ribbon.points[(ribbon.head + index) % WAKE_TRAIL_LENGTH]

export const ribbonSpan = (ribbon: WakeRibbon) =>
  (WAKE_TRAIL_LENGTH - 1) / Math.max(1, ribbon.count - 1)

function carryByWhirlpool(point: TrailPoint, dt: number): boolean {
  whirlpoolCurrent(point.x, point.z, _current)
  if (_current.x === 0 && _current.y === 0) return false
  point.x += _current.x * dt
  point.z += _current.y * dt
  return true
}

export function carryRibbon(ribbon: WakeRibbon, dt: number) {
  for (let i = 0; i < ribbon.count; i++) {
    if (carryByWhirlpool(pointAt(ribbon, i), dt)) ribbon.isDirty = true
  }
  if (isFinite(ribbon.lastSample.x)) carryByWhirlpool(ribbon.lastSample, dt)
}

export function sampleShip(
  ribbon: WakeRibbon,
  shipX: number,
  shipZ: number,
  minSampleDistance: number
): boolean {
  const sample = ribbon.lastSample
  if (Math.hypot(shipX - sample.x, shipZ - sample.z) <= minSampleDistance) return false

  ribbon.head = (ribbon.head - 1 + WAKE_TRAIL_LENGTH) % WAKE_TRAIL_LENGTH
  ribbon.points[ribbon.head].x = shipX
  ribbon.points[ribbon.head].z = shipZ
  if (ribbon.count < WAKE_TRAIL_LENGTH) ribbon.count++
  sample.x = shipX
  sample.z = shipZ
  ribbon.isDirty = true
  return true
}

export function fadeRibbon(
  ribbon: WakeRibbon,
  trail: THREE.BufferGeometry,
  hasMoved: boolean,
  dt: number
) {
  if (hasMoved) {
    if (ribbon.wasStationary) {
      if (ribbon.fade > 0 && ribbon.fade < 1) {
        const kept = Math.max(0, Math.floor((1 - ribbon.fade) * (WAKE_TRAIL_LENGTH - 1))) + 1
        ribbon.count = Math.min(ribbon.count, kept)
        trail.setDrawRange(0, Math.max(0, ribbon.count - 1) * INDICES_PER_SEGMENT)
      } else {
        ribbon.fade = 0
      }
    }
    ribbon.wasStationary = false
    ribbon.fade = Math.max(0, ribbon.fade - dt * WAKE_REVEAL_RATE)
  } else {
    ribbon.wasStationary = true
    ribbon.fade = Math.min(WAKE_FADE_MAX, ribbon.fade + dt * WAKE_FADE_RATE)
  }

  if (ribbon.fade >= WAKE_FADE_MAX && ribbon.count > 0) {
    ribbon.count = 0
    ribbon.isDirty = false
    trail.setDrawRange(0, 0)
  }
}

function writeDraped(positions: Float32Array, offset: number, x: number, z: number) {
  positions[offset] = x
  positions[offset + 1] = WAKE_TRAIL_Y - whirlpoolDip(x, z)
  positions[offset + 2] = z
}

export function writeRibbon(ribbon: WakeRibbon, trail: THREE.BufferGeometry, wake: WakeControls) {
  if (!ribbon.isDirty || ribbon.count < 2) return
  ribbon.isDirty = false

  const positions = trail.attributes.position.array as Float32Array
  const count = ribbon.count

  for (let i = 0; i < count; i++) {
    const point = pointAt(ribbon, i)
    const previous = pointAt(ribbon, Math.max(0, i - 1))
    const next = pointAt(ribbon, Math.min(count - 1, i + 1))

    const tangentX = next.x - previous.x
    const tangentZ = next.z - previous.z
    const tangentLength = Math.sqrt(tangentX * tangentX + tangentZ * tangentZ) || 1
    const perpendicularX = -tangentZ / tangentLength
    const perpendicularZ = tangentX / tangentLength

    const trailPosition = i / (WAKE_TRAIL_LENGTH - 1)
    const taper = 1 - i / Math.max(1, count - 1)
    const armWidth = wake.armNear + (wake.armFar - wake.armNear) * trailPosition
    const outer = armWidth + wake.armHalfWidth * taper
    const inner = Math.max(WAKE_INNER_MIN, armWidth - wake.armHalfWidth * taper)

    const offset = i * FLOATS_PER_SAMPLE
    writeDraped(
      positions,
      offset,
      point.x + perpendicularX * outer,
      point.z + perpendicularZ * outer
    )
    writeDraped(
      positions,
      offset + 3,
      point.x + perpendicularX * inner,
      point.z + perpendicularZ * inner
    )
    writeDraped(
      positions,
      offset + 6,
      point.x - perpendicularX * inner,
      point.z - perpendicularZ * inner
    )
    writeDraped(
      positions,
      offset + 9,
      point.x - perpendicularX * outer,
      point.z - perpendicularZ * outer
    )
  }

  trail.setDrawRange(0, (count - 1) * INDICES_PER_SEGMENT)
  trail.attributes.position.needsUpdate = true
}
