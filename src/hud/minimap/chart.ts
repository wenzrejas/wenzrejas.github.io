import * as THREE from 'three'
import { WORLD_LOCATIONS } from '@/world/islands/shared/constants'
import { ISLAND_KEYS, ISLAND_SPECS } from '@/world/islands/shared/islandSpecs'
import { islandExtent } from '@/world/islands/shared/islandTransform'
import { EAST_DIRECTION, NORTH_DIRECTION } from '../north'
import {
  CHART_WORLD_RADIUS,
  COVE_COUNT,
  COVE_DEPTH,
  LOBE_COUNT,
  LOBE_DEPTH,
  OUTLINE_PHASE_STEP,
  OUTLINE_POINTS,
  WHIRLPOOL_ISLAND,
  WHIRLPOOL_STEPS_PER_TURN,
  WHIRLPOOL_TURNS,
} from './constants'

export function chartPercent(x: number, z: number, out: THREE.Vector2): THREE.Vector2 {
  const right = (x * EAST_DIRECTION.x + z * EAST_DIRECTION.y) / CHART_WORLD_RADIUS
  const up = (x * NORTH_DIRECTION.x + z * NORTH_DIRECTION.y) / CHART_WORLD_RADIUS
  return out.set(50 + right * 50, 50 - up * 50)
}

const formatPoint = (point: THREE.Vector2) => `${point.x.toFixed(2)} ${point.y.toFixed(2)}`

function outlinePath(centre: THREE.Vector2, radius: number, phase: number): string {
  const points = Array.from({ length: OUTLINE_POINTS }, (_, i) => {
    const angle = (i / OUTLINE_POINTS) * Math.PI * 2
    const lobe = LOBE_DEPTH * Math.sin(LOBE_COUNT * angle + phase)
    const cove = COVE_DEPTH * Math.sin(COVE_COUNT * angle + phase * 2)
    return new THREE.Vector2(Math.cos(angle), Math.sin(angle))
      .multiplyScalar(radius * (1 + lobe + cove))
      .add(centre)
  })
  const midpoint = (i: number) => points[i].clone().lerp(points[(i + 1) % OUTLINE_POINTS], 0.5)

  let path = `M ${formatPoint(midpoint(OUTLINE_POINTS - 1))}`
  points.forEach((point, i) => {
    path += ` Q ${formatPoint(point)} ${formatPoint(midpoint(i))}`
  })
  return `${path} Z`
}

function whirlpoolPath(centre: THREE.Vector2, radius: number): string {
  const steps = Math.round(WHIRLPOOL_TURNS * WHIRLPOOL_STEPS_PER_TURN)
  const point = new THREE.Vector2()

  let path = `M ${formatPoint(centre)}`
  for (let step = 1; step <= steps; step++) {
    const along = step / steps
    const angle = along * WHIRLPOOL_TURNS * Math.PI * 2
    point
      .set(Math.cos(angle), Math.sin(angle))
      .multiplyScalar(radius * along)
      .add(centre)
    path += ` L ${formatPoint(point)}`
  }
  return path
}

export const ISLAND_SHAPES = ISLAND_KEYS.map((key, index) => {
  const [x, , z] = WORLD_LOCATIONS[key].position
  const centre = chartPercent(x, z, new THREE.Vector2())
  const radius = (islandExtent(key, ISLAND_SPECS[key].tuning) / CHART_WORLD_RADIUS) * 50

  return key === WHIRLPOOL_ISLAND
    ? { key, kind: 'whirlpool', path: whirlpoolPath(centre, radius) }
    : { key, kind: 'land', path: outlinePath(centre, radius, index * OUTLINE_PHASE_STEP) }
})
