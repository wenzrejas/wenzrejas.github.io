import * as THREE from 'three'
import { TRAIL_POINTS } from './constants'

export const trailUniform = {
  value: Array.from({ length: TRAIL_POINTS }, () => new THREE.Vector3(0, 0, -1e6)),
}

export function recordTrail(x: number, z: number, time: number): void {
  const points = trailUniform.value
  for (let i = points.length - 1; i > 0; i--) points[i].copy(points[i - 1])
  points[0].set(x, z, time)
}
