import * as THREE from 'three'
import { useCoastStore } from '../../../store/coastStore'
import { ISLAND_ZONES, shoreGap, type IslandZone } from '../Islands/islandZones'
import { collisionDistance, collisionNormal, type CoastCollision } from './coastCollision'

const _away = new THREE.Vector2()

export function nearestShore(x: number, z: number, away: THREE.Vector2): number {
  const { collisions } = useCoastStore.getState()
  let distance = Infinity
  let nearestCollision: CoastCollision | null = null
  let nearestZone: IslandZone | null = null

  for (const collision of collisions) {
    const gap = collisionDistance(collision, x, z)
    if (gap < distance) {
      distance = gap
      nearestCollision = collision
    }
  }
  for (const zone of ISLAND_ZONES) {
    if (collisions.some((collision) => collision.islandKey === zone.key)) continue
    const gap = shoreGap(zone, x, z)
    if (gap < distance) {
      distance = gap
      nearestZone = zone
      nearestCollision = null
    }
  }

  if (nearestCollision) collisionNormal(nearestCollision, x, z, away)
  else if (nearestZone) away.set(x - nearestZone.x, z - nearestZone.z).normalize()
  else away.set(0, 0)
  return distance
}

export function keepOffShore(body: { x: number; z: number }, clearance: number): void {
  const distance = nearestShore(body.x, body.z, _away)
  if (distance >= clearance) return
  body.x += _away.x * (clearance - distance)
  body.z += _away.y * (clearance - distance)
}
