import * as THREE from 'three'
import { positionIn } from '@/utils/meshes'
import { FIRE_ANCHOR_NODE } from '../constants'
import { FIRE_HEIGHT } from './constants'

export interface FireSpot {
  origin: THREE.Vector3
  base: THREE.Vector3
}

export function findFire(model: THREE.Object3D): FireSpot | null {
  const anchor = model.getObjectByName(FIRE_ANCHOR_NODE)
  if (!anchor) return null

  anchor.updateWorldMatrix(true, false)
  const base = positionIn(model, anchor)
  return { origin: new THREE.Vector3(base.x, base.y + FIRE_HEIGHT, base.z), base }
}
