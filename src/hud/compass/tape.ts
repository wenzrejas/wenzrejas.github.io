import * as THREE from 'three'
import { bearingDegrees, POINT_NAMES, POINT_STEP_DEGREES } from '../north'
import { PX_PER_DEGREE, TAPE_END_DEGREES, TAPE_START_DEGREES, TICK_STEP_DEGREES } from './constants'

export interface TapeMark {
  x: number
  label: string | null
}

export function tapeOffset(heading: number): number {
  return -bearingDegrees(heading) * PX_PER_DEGREE
}

function createTapeMark(degrees: number): TapeMark {
  const turnDegrees = THREE.MathUtils.euclideanModulo(degrees, 360)
  const isPoint = turnDegrees % POINT_STEP_DEGREES === 0

  return {
    x: degrees * PX_PER_DEGREE,
    label: isPoint ? POINT_NAMES[turnDegrees / POINT_STEP_DEGREES] : null,
  }
}

export const TAPE_MARKS: TapeMark[] = []
for (let degrees = TAPE_START_DEGREES; degrees < TAPE_END_DEGREES; degrees += TICK_STEP_DEGREES) {
  TAPE_MARKS.push(createTapeMark(degrees))
}
