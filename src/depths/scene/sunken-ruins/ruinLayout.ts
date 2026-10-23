import * as THREE from 'three'
import { DEEPEST_LEVEL, levelSpot } from '../timeline/timeline'
import { CLOCK_PLAZA_SPOT, RUIN_BOB_HEIGHT, RUIN_BOB_RATE, RUIN_PHASE_STEP } from './constants'

export interface RuinPlacement {
  offsetX: number
  offsetY: number
  offsetZ: number
  tilt: number
  turn: number
  lean: number
  scale: number
}

const { degToRad } = THREE.MathUtils

const UP = new THREE.Vector3(0, 1, 0)

const _clockSpot = new THREE.Vector3()
const _clockRotation = new THREE.Euler()
const _plazaNormal = new THREE.Vector3()

export function ruinSpot(
  { offsetX, offsetY, offsetZ }: RuinPlacement,
  level: number,
  out: THREE.Vector3
) {
  levelSpot(level, out)
  out.x += offsetX
  out.y += offsetY
  out.z += offsetZ
  return out
}

export const ruinRotation = ({ tilt, turn, lean }: RuinPlacement, out: THREE.Euler) =>
  out.set(degToRad(tilt), degToRad(turn), degToRad(lean), 'XYZ')

export const ruinPhase = (level: number) => level * RUIN_PHASE_STEP

export const ruinBob = (level: number, time: number) =>
  Math.sin(time * RUIN_BOB_RATE + ruinPhase(level)) * RUIN_BOB_HEIGHT

export function clockLandingSpot(
  clockRuin: RuinPlacement,
  keelDepth: number,
  time: number,
  out: THREE.Vector3
) {
  const rotation = ruinRotation(clockRuin, _clockRotation)
  out.fromArray(CLOCK_PLAZA_SPOT).multiplyScalar(clockRuin.scale).applyEuler(rotation)
  out.add(ruinSpot(clockRuin, DEEPEST_LEVEL, _clockSpot))
  out.addScaledVector(_plazaNormal.copy(UP).applyEuler(rotation), keelDepth)
  out.y += ruinBob(DEEPEST_LEVEL, time)
  return out
}
