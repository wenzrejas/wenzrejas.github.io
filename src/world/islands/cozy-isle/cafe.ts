import * as THREE from 'three'
import { footprintGap, footprintOf } from '@/interaction/baseFootprint'
import { meshesOf, positionIn } from '@/utils/meshes'
import { CAFE_NODE, COUNTER_MARKER_SPOT, DOCK_NODE, TERRAIN_NODE } from './constants'
import { COZY_MAIN_SHORE_RADIUS } from './shoreProfile'

export interface CafeMarker {
  position: THREE.Vector3
  baseGap: (x: number, z: number) => number
}

export function findCafeMarker(model: THREE.Object3D): CafeMarker | null {
  const cafe = model.getObjectByName(CAFE_NODE)
  const terrain = model.getObjectByName(TERRAIN_NODE)
  const dock = model.getObjectByName(DOCK_NODE)
  if (!cafe || !terrain || !dock) return null

  model.updateMatrixWorld(true)
  const shore = footprintOf(
    model,
    [...meshesOf(terrain), ...meshesOf(dock)],
    positionIn(model, terrain),
    COZY_MAIN_SHORE_RADIUS
  )
  return {
    position: model.worldToLocal(cafe.localToWorld(new THREE.Vector3(...COUNTER_MARKER_SPOT))),
    baseGap: (x, z) => footprintGap(shore, model, x, z),
  }
}
