import * as THREE from 'three'
import { FULL_TURN } from '@/utils/math'
import { boundsIn, meshesOf } from '@/utils/meshes'
import {
  BEE_BOB,
  BEE_BOB_RATE,
  BEE_CLEARANCE,
  BEE_COUNT,
  BEE_EMERGE_SECONDS,
  BEE_EMERGE_STAGGER_SECONDS,
  BEE_EXIT_REACH,
  BEE_FACING_SECONDS,
  BEE_HIDE_SHARE,
  BEE_LOOP_RATE,
  BEE_LOOP_REACH,
  BEE_RETURN_SECONDS,
  BEE_TRAIL_DOTS,
  BEE_TRAIL_SPACING_SECONDS,
  HIVE_WINDOW_ROLE,
} from './constants'

interface HiveExit {
  window: THREE.Vector3
  climb: THREE.Vector3
}

export interface BeeFlight {
  exits: HiveExit[]
  centre: THREE.Vector3
}

export interface SwarmBuffers {
  bees: Float32Array
  previous: Float32Array
  beeFades: Float32Array
  trail: Float32Array
  trailFades: Float32Array
}

export interface SwarmState {
  isOut: boolean
  phaseSeconds: number
  seconds: number
  out: Float32Array
  outRate: Float32Array
}

const { clamp, smoothstep } = THREE.MathUtils
const _loop = new THREE.Vector3()
const _bee = new THREE.Vector3()

export function findBeeFlight(model: THREE.Object3D, monument: THREE.Object3D): BeeFlight | null {
  model.updateMatrixWorld(true)
  const windows: THREE.Vector3[] = []
  model.traverse((node) => {
    if (node.userData.role === HIVE_WINDOW_ROLE) {
      windows.push(boundsIn(model, meshesOf(node)).getCenter(new THREE.Vector3()))
    }
  })
  if (windows.length === 0 || !monument.parent) return null

  const hive = windows.reduce((sum, window) => sum.add(window), new THREE.Vector3())
  hive.divideScalar(windows.length)
  const altitude = boundsIn(model, meshesOf(monument.parent)).max.y + BEE_CLEARANCE
  const centre = boundsIn(model, meshesOf(monument)).getCenter(new THREE.Vector3()).lerp(hive, 0.5)
  centre.y = altitude

  const exits = windows.map((window) => {
    const outward = new THREE.Vector3(window.x - hive.x, 0, window.z - hive.z).normalize()
    const climb = window.clone().addScaledVector(outward, BEE_EXIT_REACH)
    climb.y = altitude
    return { window, climb }
  })
  return { exits, centre }
}

const easeOut = (share: number) => 1 - (1 - share) ** 3

function emergeAlong(
  { window, climb }: HiveExit,
  loop: THREE.Vector3,
  share: number,
  out: THREE.Vector3
) {
  const rest = 1 - share
  return out
    .copy(window)
    .multiplyScalar(rest * rest)
    .addScaledVector(climb, 2 * rest * share)
    .addScaledVector(loop, share * share)
}

export const createSwarmState = (): SwarmState => ({
  isOut: false,
  phaseSeconds: 0,
  seconds: 0,
  out: new Float32Array(BEE_COUNT),
  outRate: new Float32Array(BEE_COUNT),
})

export const hasBeesOut = (state: SwarmState) => state.out.some((share) => share > 0)

export function stepSwarm(state: SwarmState, isOut: boolean, dt: number): void {
  if (isOut !== state.isOut) {
    state.isOut = isOut
    state.phaseSeconds = 0
  }
  state.phaseSeconds += dt
  state.seconds += dt
  const step = dt / (isOut ? BEE_EMERGE_SECONDS : BEE_RETURN_SECONDS)
  for (let bee = 0; bee < BEE_COUNT; bee++) {
    const previous = state.out[bee]
    if (state.phaseSeconds >= bee * BEE_EMERGE_STAGGER_SECONDS) {
      state.out[bee] = clamp(previous + (isOut ? step : -step), 0, 1)
    }
    state.outRate[bee] = dt > 0 ? (state.out[bee] - previous) / dt : 0
  }
}

function placeBee(
  flight: BeeFlight,
  bee: number,
  seconds: number,
  share: number,
  out: THREE.Vector3
): void {
  const angle = (seconds * BEE_LOOP_RATE + bee / BEE_COUNT) * FULL_TURN
  const sin = Math.sin(angle)
  const cos = Math.cos(angle)
  const spread = 1 + sin * sin
  _loop.set(
    flight.centre.x + (cos / spread) * BEE_LOOP_REACH,
    flight.centre.y + Math.sin(seconds * BEE_BOB_RATE + bee) * BEE_BOB,
    flight.centre.z + ((sin * cos) / spread) * BEE_LOOP_REACH
  )
  emergeAlong(flight.exits[(bee * 3) % flight.exits.length], _loop, easeOut(share), out)
}

const sharePast = (state: SwarmState, bee: number, lagSeconds: number) =>
  clamp(state.out[bee] - lagSeconds * state.outRate[bee], 0, 1)

export function flySwarm(flight: BeeFlight, state: SwarmState, buffers: SwarmBuffers): void {
  for (let bee = 0; bee < BEE_COUNT; bee++) {
    const share = state.out[bee]
    placeBee(flight, bee, state.seconds, share, _bee)
    _bee.toArray(buffers.bees, bee * 3)
    const facingShare = sharePast(state, bee, BEE_FACING_SECONDS)
    placeBee(flight, bee, state.seconds - BEE_FACING_SECONDS, facingShare, _bee)
    _bee.toArray(buffers.previous, bee * 3)
    buffers.beeFades[bee] = smoothstep(share, 0, BEE_HIDE_SHARE)

    for (let dot = 0; dot < BEE_TRAIL_DOTS; dot++) {
      const slot = bee * BEE_TRAIL_DOTS + dot
      const lag = (dot + 1) * BEE_TRAIL_SPACING_SECONDS
      const dotShare = sharePast(state, bee, lag)
      placeBee(flight, bee, state.seconds - lag, dotShare, _bee)
      _bee.toArray(buffers.trail, slot * 3)
      buffers.trailFades[slot] =
        smoothstep(dotShare, 0, BEE_HIDE_SHARE) * (1 - (dot + 1) / (BEE_TRAIL_DOTS + 1))
    }
  }
}
