import * as THREE from 'three'
import type { ShipControls } from '@/app/debug/types'
import { OCEAN_Y } from '../environment/ocean/constants'
import { buildWaterlineField, outwardAt, type DistanceField } from '../shore/shoreField'
import { HULL_BOB_PULSE, HULL_FIELD_MARGIN, HULL_FIELD_RESOLUTION } from './constants'

export interface HullOutline {
  field: DistanceField
  modelScale: number
}

export interface EdgePoint {
  x: number
  z: number
  outwardX: number
  outwardZ: number
}

const _outward = new THREE.Vector2()

export function traceHullOutline(
  model: THREE.Object3D,
  modelScale: number,
  baseY: number
): HullOutline | null {
  const field = buildWaterlineField(
    model,
    (OCEAN_Y - baseY) / modelScale,
    HULL_FIELD_MARGIN / modelScale,
    HULL_FIELD_RESOLUTION
  )
  return field && { field, modelScale }
}

export const foamReachAt = ({ foamReach, bobSpeed }: ShipControls, time: number) =>
  foamReach - Math.sin(time * bobSpeed) * HULL_BOB_PULSE

export function foamEdgeCells({ distances, resolution, size }: DistanceField, reach: number) {
  const halfCell = size / resolution / 2
  const cells: number[] = []
  for (let row = 1; row < resolution - 1; row++) {
    for (let column = 1; column < resolution - 1; column++) {
      const cell = row * resolution + column
      if (Math.abs(distances[cell] - reach) <= halfCell) cells.push(cell)
    }
  }
  return cells
}

export function edgePointAt(field: DistanceField, cell: number, out: EdgePoint): EdgePoint {
  const { resolution, size, centerX, centerZ } = field
  const cellSize = size / resolution
  const outward = outwardAt(field, cell, _outward)
  out.x = centerX - size / 2 + ((cell % resolution) + 0.5) * cellSize
  out.z = centerZ - size / 2 + (Math.floor(cell / resolution) + 0.5) * cellSize
  out.outwardX = outward.x
  out.outwardZ = outward.y
  return out
}
