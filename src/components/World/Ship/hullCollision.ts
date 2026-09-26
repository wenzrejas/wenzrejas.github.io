import * as THREE from 'three'
import { collisionDistance, collisionNormal, type CoastCollision } from '../Shore/coastCollision'
import { HULL_CIRCLES, HULL_COLLISION_PASSES, HULL_SHORE_GAP, MODEL_TARGET_SIZE } from './constants'

const _normal = new THREE.Vector2()

export function keepHullOffCoasts(
  position: THREE.Vector3,
  heading: number,
  modelSize: number,
  collisions: CoastCollision[]
): void {
  const sizeRatio = modelSize / MODEL_TARGET_SIZE
  const forwardX = -Math.sin(heading)
  const forwardZ = -Math.cos(heading)

  for (let pass = 0; pass < HULL_COLLISION_PASSES; pass++) {
    for (const circle of HULL_CIRCLES) {
      const clearance = circle.radius * sizeRatio + HULL_SHORE_GAP
      for (const collision of collisions) {
        const x = position.x + forwardX * circle.ahead * sizeRatio
        const z = position.z + forwardZ * circle.ahead * sizeRatio
        const overlap = clearance - collisionDistance(collision, x, z)
        if (overlap <= 0) continue
        collisionNormal(collision, x, z, _normal)
        position.x += _normal.x * overlap
        position.z += _normal.y * overlap
      }
    }
  }
}
