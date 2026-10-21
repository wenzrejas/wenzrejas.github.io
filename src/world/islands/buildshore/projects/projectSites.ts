import * as THREE from 'three'
import { PROJECT_COPY } from '@/data/islandCopy'
import type { ProjectKey } from '@/store/panelStore'
import { footprintGap, type Footprint } from '@/interaction/baseFootprint'
import { BASE_FOOTPRINT_SECTORS } from '@/interaction/constants'
import { FULL_TURN, mix } from '@/utils/math'
import { boundsIn, meshesNamed, nodeNamed, positionIn } from '@/utils/meshes'
import { distanceAt, type DistanceField } from '@/world/shore/shoreField'
import {
  PROJECT_LANDMARK_NODES,
  PROJECT_MARKER_ANCHORS,
  PROJECT_MARKER_HEIGHT,
  PROJECT_TOUCH_SPOTS,
  SHORE_RAYS_PER_SECTOR,
  TOUCH_SPOT_RADIUS,
} from './constants'

interface ProjectSite {
  key: ProjectKey
  label: string
  marker: THREE.Vector3
  baseGap: (x: number, z: number) => number
}

interface Landmark {
  key: ProjectKey
  centre: THREE.Vector3
  marker: THREE.Vector3
  shore: Footprint
}

export const PROJECT_KEYS = Object.keys(PROJECT_LANDMARK_NODES) as ProjectKey[]

const _toModel = new THREE.Matrix4()
const _point = new THREE.Vector3()

function shoreReach(coast: DistanceField, x: number, z: number, angle: number): number {
  const step = coast.size / coast.resolution / 2
  const directionX = Math.cos(angle)
  const directionZ = Math.sin(angle)
  let reach = 0
  while (distanceAt(coast, x + directionX * reach, z + directionZ * reach) < 0) reach += step
  return reach
}

function shoreAround(coast: DistanceField, centre: THREE.Vector3): Footprint {
  const radii = new Float32Array(BASE_FOOTPRINT_SECTORS)
  for (let sector = 0; sector < BASE_FOOTPRINT_SECTORS; sector++) {
    for (let ray = 0; ray < SHORE_RAYS_PER_SECTOR; ray++) {
      const turn = (sector + (ray + 0.5) / SHORE_RAYS_PER_SECTOR) / BASE_FOOTPRINT_SECTORS
      radii[sector] = Math.max(
        radii[sector],
        shoreReach(coast, centre.x, centre.z, turn * FULL_TURN)
      )
    }
  }
  return { centerX: centre.x, centerZ: centre.z, radii }
}

function touchSpotOf(model: THREE.Object3D, key: ProjectKey): Footprint | null {
  const spotNode = PROJECT_TOUCH_SPOTS[key]
  const meshes = spotNode ? meshesNamed(model, [spotNode]) : []
  if (meshes.length === 0) return null

  const spot = boundsIn(model, meshes).getCenter(new THREE.Vector3())
  const radii = new Float32Array(BASE_FOOTPRINT_SECTORS).fill(TOUCH_SPOT_RADIUS)
  return { centerX: spot.x, centerZ: spot.z, radii }
}

function findLandmark(
  model: THREE.Object3D,
  coast: DistanceField,
  key: ProjectKey
): Landmark | null {
  const meshes = meshesNamed(model, PROJECT_LANDMARK_NODES[key])
  if (meshes.length === 0) return null

  const bounds = boundsIn(model, meshes)
  const centre = bounds.getCenter(new THREE.Vector3())
  centre.y = mix(bounds.min.y, bounds.max.y, PROJECT_MARKER_HEIGHT)
  const anchor = nodeNamed(model, PROJECT_MARKER_ANCHORS[key])
  const marker = anchor ? positionIn(model, anchor) : centre.clone()
  const shore = touchSpotOf(model, key) ?? shoreAround(coast, centre)
  return { key, centre, marker, shore }
}

function sharesIsland(landmark: Landmark, other: Landmark, model: THREE.Object3D): boolean {
  _point.copy(other.centre).applyMatrix4(model.matrixWorld)
  return footprintGap(landmark.shore, model, _point.x, _point.z) < 0
}

function isClosestOnIsland(
  landmark: Landmark,
  neighbours: Landmark[],
  model: THREE.Object3D,
  x: number,
  z: number
): boolean {
  _point.set(x, 0, z).applyMatrix4(_toModel.copy(model.matrixWorld).invert())
  const reachOf = ({ centre }: Landmark) => Math.hypot(_point.x - centre.x, _point.z - centre.z)
  return neighbours.every((neighbour) => reachOf(landmark) <= reachOf(neighbour))
}

export function findProjectSites(model: THREE.Object3D, coast: DistanceField): ProjectSite[] {
  model.updateMatrixWorld(true)
  const landmarks = PROJECT_KEYS.map((key) => findLandmark(model, coast, key)).filter(
    (landmark) => landmark !== null
  )

  return landmarks.map((landmark) => {
    const neighbours = landmarks.filter(
      (other) => other !== landmark && sharesIsland(landmark, other, model)
    )
    return {
      key: landmark.key,
      label: PROJECT_COPY[landmark.key],
      marker: landmark.marker,
      baseGap: (x, z) =>
        isClosestOnIsland(landmark, neighbours, model, x, z)
          ? footprintGap(landmark.shore, model, x, z)
          : Infinity,
    }
  })
}
