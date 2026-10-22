import * as THREE from 'three'
import { distanceAt, type Waterline } from '@/world/shore/shoreField'
import {
  OCEAN_PLANE_SIZE,
  SHORE_CALM_BAND,
  SHORE_CALM_MAP_RESOLUTION,
  SHORE_CALM_START,
} from './constants'

interface CellBox {
  firstColumn: number
  lastColumn: number
  firstRow: number
  lastRow: number
}

const CELL_SIZE = OCEAN_PLANE_SIZE / SHORE_CALM_MAP_RESOLUTION
const DIAGONAL_STEP = CELL_SIZE * Math.SQRT2
const LAST_CELL = SHORE_CALM_MAP_RESOLUTION - 1
const CALM_REACH_CELLS = Math.ceil((SHORE_CALM_START + SHORE_CALM_BAND) / CELL_SIZE)
const FIELD_CORNERS = [
  [-0.5, -0.5],
  [0.5, -0.5],
  [-0.5, 0.5],
  [0.5, 0.5],
]

const { clamp, smoothstep } = THREE.MathUtils
const _worldToModel = new THREE.Matrix4()
const _fieldReach = new THREE.Box3()
const _point = new THREE.Vector3()

const cellAt = (world: number) =>
  clamp(Math.floor((world / OCEAN_PLANE_SIZE + 0.5) * SHORE_CALM_MAP_RESOLUTION), 0, LAST_CELL)

const worldAt = (cell: number) =>
  ((cell + 0.5) / SHORE_CALM_MAP_RESOLUTION - 0.5) * OCEAN_PLANE_SIZE

const isWithin = (index: number, count: number) => index >= 0 && index < count

// ── Land ──────────────────────────────────────────────────────────────────────

function markLand({ field, modelToWorld }: Waterline, isLand: Uint8Array): CellBox {
  _fieldReach.makeEmpty()
  for (const [acrossX, acrossZ] of FIELD_CORNERS) {
    _point.set(field.centerX + acrossX * field.size, 0, field.centerZ + acrossZ * field.size)
    _fieldReach.expandByPoint(_point.applyMatrix4(modelToWorld))
  }
  const box = {
    firstColumn: cellAt(_fieldReach.min.x),
    lastColumn: cellAt(_fieldReach.max.x),
    firstRow: cellAt(_fieldReach.min.z),
    lastRow: cellAt(_fieldReach.max.z),
  }

  _worldToModel.copy(modelToWorld).invert()
  for (let row = box.firstRow; row <= box.lastRow; row++) {
    for (let column = box.firstColumn; column <= box.lastColumn; column++) {
      _point.set(worldAt(column), 0, worldAt(row)).applyMatrix4(_worldToModel)
      if (distanceAt(field, _point.x, _point.z) < 0) {
        isLand[row * SHORE_CALM_MAP_RESOLUTION + column] = 1
      }
    }
  }
  return box
}

const grownBy = ({ firstColumn, lastColumn, firstRow, lastRow }: CellBox, cells: number) => ({
  firstColumn: Math.max(firstColumn - cells, 0),
  lastColumn: Math.min(lastColumn + cells, LAST_CELL),
  firstRow: Math.max(firstRow - cells, 0),
  lastRow: Math.min(lastRow + cells, LAST_CELL),
})

// ── Distances ─────────────────────────────────────────────────────────────────

function sweep(distances: Float32Array, columns: number, rows: number, direction: 1 | -1): void {
  const firstRow = direction > 0 ? 0 : rows - 1
  const firstColumn = direction > 0 ? 0 : columns - 1
  for (let row = firstRow; isWithin(row, rows); row += direction) {
    const behindRow = row - direction
    for (let column = firstColumn; isWithin(column, columns); column += direction) {
      const cell = row * columns + column
      let nearest = distances[cell]
      if (isWithin(column - direction, columns)) {
        nearest = Math.min(nearest, distances[cell - direction] + CELL_SIZE)
      }
      if (isWithin(behindRow, rows)) {
        const behind = behindRow * columns + column
        nearest = Math.min(nearest, distances[behind] + CELL_SIZE)
        if (column > 0) nearest = Math.min(nearest, distances[behind - 1] + DIAGONAL_STEP)
        if (column < columns - 1) nearest = Math.min(nearest, distances[behind + 1] + DIAGONAL_STEP)
      }
      distances[cell] = nearest
    }
  }
}

// ── Calm ──────────────────────────────────────────────────────────────────────

function calmAround(box: CellBox, isLand: Uint8Array, waveShares: Uint8Array): void {
  const columns = box.lastColumn - box.firstColumn + 1
  const rows = box.lastRow - box.firstRow + 1
  const mapCellAt = (row: number, column: number) =>
    (box.firstRow + row) * SHORE_CALM_MAP_RESOLUTION + box.firstColumn + column

  const distances = new Float32Array(columns * rows)
  for (let row = 0; row < rows; row++) {
    for (let column = 0; column < columns; column++) {
      distances[row * columns + column] = isLand[mapCellAt(row, column)] ? 0 : Infinity
    }
  }
  sweep(distances, columns, rows, 1)
  sweep(distances, columns, rows, -1)

  for (let row = 0; row < rows; row++) {
    for (let column = 0; column < columns; column++) {
      const distance = distances[row * columns + column]
      const share = smoothstep(distance, SHORE_CALM_START, SHORE_CALM_START + SHORE_CALM_BAND)
      const cell = mapCellAt(row, column)
      waveShares[cell] = Math.min(waveShares[cell], Math.round(share * 255))
    }
  }
}

export function measureShoreCalm(waterlines: Waterline[], waveShares: Uint8Array): void {
  waveShares.fill(255)
  const isLand = new Uint8Array(waveShares.length)
  const landBoxes = waterlines.map((waterline) => markLand(waterline, isLand))
  for (const box of landBoxes) calmAround(grownBy(box, CALM_REACH_CELLS), isLand, waveShares)
}
