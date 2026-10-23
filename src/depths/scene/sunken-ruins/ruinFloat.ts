import * as THREE from 'three'
import { DEEPEST_LEVEL } from '../timeline/timeline'
import {
  RUIN_DRIFT_TURN_DEGREES,
  RUIN_DRIFT_TURN_RATE,
  RUIN_SWAY_DEGREES,
  RUIN_SWAY_RATE,
  RUIN_TILT_SWAY_SHARE,
} from './constants'
import { ruinBob, ruinPhase, ruinRotation, ruinSpot, type RuinPlacement } from './ruinLayout'

const { degToRad } = THREE.MathUtils

const SWAY = degToRad(RUIN_SWAY_DEGREES)
const DRIFT_TURN = degToRad(RUIN_DRIFT_TURN_DEGREES)

export function floatRuins(ruins: THREE.Object3D[], placements: RuinPlacement[], time: number) {
  ruins.forEach((ruin, level) => {
    const placement = placements[level]
    ruinSpot(placement, level, ruin.position)
    ruin.position.y += ruinBob(level, time)
    ruin.scale.setScalar(placement.scale)
    ruinRotation(placement, ruin.rotation)
    if (level === DEEPEST_LEVEL) return
    const phase = ruinPhase(level)
    const sway = Math.sin(time * RUIN_SWAY_RATE + phase) * SWAY
    ruin.rotation.x += sway * RUIN_TILT_SWAY_SHARE
    ruin.rotation.y += Math.sin(time * RUIN_DRIFT_TURN_RATE + phase) * DRIFT_TURN
    ruin.rotation.z += sway
  })
}
