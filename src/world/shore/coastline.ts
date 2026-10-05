import * as THREE from 'three'
import { polygonArea } from '@/utils/polygon'
import type { IslandKey } from '../islands/shared/constants'
import {
  COASTLINE_BRIDGE_WIDTH_SHARE,
  COASTLINE_CLOSING,
  COASTLINE_OFFSET,
  COASTLINE_OPENING,
  COASTLINE_PIECE_MIN_AREA,
  COASTLINE_TOLERANCE,
} from './constants'
import { floodOpenWater, type DistanceField } from './shoreField'

export interface Coastline {
  islandKey: IslandKey
  outline: number[]
}

interface Piece {
  points: number[]
  area: number
}

interface Bridge {
  fromX: number
  fromZ: number
  toX: number
  toZ: number
  halfWidth: number
}

const { clamp } = THREE.MathUtils
const _point = new THREE.Vector3()

// ── Zero-level loops ──────────────────────────────────────────────────────────

const LAND_TOP_LEFT = 8
const LAND_TOP_RIGHT = 4
const LAND_BOTTOM_RIGHT = 2
const LAND_BOTTOM_LEFT = 1
const ALL_LAND = LAND_TOP_LEFT | LAND_TOP_RIGHT | LAND_BOTTOM_RIGHT | LAND_BOTTOM_LEFT

type Side = 'top' | 'right' | 'bottom' | 'left'

const CROSSED_SIDES: Record<number, [Side, Side][]> = {
  1: [['left', 'bottom']],
  2: [['bottom', 'right']],
  3: [['left', 'right']],
  4: [['top', 'right']],
  6: [['top', 'bottom']],
  7: [['top', 'left']],
  8: [['top', 'left']],
  9: [['top', 'bottom']],
  11: [['top', 'right']],
  12: [['left', 'right']],
  13: [['bottom', 'right']],
  14: [['left', 'bottom']],
}

const SADDLE_SIDES: Record<number, { landCentre: [Side, Side][]; waterCentre: [Side, Side][] }> = {
  5: {
    landCentre: [
      ['top', 'left'],
      ['bottom', 'right'],
    ],
    waterCentre: [
      ['top', 'right'],
      ['left', 'bottom'],
    ],
  },
  10: {
    landCentre: [
      ['top', 'right'],
      ['left', 'bottom'],
    ],
    waterCentre: [
      ['top', 'left'],
      ['bottom', 'right'],
    ],
  },
}

const cellSizeOf = (field: DistanceField) => field.size / field.resolution
const firstSampleX = (field: DistanceField) =>
  field.centerX - field.size / 2 + cellSizeOf(field) / 2
const firstSampleZ = (field: DistanceField) =>
  field.centerZ - field.size / 2 + cellSizeOf(field) / 2

function traceLoops(field: DistanceField): number[][] {
  const { distances, resolution } = field
  const cellSize = cellSizeOf(field)
  const firstX = firstSampleX(field)
  const firstZ = firstSampleZ(field)
  const verticalEdges = resolution * resolution

  const sideEdge = (side: Side, column: number, row: number) => {
    if (side === 'top') return row * resolution + column
    if (side === 'bottom') return (row + 1) * resolution + column
    if (side === 'left') return verticalEdges + row * resolution + column
    return verticalEdges + row * resolution + column + 1
  }

  const crossingPoint = (edge: number): [number, number] => {
    const isVertical = edge >= verticalEdges
    const cell = isVertical ? edge - verticalEdges : edge
    const column = cell % resolution
    const row = Math.floor(cell / resolution)
    const from = distances[cell]
    const to = distances[isVertical ? cell + resolution : cell + 1]
    const along = from / (from - to)
    return isVertical
      ? [firstX + column * cellSize, firstZ + (row + along) * cellSize]
      : [firstX + (column + along) * cellSize, firstZ + row * cellSize]
  }

  const links = new Map<number, number[]>()
  const linksOf = (edge: number) => {
    let neighbours = links.get(edge)
    if (!neighbours) links.set(edge, (neighbours = []))
    return neighbours
  }

  for (let row = 0; row < resolution - 1; row++) {
    for (let column = 0; column < resolution - 1; column++) {
      const cell = row * resolution + column
      const topLeft = distances[cell]
      const topRight = distances[cell + 1]
      const bottomLeft = distances[cell + resolution]
      const bottomRight = distances[cell + resolution + 1]
      const landCase =
        (topLeft < 0 ? LAND_TOP_LEFT : 0) |
        (topRight < 0 ? LAND_TOP_RIGHT : 0) |
        (bottomRight < 0 ? LAND_BOTTOM_RIGHT : 0) |
        (bottomLeft < 0 ? LAND_BOTTOM_LEFT : 0)
      if (landCase === 0 || landCase === ALL_LAND) continue

      const saddle = SADDLE_SIDES[landCase]
      const crossings = saddle
        ? topLeft + topRight + bottomLeft + bottomRight < 0
          ? saddle.landCentre
          : saddle.waterCentre
        : CROSSED_SIDES[landCase]
      for (const [from, to] of crossings) {
        const fromEdge = sideEdge(from, column, row)
        const toEdge = sideEdge(to, column, row)
        linksOf(fromEdge).push(toEdge)
        linksOf(toEdge).push(fromEdge)
      }
    }
  }

  const loops: number[][] = []
  const visited = new Set<number>()
  for (const start of links.keys()) {
    if (visited.has(start)) continue
    const loop: number[] = []
    let current: number | undefined = start
    while (current !== undefined) {
      visited.add(current)
      loop.push(...crossingPoint(current))
      current = links.get(current)?.find((edge) => !visited.has(edge))
    }
    loops.push(loop)
  }
  return loops
}

// ── Bridges between pieces ────────────────────────────────────────────────────

function squaredGapToSegment(
  pointX: number,
  pointZ: number,
  fromX: number,
  fromZ: number,
  toX: number,
  toZ: number
): number {
  const spanX = toX - fromX
  const spanZ = toZ - fromZ
  const offsetX = pointX - fromX
  const offsetZ = pointZ - fromZ
  const lengthSquared = spanX * spanX + spanZ * spanZ
  const along =
    lengthSquared > 0 ? clamp((offsetX * spanX + offsetZ * spanZ) / lengthSquared, 0, 1) : 0
  const gapX = offsetX - spanX * along
  const gapZ = offsetZ - spanZ * along
  return gapX * gapX + gapZ * gapZ
}

function closestPoints(from: number[], to: number[]) {
  let closest = { squaredGap: Infinity, fromIndex: 0, toIndex: 0 }
  for (let i = 0; i < from.length; i += 2) {
    for (let j = 0; j < to.length; j += 2) {
      const gapX = from[i] - to[j]
      const gapZ = from[i + 1] - to[j + 1]
      const squaredGap = gapX * gapX + gapZ * gapZ
      if (squaredGap < closest.squaredGap) closest = { squaredGap, fromIndex: i, toIndex: j }
    }
  }
  return closest
}

function bridgePieces(pieces: Piece[]): Bridge[] {
  const pairs = pieces.flatMap((from, fromPiece) =>
    pieces.slice(fromPiece + 1).map((to, offset) => ({
      fromPiece,
      toPiece: fromPiece + 1 + offset,
      ...closestPoints(from.points, to.points),
    }))
  )
  pairs.sort((a, b) => a.squaredGap - b.squaredGap)

  const group = pieces.map((_, index) => index)
  const groupOf = (piece: number): number =>
    group[piece] === piece ? piece : (group[piece] = groupOf(group[piece]))

  const bridges: Bridge[] = []
  for (const pair of pairs) {
    const fromGroup = groupOf(pair.fromPiece)
    const toGroup = groupOf(pair.toPiece)
    if (fromGroup === toGroup) continue
    group[fromGroup] = toGroup

    const from = pieces[pair.fromPiece]
    const to = pieces[pair.toPiece]
    const smallerRadius = Math.sqrt(Math.min(from.area, to.area) / Math.PI)
    bridges.push({
      fromX: from.points[pair.fromIndex],
      fromZ: from.points[pair.fromIndex + 1],
      toX: to.points[pair.toIndex],
      toZ: to.points[pair.toIndex + 1],
      halfWidth: smallerRadius * COASTLINE_BRIDGE_WIDTH_SHARE,
    })
  }
  return bridges
}

function stampBridge(land: Uint8Array, field: DistanceField, bridge: Bridge): void {
  const { resolution } = field
  const cellSize = cellSizeOf(field)
  const firstX = firstSampleX(field)
  const firstZ = firstSampleZ(field)
  const last = resolution - 1
  const toColumn = (x: number) => clamp(Math.round((x - firstX) / cellSize), 0, last)
  const toRow = (z: number) => clamp(Math.round((z - firstZ) / cellSize), 0, last)
  const { fromX, fromZ, toX, toZ, halfWidth } = bridge

  const firstColumn = toColumn(Math.min(fromX, toX) - halfWidth)
  const lastColumn = toColumn(Math.max(fromX, toX) + halfWidth)
  const firstRow = toRow(Math.min(fromZ, toZ) - halfWidth)
  const lastRow = toRow(Math.max(fromZ, toZ) + halfWidth)
  for (let row = firstRow; row <= lastRow; row++) {
    for (let column = firstColumn; column <= lastColumn; column++) {
      const cellX = firstX + column * cellSize
      const cellZ = firstZ + row * cellSize
      if (squaredGapToSegment(cellX, cellZ, fromX, fromZ, toX, toZ) <= halfWidth * halfWidth) {
        land[row * resolution + column] = 1
      }
    }
  }
}

// ── Merged outline ────────────────────────────────────────────────────────────

function cellsAwayFrom(marked: Uint8Array, resolution: number): Float32Array {
  const away = new Float32Array(marked.length)
  for (let cell = 0; cell < marked.length; cell++) away[cell] = marked[cell] ? 0 : Infinity
  const last = resolution - 1

  for (let row = 0; row < resolution; row++) {
    for (let column = 0; column < resolution; column++) {
      const cell = row * resolution + column
      let nearest = away[cell]
      if (column > 0) nearest = Math.min(nearest, away[cell - 1] + 1)
      if (row > 0) {
        const above = cell - resolution
        nearest = Math.min(nearest, away[above] + 1)
        if (column > 0) nearest = Math.min(nearest, away[above - 1] + Math.SQRT2)
        if (column < last) nearest = Math.min(nearest, away[above + 1] + Math.SQRT2)
      }
      away[cell] = nearest
    }
  }
  for (let row = last; row >= 0; row--) {
    for (let column = last; column >= 0; column--) {
      const cell = row * resolution + column
      let nearest = away[cell]
      if (column < last) nearest = Math.min(nearest, away[cell + 1] + 1)
      if (row < last) {
        const below = cell + resolution
        nearest = Math.min(nearest, away[below] + 1)
        if (column < last) nearest = Math.min(nearest, away[below + 1] + Math.SQRT2)
        if (column > 0) nearest = Math.min(nearest, away[below - 1] + Math.SQRT2)
      }
      away[cell] = nearest
    }
  }
  return away
}

function markWithin(values: Float32Array, limit: number): Uint8Array {
  const marked = new Uint8Array(values.length)
  for (let cell = 0; cell < values.length; cell++) marked[cell] = values[cell] <= limit ? 1 : 0
  return marked
}

function mergedOutline(field: DistanceField, islandScale: number): DistanceField {
  const cellSize = cellSizeOf(field)
  const closingCells = COASTLINE_CLOSING / islandScale / cellSize
  const padding = Math.ceil(closingCells) + 2
  const resolution = field.resolution + padding * 2
  const frame = { ...field, resolution, size: resolution * cellSize }

  const offset = COASTLINE_OFFSET / islandScale
  const land = new Uint8Array(resolution * resolution)
  for (let row = 0; row < field.resolution; row++) {
    for (let column = 0; column < field.resolution; column++) {
      if (field.distances[row * field.resolution + column] >= offset) continue
      land[(row + padding) * resolution + column + padding] = 1
    }
  }

  const minArea = COASTLINE_PIECE_MIN_AREA / (islandScale * islandScale)
  const pieces = traceLoops(field)
    .map((points) => ({ points, area: polygonArea(points) }))
    .filter((piece) => piece.area >= minArea)
  for (const bridge of bridgePieces(pieces)) stampBridge(land, frame, bridge)

  const grown = markWithin(cellsAwayFrom(land, resolution), closingCells)
  const toOpenWater = cellsAwayFrom(floodOpenWater(grown, resolution), resolution)

  const openingCells = COASTLINE_OPENING / islandScale / cellSize
  const nearOpenWater = markWithin(toOpenWater, closingCells + openingCells)
  const core = nearOpenWater.map((isNear) => 1 - isNear)
  const distances = cellsAwayFrom(core, resolution)
  for (let cell = 0; cell < distances.length; cell++) {
    distances[cell] = (distances[cell] - openingCells) * cellSize
  }
  return { ...frame, distances }
}

// ── Simplification ────────────────────────────────────────────────────────────

function keepFarthest(points: number[], start: number, end: number, kept: boolean[]): void {
  const startX = points[start * 2]
  const startZ = points[start * 2 + 1]
  const endX = points[end * 2]
  const endZ = points[end * 2 + 1]
  let farthest = -1
  let farthestGap = COASTLINE_TOLERANCE * COASTLINE_TOLERANCE
  for (let point = start + 1; point < end; point++) {
    const pointX = points[point * 2]
    const pointZ = points[point * 2 + 1]
    const gap = squaredGapToSegment(pointX, pointZ, startX, startZ, endX, endZ)
    if (gap > farthestGap) {
      farthest = point
      farthestGap = gap
    }
  }
  if (farthest < 0) return
  kept[farthest] = true
  keepFarthest(points, start, farthest, kept)
  keepFarthest(points, farthest, end, kept)
}

function simplifyLoop(loop: number[]): number[] {
  const count = loop.length / 2
  const closed = [...loop, loop[0], loop[1]]
  const kept = new Array<boolean>(count).fill(false)
  kept[0] = true
  keepFarthest(closed, 0, count, kept)
  return loop.filter((_, index) => kept[Math.floor(index / 2)])
}

// ── World coastline ───────────────────────────────────────────────────────────

function toWorld(loop: number[], modelToWorld: THREE.Matrix4): number[] {
  const world: number[] = []
  for (let i = 0; i < loop.length; i += 2) {
    _point.set(loop[i], 0, loop[i + 1]).applyMatrix4(modelToWorld)
    world.push(_point.x, _point.z)
  }
  return world
}

export function traceCoastline(
  field: DistanceField,
  islandScale: number,
  modelToWorld: THREE.Matrix4
): number[] | null {
  const loops = traceLoops(mergedOutline(field, islandScale))
  if (loops.length === 0) return null
  const areas = loops.map(polygonArea)
  return simplifyLoop(toWorld(loops[areas.indexOf(Math.max(...areas))], modelToWorld))
}
