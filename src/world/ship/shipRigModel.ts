import * as THREE from 'three'
import { FULL_TURN } from '@/utils/math'
import { meshesOf } from '@/utils/meshes'
import {
  FLAG_NODES,
  FLAG_WAVES_PER_LENGTH,
  LANTERN_NODE,
  RUDDER_NODE,
  SAIL_NODE,
  SAIL_WAVES_PER_DROP,
  WHEEL_NODE,
} from './constants'
import type { Cloth, Flag, ShipRig } from './shipRig'

const { clamp } = THREE.MathUtils

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

export function buildShipRig(model: THREE.Object3D): ShipRig {
  return {
    rudder: model.getObjectByName(RUDDER_NODE) ?? null,
    wheel: model.getObjectByName(WHEEL_NODE) ?? null,
    rudderAngle: 0,
    flags: FLAG_NODES.map((node) => findFlag(model, node)).filter((flag) => flag !== null),
    sail: findSail(model),
    lantern: model.getObjectByName(LANTERN_NODE) ?? null,
    sinceClothStep: 0,
  }
}
