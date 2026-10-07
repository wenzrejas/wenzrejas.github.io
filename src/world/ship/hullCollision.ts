import * as THREE from 'three'
import { useDebugStore } from '@/store/debugStore'
import { useShipStore } from '@/store/shipStore'
import { collisionDistance, collisionNormal, type CoastCollision } from '../shore/coastCollision'
import {
  HULL_CIRCLES,
  HULL_CIRCLES_SHIP_SIZE,
  HULL_COLLISION_PASSES,
  HULL_SHORE_GAP,
} from './constants'

const _normal = new THREE.Vector2()

export function keepHullOffCoasts(
  position: THREE.Vector3,
  heading: number,
  modelSize: number,
  collisions: CoastCollision[]
): void {
  const sizeRatio = modelSize / HULL_CIRCLES_SHIP_SIZE
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

export function hullGap(gapAt: (x: number, z: number) => number): number {
  const { x, z, heading } = useShipStore.getState()
  const sizeRatio = useDebugStore.getState().ship.modelSize / HULL_CIRCLES_SHIP_SIZE
  const forwardX = Math.sin(heading)
  const forwardZ = Math.cos(heading)

  let gap = Infinity
  for (const circle of HULL_CIRCLES) {
    const ahead = circle.ahead * sizeRatio
    gap = Math.min(
      gap,
      gapAt(x + forwardX * ahead, z + forwardZ * ahead) - circle.radius * sizeRatio
    )
  }
  return gap
}
