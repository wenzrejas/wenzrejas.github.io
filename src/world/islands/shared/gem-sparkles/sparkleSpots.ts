import * as THREE from 'three'
import { displayColorOf } from '@/utils/color'
import { CORNER_CANDIDATE_SHARE } from './constants'
import type { GemSparkleTuning } from './gemSparklesModel'

export interface SparkleSpots {
  starts: Float32Array
  ends: Float32Array
}

export interface SparkleGem {
  node: THREE.Object3D
  color: THREE.Color
  sparkleSpots: SparkleSpots
}

export interface CornerSparkleTuning extends GemSparkleTuning {
  color: THREE.ColorRepresentation
  count: number
  size: number
}

// ── Spots ─────────────────────────────────────────────────────────────────────

function edgeLengthsUpTo(edges: Float32Array): number[] {
  const reached: number[] = []
  let total = 0
  for (let i = 0; i < edges.length; i += 6) {
    total += Math.hypot(
      edges[i + 3] - edges[i],
      edges[i + 4] - edges[i + 1],
      edges[i + 5] - edges[i + 2]
    )
    reached.push(total)
  }
  return reached
}

export function spotsAlongEdges(
  edges: Float32Array,
  density: number,
  minCount: number
): SparkleSpots {
  const reached = edgeLengthsUpTo(edges)
  const totalLength = reached[reached.length - 1] ?? 0
  const count = Math.max(minCount, Math.round(totalLength * density))
  const starts = new Float32Array(count * 3)
  const ends = new Float32Array(count * 3)

  for (let i = 0; i < count; i++) {
    const pick = Math.random() * totalLength
    const edge = Math.max(
      0,
      reached.findIndex((length) => length >= pick)
    )
    starts.set(edges.subarray(edge * 6, edge * 6 + 3), i * 3)
    ends.set(edges.subarray(edge * 6 + 3, edge * 6 + 6), i * 3)
  }
  return { starts, ends }
}

function spotsOnCorners(mesh: THREE.Mesh, count: number): SparkleSpots {
  const position = mesh.geometry.getAttribute('position')
  const corners = Array.from({ length: position.count }, (_, i) =>
    new THREE.Vector3().fromBufferAttribute(position, i)
  ).sort((a, b) => b.lengthSq() - a.lengthSq())
  const candidates = corners.slice(
    0,
    Math.max(count, Math.round(corners.length * CORNER_CANDIDATE_SHARE))
  )

  const starts = new Float32Array(count * 3)
  for (let i = 0; i < count; i++) {
    candidates[Math.floor(Math.random() * candidates.length)].toArray(starts, i * 3)
  }
  return { starts, ends: starts }
}

export const cornerSparkleGem = (
  mesh: THREE.Mesh,
  { color, count }: CornerSparkleTuning
): SparkleGem => ({
  node: mesh,
  color: displayColorOf(color),
  sparkleSpots: spotsOnCorners(mesh, count),
})
