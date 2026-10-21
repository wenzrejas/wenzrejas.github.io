import * as THREE from 'three'
import { FULL_TURN } from '@/utils/math'
import { meshesOf, nodeNamed } from '@/utils/meshes'
import { PHASES, type PhaseName } from '@/world/environment/day-night-cycle/dayNightKeyframes'
import {
  CLOCK_DIAL_NODE,
  CLOCK_HOURS_AT_PHASE,
  HOUR_HAND_NODE,
  MINUTE_HAND_NODE,
} from './constants'

interface ClockHand {
  node: THREE.Object3D
  rest: THREE.Quaternion
  restTurn: number
  facing: number
}

export interface StationClock {
  hour: ClockHand
  minute: ClockHand
}

const Y_AXIS = new THREE.Vector3(0, 1, 0)
const HOUR_STOPS = (Object.keys(PHASES) as PhaseName[])
  .map((phase) => ({ t: PHASES[phase], hours: CLOCK_HOURS_AT_PHASE[phase] }))
  .sort((a, b) => a.t - b.t)
const HOUR_TRACK = [...HOUR_STOPS, { t: HOUR_STOPS[0].t + 1, hours: HOUR_STOPS[0].hours + 24 }]

const _up = new THREE.Vector3()
const _dial = new THREE.Vector3()
const _inverse = new THREE.Quaternion()
const _turn = new THREE.Quaternion()

export function clockHours(timeOfDay: number): number {
  const start = HOUR_TRACK[0].t
  const t = ((((timeOfDay - start) % 1) + 1) % 1) + start
  const next = HOUR_TRACK.findIndex((stop) => stop.t > t)
  const from = HOUR_TRACK[next - 1]
  const to = HOUR_TRACK[next]
  return THREE.MathUtils.mapLinear(t, from.t, to.t, from.hours, to.hours)
}

const clockwiseTurn = (fromX: number, fromZ: number, toX: number, toZ: number, facing: number) =>
  -facing * Math.atan2(fromZ * toX - fromX * toZ, fromX * toX + fromZ * toZ)

function findHand(
  model: THREE.Object3D,
  name: string,
  dialCentre: THREE.Vector3
): ClockHand | null {
  const node = nodeNamed(model, name)
  if (!node) return null

  const position = meshesOf(node)[0].geometry.getAttribute('position')
  let tipX = 0
  let tipZ = 0
  let depthSum = 0
  for (let i = 0; i < position.count; i++) {
    const x = position.getX(i)
    const z = position.getZ(i)
    if (x * x + z * z > tipX * tipX + tipZ * tipZ) {
      tipX = x
      tipZ = z
    }
    depthSum += position.getY(i)
  }

  _up.set(0, 1, 0).applyQuaternion(node.getWorldQuaternion(_inverse).invert())
  const dialDepth = node.worldToLocal(_dial.copy(dialCentre)).y
  const facing = Math.sign(depthSum / position.count - dialDepth)
  return {
    node,
    rest: node.quaternion.clone(),
    restTurn: clockwiseTurn(_up.x, _up.z, tipX, tipZ, facing),
    facing,
  }
}

export function findStationClock(model: THREE.Object3D): StationClock | null {
  const dial = nodeNamed(model, CLOCK_DIAL_NODE)
  if (!dial) return null

  model.updateMatrixWorld(true)
  const dialCentre = new THREE.Box3().setFromObject(dial).getCenter(new THREE.Vector3())
  const hour = findHand(model, HOUR_HAND_NODE, dialCentre)
  const minute = findHand(model, MINUTE_HAND_NODE, dialCentre)
  return hour && minute ? { hour, minute } : null
}

function poseHand(hand: ClockHand, turn: number): void {
  _turn.setFromAxisAngle(Y_AXIS, -hand.facing * (turn - hand.restTurn))
  hand.node.quaternion.copy(hand.rest).multiply(_turn)
}

export function poseStationClock(clock: StationClock, hours: number): void {
  poseHand(clock.hour, ((hours % 12) / 12) * FULL_TURN)
  poseHand(clock.minute, (hours % 1) * FULL_TURN)
}
