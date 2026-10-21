import * as THREE from 'three'
import { boundsIn, meshesOf } from '@/utils/meshes'
import { HEADLIGHT_NODE, LANTERN_NODE } from './constants'

export interface Lamps {
  headlight: THREE.Vector3
  lensRadius: number
  lantern: THREE.Vector3 | null
}

const lensBounds = (locomotive: THREE.Object3D, lens: THREE.Object3D) =>
  boundsIn(locomotive, meshesOf(lens))

export function findLamps(locomotive: THREE.Object3D): Lamps | null {
  const headlight = locomotive.getObjectByName(HEADLIGHT_NODE)
  if (!headlight) return null
  const lantern = locomotive.getObjectByName(LANTERN_NODE)

  locomotive.updateMatrixWorld(true)
  const bounds = lensBounds(locomotive, headlight)
  const size = bounds.getSize(new THREE.Vector3())
  return {
    headlight: bounds.getCenter(new THREE.Vector3()),
    lensRadius: Math.max(size.y, size.z) / 2,
    lantern: lantern ? lensBounds(locomotive, lantern).getCenter(new THREE.Vector3()) : null,
  }
}
