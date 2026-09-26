import * as THREE from 'three'
import type { IslandKey } from '../Islands/constants'
import type { DistanceField } from './shoreField'

export interface CoastCollision {
  islandKey: IslandKey
  field: DistanceField
  islandScale: number
  frame: THREE.Object3D
  worldToField: THREE.Matrix4
}

const _point = new THREE.Vector3()

export function alignCollision(collision: CoastCollision): void {
  collision.worldToField.copy(collision.frame.matrixWorld).invert()
}

export function collisionDistance(collision: CoastCollision, x: number, z: number): number {
  const { distances, resolution } = collision.field
  _point.set(x, 0, z).applyMatrix4(collision.worldToField)
  const column = (_point.x + 0.5) * resolution - 0.5
  const row = (_point.z + 0.5) * resolution - 0.5
  if (column < 0 || row < 0 || column >= resolution - 1 || row >= resolution - 1) return Infinity

  const left = Math.floor(column)
  const top = Math.floor(row)
  const across = column - left
  const cell = top * resolution + left
  const upper = distances[cell] + (distances[cell + 1] - distances[cell]) * across
  const lower =
    distances[cell + resolution] +
    (distances[cell + resolution + 1] - distances[cell + resolution]) * across
  return (upper + (lower - upper) * (row - top)) * collision.islandScale
}

export function collisionNormal(
  collision: CoastCollision,
  x: number,
  z: number,
  out: THREE.Vector2
): THREE.Vector2 {
  const step = (collision.field.size / collision.field.resolution) * collision.islandScale
  out.set(
    collisionDistance(collision, x + step, z) - collisionDistance(collision, x - step, z),
    collisionDistance(collision, x, z + step) - collisionDistance(collision, x, z - step)
  )
  return Number.isFinite(out.x) && Number.isFinite(out.y) ? out.normalize() : out.set(0, 0)
}
