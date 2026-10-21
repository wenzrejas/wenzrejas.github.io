import type * as THREE from 'three'
import { mix } from '@/utils/math'

export interface RailTrack {
  length: number
  points: number[][]
  tangents: number[][]
  distances: number[]
}

export interface RailRoute {
  points: Float32Array
  tangents: Float32Array
  distances: Float32Array
  length: number
}

export const buildRailRoute = ({ length, points, tangents, distances }: RailTrack): RailRoute => ({
  points: Float32Array.from(points.flat()),
  tangents: Float32Array.from(tangents.flat()),
  distances: Float32Array.from(distances),
  length,
})

export const wrapDistance = ({ length }: RailRoute, distance: number) =>
  ((distance % length) + length) % length

function segmentAt(distances: Float32Array, distance: number): number {
  let low = 0
  let high = distances.length - 2
  while (low < high) {
    const middle = (low + high + 1) >> 1
    if (distances[middle] <= distance) low = middle
    else high = middle - 1
  }
  return low
}

export function sampleRoute(
  route: RailRoute,
  distance: number,
  position: THREE.Vector3,
  tangent: THREE.Vector3
): void {
  const along = wrapDistance(route, distance)
  const segment = segmentAt(route.distances, along)
  const start = route.distances[segment]
  const span = route.distances[segment + 1] - start
  const share = span > 0 ? (along - start) / span : 0
  const from = segment * 3
  const to = from + 3
  const { points, tangents } = route
  position.set(
    mix(points[from], points[to], share),
    mix(points[from + 1], points[to + 1], share),
    mix(points[from + 2], points[to + 2], share)
  )
  tangent
    .set(
      mix(tangents[from], tangents[to], share),
      mix(tangents[from + 1], tangents[to + 1], share),
      mix(tangents[from + 2], tangents[to + 2], share)
    )
    .normalize()
}
