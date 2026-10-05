import * as THREE from 'three'
import { WORLD_LOCATIONS, type IslandKey } from '@/world/islands/shared/constants'
import { ISLAND_KEYS, ISLAND_SPECS } from '@/world/islands/shared/islandSpecs'
import { islandExtent } from '@/world/islands/shared/islandTransform'
import type { Coastline } from '@/world/shore/coastline'
import { EAST_DIRECTION, NORTH_DIRECTION } from '../north'
import {
  CHART_WORLD_RADIUS,
  COVE_COUNT,
  COVE_DEPTH,
  ELLIPSE_ISLANDS,
  FACET_SEED,
  LOBE_COUNT,
  LOBE_DEPTH,
  OUTLINE_PHASE_STEP,
  OUTLINE_POINTS,
  ROUNDED_ISLAND_LOBES,
} from './constants'
import { ellipseShape, facetedOutline, lobedShape } from './outlineShaping'

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

function placeholderPath(key: IslandKey, index: number): string {
  const [x, , z] = WORLD_LOCATIONS[key].position
  const centre = chartPercent(x, z, new THREE.Vector2())
  const radius = (islandExtent(key, ISLAND_SPECS[key].tuning) / CHART_WORLD_RADIUS) * 50
  return outlinePath(centre, radius, index * OUTLINE_PHASE_STEP)
}

function coastlinePath(outline: number[]): string {
  const point = new THREE.Vector2()
  let path = ''
  for (let i = 0; i < outline.length; i += 2) {
    chartPercent(outline[i], outline[i + 1], point)
    path += `${i === 0 ? 'M' : ' L'} ${formatPoint(point)}`
  }
  return `${path} Z`
}

function shapedOutline(key: IslandKey, index: number, outline: number[]): number[] {
  const lobes = ROUNDED_ISLAND_LOBES[key]
  const shape = ELLIPSE_ISLANDS.includes(key)
    ? ellipseShape(outline)
    : lobes !== undefined
      ? lobedShape(outline, lobes)
      : null
  return shape ? facetedOutline(shape, FACET_SEED + index) : outline
}

function islandPath(key: IslandKey, index: number, coastline?: Coastline): string {
  if (!coastline) return placeholderPath(key, index)
  return coastlinePath(shapedOutline(key, index, coastline.outline))
}

export const chartIslands = (coastlines: Coastline[]) =>
  ISLAND_KEYS.map((key, index) => ({
    key,
    path: islandPath(
      key,
      index,
      coastlines.find((entry) => entry.islandKey === key)
    ),
  }))
