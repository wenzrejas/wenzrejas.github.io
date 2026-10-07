import type * as THREE from 'three'
import { turnToward } from '@/utils/math'
import {
  CLOTH_STEP_SECONDS,
  FLAG_FILL_CALM,
  FLAG_FLAP_AMPLITUDE,
  FLAG_FLAP_RATE,
  FLAG_TURN_RATE,
  LANTERN_PITCH_ANGLE,
  LANTERN_PITCH_RATE,
  LANTERN_ROLL_ANGLE,
  LANTERN_ROLL_RATE,
  MODEL_BOW_OFFSET,
  RUDDER_MAX_ANGLE,
  RUDDER_TURN_RATE,
  SAIL_FILL_CALM,
  SAIL_FILL_DEPTH,
  SAIL_RIPPLE_AMPLITUDE,
  SAIL_RIPPLE_RATE,
  WHEEL_TURNS_PER_RUDDER,
} from './constants'

export interface Cloth {
  geometry: THREE.BufferGeometry
  rest: Float32Array
  weights: Float32Array
  offsets: Float32Array
}

export interface Flag {
  node: THREE.Object3D
  cloth: Cloth
  phase: number
}

export interface ShipRig {
  rudder: THREE.Object3D | null
  wheel: THREE.Object3D | null
  rudderAngle: number
  flags: Flag[]
  sail: Cloth[]
  lantern: THREE.Object3D | null
  sinceClothStep: number
}

export const downwindYaw = (windX: number, windZ: number, heading: number) =>
  Math.atan2(-windX, -windZ) - heading - MODEL_BOW_OFFSET

export function steerHelm(rig: ShipRig, steering: number, dt: number) {
  const target = -steering * RUDDER_MAX_ANGLE
  rig.rudderAngle += (target - rig.rudderAngle) * Math.min(1, RUDDER_TURN_RATE * dt)
  if (rig.rudder) rig.rudder.rotation.y = rig.rudderAngle
  if (rig.wheel) rig.wheel.rotation.z = rig.rudderAngle * WHEEL_TURNS_PER_RUDDER
}

export function turnFlags(flags: Flag[], downwind: number, dt: number) {
  for (const { node } of flags) {
    node.rotation.y = turnToward(node.rotation.y, downwind, FLAG_TURN_RATE * dt)
  }
}

function refreshNormals(geometry: THREE.BufferGeometry) {
  const positions = geometry.getAttribute('position').array
  const normalAttribute = geometry.getAttribute('normal')
  const normals = normalAttribute.array
  const corners = geometry.index!.array
  normals.fill(0)

  for (let i = 0; i < corners.length; i += 3) {
    const first = corners[i] * 3
    const second = corners[i + 1] * 3
    const third = corners[i + 2] * 3
    const toThirdX = positions[third] - positions[second]
    const toThirdY = positions[third + 1] - positions[second + 1]
    const toThirdZ = positions[third + 2] - positions[second + 2]
    const toFirstX = positions[first] - positions[second]
    const toFirstY = positions[first + 1] - positions[second + 1]
    const toFirstZ = positions[first + 2] - positions[second + 2]
    const faceX = toThirdY * toFirstZ - toThirdZ * toFirstY
    const faceY = toThirdZ * toFirstX - toThirdX * toFirstZ
    const faceZ = toThirdX * toFirstY - toThirdY * toFirstX
    normals[first] += faceX
    normals[first + 1] += faceY
    normals[first + 2] += faceZ
    normals[second] += faceX
    normals[second + 1] += faceY
    normals[second + 2] += faceZ
    normals[third] += faceX
    normals[third + 1] += faceY
    normals[third + 2] += faceZ
  }

  for (let i = 0; i < normals.length; i += 3) {
    const length = Math.sqrt(
      normals[i] * normals[i] + normals[i + 1] * normals[i + 1] + normals[i + 2] * normals[i + 2]
    )
    const scale = 1 / (length || 1)
    normals[i] *= scale
    normals[i + 1] *= scale
    normals[i + 2] *= scale
  }
  normalAttribute.needsUpdate = true
}

function settleCloth(cloth: Cloth) {
  cloth.geometry.getAttribute('position').needsUpdate = true
  refreshNormals(cloth.geometry)
}

function waveFlag({ cloth, phase }: Flag, amplitude: number, time: number) {
  const { rest, weights, offsets } = cloth
  const positions = cloth.geometry.getAttribute('position').array as Float32Array
  for (let i = 0; i < weights.length; i++) {
    const wave = Math.sin(offsets[i] - time * FLAG_FLAP_RATE + phase)
    positions[i * 3] = rest[i * 3] + wave * weights[i] * amplitude
  }
  settleCloth(cloth)
}

function rippleSail(cloth: Cloth, amplitude: number, belly: number, time: number) {
  const { rest, weights, offsets } = cloth
  const positions = cloth.geometry.getAttribute('position').array as Float32Array
  for (let i = 0; i < weights.length; i++) {
    const wave = Math.sin(time * SAIL_RIPPLE_RATE - offsets[i])
    positions[i * 3 + 2] = rest[i * 3 + 2] + weights[i] * (wave * amplitude + belly)
  }
  settleCloth(cloth)
}

export function stepCloth(rig: ShipRig, fill: number, time: number, dt: number) {
  rig.sinceClothStep += dt
  if (rig.sinceClothStep < CLOTH_STEP_SECONDS) return
  rig.sinceClothStep %= CLOTH_STEP_SECONDS

  const flapAmplitude = FLAG_FLAP_AMPLITUDE * (1 - fill * FLAG_FILL_CALM)
  for (const flag of rig.flags) waveFlag(flag, flapAmplitude, time)

  const rippleAmplitude = SAIL_RIPPLE_AMPLITUDE * (1 - fill * SAIL_FILL_CALM)
  const belly = fill * SAIL_FILL_DEPTH
  for (const cloth of rig.sail) rippleSail(cloth, rippleAmplitude, belly, time)
}

export function swayLantern(lantern: THREE.Object3D, time: number) {
  lantern.rotation.x = Math.sin(time * LANTERN_PITCH_RATE) * LANTERN_PITCH_ANGLE
  lantern.rotation.z = Math.sin(time * LANTERN_ROLL_RATE) * LANTERN_ROLL_ANGLE
}
