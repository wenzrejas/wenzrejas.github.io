import * as THREE from 'three'
import { connectedParts } from '@/utils/geometry'
import { meshesOf } from '@/utils/meshes'
import {
  FLAG_NODES,
  FLAG_WAVES_PER_LENGTH,
  HULL_NODE,
  LANTERN_GLOW_NODE,
  LANTERN_PARTS_MAX,
  LANTERN_PARTS_MIN,
  RUDDER_NODE,
  SAIL_NODE,
  SAIL_WAVES_PER_DROP,
  WHEEL_PARTS_MAX,
  WHEEL_PARTS_MIN,
} from './constants'
import type { Cloth, Flag, ShipRig } from './shipRig'

const LANTERN_PARTS = new THREE.Box3(
  new THREE.Vector3(...LANTERN_PARTS_MIN),
  new THREE.Vector3(...LANTERN_PARTS_MAX)
)
const WHEEL_PARTS = new THREE.Box3(
  new THREE.Vector3(...WHEEL_PARTS_MIN),
  new THREE.Vector3(...WHEEL_PARTS_MAX)
)
const FULL_TURN = Math.PI * 2

const { clamp } = THREE.MathUtils

const _vertex = new THREE.Vector3()

function clothOf(mesh: THREE.Mesh): Cloth {
  mesh.geometry = mesh.geometry.clone()
  const rest = Float32Array.from(mesh.geometry.getAttribute('position').array)
  return {
    geometry: mesh.geometry,
    rest,
    weights: new Float32Array(rest.length / 3),
    offsets: new Float32Array(rest.length / 3),
  }
}

function findFlag(model: THREE.Object3D, node: string): Flag | null {
  const flag = model.getObjectByName(node)
  if (!flag) return null
  const cloth = clothOf(meshesOf(flag)[0])
  const { rest, weights, offsets } = cloth
  let length = 0
  for (let i = 0; i < weights.length; i++) length = Math.max(length, -rest[i * 3 + 2])
  for (let i = 0; i < weights.length; i++) {
    weights[i] = clamp(-rest[i * 3 + 2] / length, 0, 1)
    offsets[i] = weights[i] * FLAG_WAVES_PER_LENGTH * FULL_TURN
  }
  return { node: flag, cloth, phase: Math.random() * FULL_TURN }
}

function findSail(model: THREE.Object3D): Cloth[] {
  const sail = model.getObjectByName(SAIL_NODE)
  if (!sail) return []
  const cloths = meshesOf(sail).map(clothOf)
  const bounds = new THREE.Box3()
  for (const { geometry } of cloths) {
    geometry.computeBoundingBox()
    bounds.union(geometry.boundingBox!)
  }
  const drop = -bounds.min.y
  const halfWidth = Math.max(-bounds.min.x, bounds.max.x)
  for (const { rest, weights, offsets } of cloths) {
    for (let i = 0; i < weights.length; i++) {
      const down = clamp(-rest[i * 3 + 1] / drop, 0, 1)
      const across = clamp(Math.abs(rest[i * 3]) / halfWidth, 0, 1)
      weights[i] = Math.sin(down * Math.PI) * Math.cos((across * Math.PI) / 2)
      offsets[i] = down * SAIL_WAVES_PER_DROP * FULL_TURN
    }
  }
  return cloths
}

function splitOffInside(mesh: THREE.Mesh, bounds: THREE.Box3): THREE.Mesh | null {
  const positions = mesh.geometry.getAttribute('position')
  const index = mesh.geometry.index!.array
  const part = connectedParts(mesh.geometry)

  const reachesOutside = new Uint8Array(positions.count)
  for (let i = 0; i < positions.count; i++) {
    if (!bounds.containsPoint(_vertex.fromBufferAttribute(positions, i))) {
      reachesOutside[part[i]] = 1
    }
  }

  const kept: number[] = []
  const taken: number[] = []
  for (let i = 0; i < index.length; i += 3) {
    const triangle = reachesOutside[part[index[i]]] ? kept : taken
    triangle.push(index[i], index[i + 1], index[i + 2])
  }
  if (taken.length === 0) return null

  const inside = new THREE.Mesh(mesh.geometry.clone().setIndex(taken).toNonIndexed(), mesh.material)
  mesh.geometry = mesh.geometry.clone().setIndex(kept)
  return inside
}

function pivotPartsInside(
  hull: THREE.Object3D,
  hullMeshes: THREE.Mesh[],
  inside: THREE.Box3,
  pivotAt: (bounds: THREE.Box3) => THREE.Vector3
): THREE.Group | null {
  const parts = hullMeshes
    .map((mesh) => splitOffInside(mesh, inside))
    .filter((part) => part !== null)
  if (parts.length === 0) return null

  const bounds = new THREE.Box3()
  for (const part of parts) {
    part.geometry.computeBoundingBox()
    bounds.union(part.geometry.boundingBox!)
  }

  const pivot = new THREE.Group()
  pivot.position.copy(pivotAt(bounds))
  hull.add(pivot, ...parts)
  for (const part of parts) pivot.attach(part)
  return pivot
}

const hangingPoint = (bounds: THREE.Box3) =>
  bounds.getCenter(new THREE.Vector3()).setY(bounds.max.y)

const hubPoint = (bounds: THREE.Box3) => bounds.getCenter(new THREE.Vector3())

export function buildShipRig(model: THREE.Object3D): ShipRig {
  const hull = model.getObjectByName(HULL_NODE) ?? null
  const hullMeshes = hull ? meshesOf(hull) : []
  const lantern = hull && pivotPartsInside(hull, hullMeshes, LANTERN_PARTS, hangingPoint)
  const lanternGlow = model.getObjectByName(LANTERN_GLOW_NODE)
  if (lantern && lanternGlow) lantern.attach(lanternGlow)

  return {
    rudder: model.getObjectByName(RUDDER_NODE) ?? null,
    wheel: hull && pivotPartsInside(hull, hullMeshes, WHEEL_PARTS, hubPoint),
    rudderAngle: 0,
    flags: FLAG_NODES.map((node) => findFlag(model, node)).filter((flag) => flag !== null),
    sail: findSail(model),
    lantern,
    sinceClothStep: 0,
  }
}
