import * as THREE from 'three'
import { rand } from '../../../utils/math'
import { ISLAND_ZONES, shoreGap } from '../Islands/islandZones'
import {
  AVOID_ISLAND_GAP,
  AVOID_ISLANDS,
  NIGHT_FROM,
  NIGHT_UNTIL,
  PATCH_EDGE_REACH,
  PATCH_RADIUS_MAX,
  PATCH_RADIUS_MIN,
  PLANE_Y,
  SPAWN_ATTEMPTS,
  SPAWN_GAP_MAX,
  SPAWN_GAP_MIN,
} from './constants'

export interface Patch {
  x: number
  z: number
  radius: number
  age: number
}

const _raycaster = new THREE.Raycaster()
const _ground = new THREE.Plane(new THREE.Vector3(0, 1, 0), -PLANE_Y)
const _corner = new THREE.Vector2()
const _hit = new THREE.Vector3()
const SCREEN_CORNERS = [
  [-1, -1],
  [1, -1],
  [1, 1],
  [-1, 1],
]

export const isNightWindow = (time: number) => time >= NIGHT_FROM || time < NIGHT_UNTIL

export function viewReach(camera: THREE.Camera, x: number, z: number): number {
  let reach = 0
  for (const [cornerX, cornerY] of SCREEN_CORNERS) {
    _raycaster.setFromCamera(_corner.set(cornerX, cornerY), camera)
    if (_raycaster.ray.intersectPlane(_ground, _hit)) {
      reach = Math.max(reach, Math.hypot(_hit.x - x, _hit.z - z))
    }
  }
  return reach
}

export const patchReach = (patch: Patch) => patch.radius * PATCH_EDGE_REACH

function isBlockedByIsland(x: number, z: number, radius: number): boolean {
  return ISLAND_ZONES.some((zone) => {
    const gap = shoreGap(zone, x, z)
    if (gap < radius * 0.3) return true
    return AVOID_ISLANDS.includes(zone.key) && gap < radius * PATCH_EDGE_REACH + AVOID_ISLAND_GAP
  })
}

export function createPatch(shipX: number, shipZ: number, reach: number): Patch | null {
  for (let attempt = 0; attempt < SPAWN_ATTEMPTS; attempt++) {
    const radius = rand(PATCH_RADIUS_MIN, PATCH_RADIUS_MAX)
    const angle = Math.random() * Math.PI * 2
    const distance = reach + radius * PATCH_EDGE_REACH + rand(SPAWN_GAP_MIN, SPAWN_GAP_MAX)
    const x = shipX + Math.sin(angle) * distance
    const z = shipZ + Math.cos(angle) * distance
    if (!isBlockedByIsland(x, z, radius)) return { x, z, radius, age: 0 }
  }
  return null
}
