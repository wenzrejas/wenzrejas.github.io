import * as THREE from 'three'
import { COMPASS_COPY } from '@/data/hudCopy'
import { SPAWN_HEADING } from '../store/shipStore'

const NORTH_HEADING = SPAWN_HEADING

export const NORTH_DIRECTION = new THREE.Vector2(Math.sin(NORTH_HEADING), Math.cos(NORTH_HEADING))
export const EAST_DIRECTION = new THREE.Vector2(-NORTH_DIRECTION.y, NORTH_DIRECTION.x)

const POINT_COUNT = COMPASS_COPY.points.length
export const POINT_STEP_DEGREES = 360 / POINT_COUNT

export function bearingDegrees(heading: number): number {
  return THREE.MathUtils.euclideanModulo(THREE.MathUtils.radToDeg(NORTH_HEADING - heading), 360)
}

export const nearestPointIndex = (bearing: number) =>
  Math.round(bearing / POINT_STEP_DEGREES) % POINT_COUNT
