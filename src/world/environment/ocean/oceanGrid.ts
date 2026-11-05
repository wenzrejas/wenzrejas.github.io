import * as THREE from 'three'
import { useWhirlpoolStore } from '@/store/whirlpoolStore'
import {
  OCEAN_FUNNEL_OVERSHOOT,
  OCEAN_PLANE_SIZE,
  OCEAN_SEGMENTS,
  OCEAN_WAVE_REACH,
  OCEAN_Y,
} from './constants'

interface OceanGrid {
  geometry: THREE.PlaneGeometry
  firstColumns: Int16Array
  lastColumns: Int16Array
}

interface ViewSlab {
  axisX: number
  axisZ: number
  offset: number
  reach: number
}

const CELL_SIZE = OCEAN_PLANE_SIZE / OCEAN_SEGMENTS
const CELL_DIAGONAL = CELL_SIZE * Math.SQRT2
const HALF_PLANE = OCEAN_PLANE_SIZE / 2
const VERTICES_PER_ROW = OCEAN_SEGMENTS + 1
const INDICES_PER_CELL = 6
const FLAT_AXIS = 1e-6
const NO_COLUMN = -1

const _across: ViewSlab = { axisX: 0, axisZ: 0, offset: 0, reach: 0 }
const _along: ViewSlab = { axisX: 0, axisZ: 0, offset: 0, reach: 0 }
const _edgeSpan = { from: 0, to: 0 }
const _rowSpan = { from: 0, to: 0 }

export function createOceanGrid(): OceanGrid {
  const geometry = new THREE.PlaneGeometry(
    OCEAN_PLANE_SIZE,
    OCEAN_PLANE_SIZE,
    OCEAN_SEGMENTS,
    OCEAN_SEGMENTS
  )
  return {
    geometry,
    firstColumns: new Int16Array(OCEAN_SEGMENTS).fill(0),
    lastColumns: new Int16Array(OCEAN_SEGMENTS).fill(OCEAN_SEGMENTS - 1),
  }
}

function readViewSlabs(camera: THREE.OrthographicCamera) {
  const matrix = camera.matrixWorld.elements
  const cameraX = matrix[12]
  const cameraY = matrix[13]
  const cameraZ = matrix[14]
  const highest = OCEAN_Y + OCEAN_WAVE_REACH
  const lowest =
    OCEAN_Y - OCEAN_WAVE_REACH - useWhirlpoolStore.getState().depth * OCEAN_FUNNEL_OVERSHOOT
  const midHeight = (highest + lowest) / 2
  const halfBand = (highest - lowest) / 2

  const fill = (slab: ViewSlab, firstElement: number, halfView: number) => {
    const axisX = matrix[firstElement]
    const axisY = matrix[firstElement + 1]
    const axisZ = matrix[firstElement + 2]
    slab.axisX = axisX
    slab.axisZ = axisZ
    slab.offset = axisY * (midHeight - cameraY) - axisX * cameraX - axisZ * cameraZ
    slab.reach = halfView / camera.zoom + Math.abs(axisY) * halfBand + CELL_DIAGONAL
  }
  fill(_across, 0, (camera.right - camera.left) / 2)
  fill(_along, 4, (camera.top - camera.bottom) / 2)
}

function narrowToSlab({ axisX, axisZ, offset, reach }: ViewSlab, z: number) {
  const distance = axisZ * z + offset
  if (Math.abs(axisX) < FLAT_AXIS) {
    if (Math.abs(distance) > reach) _edgeSpan.from = Infinity
    return
  }
  const first = (-reach - distance) / axisX
  const second = (reach - distance) / axisX
  _edgeSpan.from = Math.max(_edgeSpan.from, Math.min(first, second))
  _edgeSpan.to = Math.min(_edgeSpan.to, Math.max(first, second))
}

function widenRowSpanAt(z: number) {
  _edgeSpan.from = -Infinity
  _edgeSpan.to = Infinity
  narrowToSlab(_across, z)
  narrowToSlab(_along, z)
  if (_edgeSpan.from > _edgeSpan.to) return
  _rowSpan.from = Math.min(_rowSpan.from, _edgeSpan.from)
  _rowSpan.to = Math.max(_rowSpan.to, _edgeSpan.to)
}

function placeRow(grid: OceanGrid, row: number) {
  const nearEdge = row * CELL_SIZE - HALF_PLANE
  _rowSpan.from = Infinity
  _rowSpan.to = -Infinity
  widenRowSpanAt(nearEdge)
  widenRowSpanAt(nearEdge + CELL_SIZE)

  const isVisible = _rowSpan.from <= _rowSpan.to
  const first = isVisible ? Math.max(0, Math.floor((_rowSpan.from + HALF_PLANE) / CELL_SIZE)) : 0
  const last = isVisible
    ? Math.min(OCEAN_SEGMENTS - 1, Math.floor((_rowSpan.to + HALF_PLANE) / CELL_SIZE))
    : NO_COLUMN
  const isChanged = grid.firstColumns[row] !== first || grid.lastColumns[row] !== last
  grid.firstColumns[row] = first
  grid.lastColumns[row] = last
  return isChanged
}

function writeVisibleCells({ geometry, firstColumns, lastColumns }: OceanGrid) {
  const index = geometry.index
  if (!index) return
  const indices = index.array
  let count = 0
  for (let row = 0; row < OCEAN_SEGMENTS; row++) {
    for (let column = firstColumns[row]; column <= lastColumns[row]; column++) {
      const near = column + VERTICES_PER_ROW * row
      const far = column + VERTICES_PER_ROW * (row + 1)
      indices[count] = near
      indices[count + 1] = far
      indices[count + 2] = near + 1
      indices[count + 3] = far
      indices[count + 4] = far + 1
      indices[count + 5] = near + 1
      count += INDICES_PER_CELL
    }
  }
  index.clearUpdateRanges()
  index.addUpdateRange(0, count)
  index.needsUpdate = true
  geometry.setDrawRange(0, count)
}

export function showVisibleCells(grid: OceanGrid, camera: THREE.Camera) {
  if (!(camera as THREE.OrthographicCamera).isOrthographicCamera) return
  camera.updateMatrixWorld()
  readViewSlabs(camera as THREE.OrthographicCamera)
  let isChanged = false
  for (let row = 0; row < OCEAN_SEGMENTS; row++) {
    if (placeRow(grid, row)) isChanged = true
  }
  if (isChanged) writeVisibleCells(grid)
}
