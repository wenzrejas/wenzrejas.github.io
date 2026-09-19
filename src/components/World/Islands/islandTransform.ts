import * as THREE from 'three'
import { WORLD_LOCATIONS, type IslandKey } from './constants'
import { ISLAND_SPECS } from './islandSpecs'
import { modelToWorld, type IslandModelTuning } from './islandSpec'

const Y_AXIS = new THREE.Vector3(0, 1, 0)

export interface IslandPlacement {
  position: [number, number, number]
  rotation: [number, number, number]
  scale: number
}

export function placeIsland(
  radius: number,
  tuning: IslandModelTuning,
  footprint: number,
  center: THREE.Vector3
): IslandPlacement {
  const scale = modelToWorld(radius, footprint, tuning.scale)
  const facing = THREE.MathUtils.degToRad(tuning.rotation)
  const recentre = new THREE.Vector3(center.x, 0, center.z)
    .applyAxisAngle(Y_AXIS, facing)
    .multiplyScalar(-scale)

  return {
    position: [recentre.x + tuning.offsetX, tuning.offsetY, recentre.z + tuning.offsetZ],
    rotation: [0, facing, 0],
    scale,
  }
}

export interface IslandTransform {
  x: number
  z: number
  facing: number
  cos: number
  sin: number
  scale: number
}

export const createIslandTransform = (): IslandTransform => ({
  x: 0,
  z: 0,
  facing: 0,
  cos: 1,
  sin: 0,
  scale: 1,
})

export function islandTransform(
  key: IslandKey,
  tuning: IslandModelTuning,
  out: IslandTransform
): IslandTransform {
  const config = WORLD_LOCATIONS[key]
  out.x = config.position[0] + tuning.offsetX
  out.z = config.position[2] + tuning.offsetZ
  out.facing = THREE.MathUtils.degToRad(tuning.rotation)
  out.cos = Math.cos(out.facing)
  out.sin = Math.sin(out.facing)
  out.scale = modelToWorld(config.radius, ISLAND_SPECS[key].footprint, tuning.scale)
  return out
}

export function toWorld(
  transform: IslandTransform,
  x: number,
  z: number,
  out: THREE.Vector2
): THREE.Vector2 {
  return out.set(
    transform.x + (x * transform.cos + z * transform.sin) * transform.scale,
    transform.z + (z * transform.cos - x * transform.sin) * transform.scale
  )
}

export const islandExtent = (key: IslandKey, tuning: IslandModelTuning) =>
  WORLD_LOCATIONS[key].radius * tuning.scale
