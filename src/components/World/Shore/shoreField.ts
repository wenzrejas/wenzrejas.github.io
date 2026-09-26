import * as THREE from 'three'
import { meshesOf } from '../../../utils/meshes'

export interface DistanceField {
  distances: Float32Array
  resolution: number
  size: number
  centerX: number
  centerZ: number
}

export interface ShoreField extends DistanceField {
  smoothedDistances: Float32Array
}

interface CoastFields {
  shoreline: ShoreField
  collision: DistanceField
}

interface CoastFieldSettings {
  waterY: number
  margin: number
  smoothing: number
  resolution: number
  collisionReach: number
  collisionResolution: number
}

type FieldFrame = Omit<DistanceField, 'distances'>

const { clamp } = THREE.MathUtils

const _worldToModel = new THREE.Matrix4()
const _meshToModel = new THREE.Matrix4()
const _point = new THREE.Vector3()

// ── Model triangles ───────────────────────────────────────────────────────────

const cornerCount = (geometry: THREE.BufferGeometry) =>
  geometry.index ? geometry.index.count : geometry.getAttribute('position').count

function readTriangles(model: THREE.Object3D): Float32Array {
  model.updateWorldMatrix(false, true)
  _worldToModel.identity()
  if (model.parent) _worldToModel.copy(model.parent.matrixWorld).invert()

  const meshes = meshesOf(model)
  const triangles = new Float32Array(
    meshes.reduce((sum, mesh) => sum + cornerCount(mesh.geometry), 0) * 3
  )
  let written = 0
  for (const mesh of meshes) {
    _meshToModel.multiplyMatrices(_worldToModel, mesh.matrixWorld)
    const position = mesh.geometry.getAttribute('position')
    const points = new Float32Array(position.count * 3)
    for (let vertex = 0; vertex < position.count; vertex++) {
      _point
        .fromBufferAttribute(position, vertex)
        .applyMatrix4(_meshToModel)
        .toArray(points, vertex * 3)
    }

    const index = mesh.geometry.index
    const count = cornerCount(mesh.geometry)
    for (let corner = 0; corner < count; corner++) {
      const vertex = index ? index.getX(corner) : corner
      triangles[written++] = points[vertex * 3]
      triangles[written++] = points[vertex * 3 + 1]
      triangles[written++] = points[vertex * 3 + 2]
    }
  }
  return triangles
}

// ── Waterline slice ───────────────────────────────────────────────────────────

function sliceEdge(
  triangles: Float32Array,
  from: number,
  to: number,
  waterY: number,
  out: number[]
) {
  const fromY = triangles[from + 1]
  const toY = triangles[to + 1]
  if ((fromY - waterY) * (toY - waterY) >= 0) return false
  const along = (waterY - fromY) / (toY - fromY)
  out.push(
    triangles[from] + (triangles[to] - triangles[from]) * along,
    triangles[from + 2] + (triangles[to + 2] - triangles[from + 2]) * along
  )
  return true
}

function sliceAtWaterline(triangles: Float32Array, waterY: number): number[] {
  const segments: number[] = []
  for (let first = 0; first < triangles.length; first += 9) {
    const crossings =
      Number(sliceEdge(triangles, first, first + 3, waterY, segments)) +
      Number(sliceEdge(triangles, first + 3, first + 6, waterY, segments)) +
      Number(sliceEdge(triangles, first + 6, first, waterY, segments))
    if (crossings === 1) segments.length -= 2
  }
  return segments
}

// ── Overhangs ─────────────────────────────────────────────────────────────────

function isOverOpenWater(field: DistanceField, x: number, z: number): boolean {
  const column = Math.floor(((x - field.centerX) / field.size + 0.5) * field.resolution)
  const row = Math.floor(((z - field.centerZ) / field.size + 0.5) * field.resolution)
  if (column < 0 || row < 0 || column >= field.resolution || row >= field.resolution) return false
  return field.distances[row * field.resolution + column] > 0
}

function overhangFootprints(
  triangles: Float32Array,
  waterY: number,
  shoreline: DistanceField
): number[] {
  const footprints: number[] = []
  for (let first = 0; first < triangles.length; first += 9) {
    const ax = triangles[first]
    const az = triangles[first + 2]
    const bx = triangles[first + 3]
    const bz = triangles[first + 5]
    const cx = triangles[first + 6]
    const cz = triangles[first + 8]
    const isAboveWater =
      triangles[first + 1] > waterY &&
      triangles[first + 4] > waterY &&
      triangles[first + 7] > waterY
    if (!isAboveWater || !isOverOpenWater(shoreline, (ax + bx + cx) / 3, (az + bz + cz) / 3)) {
      continue
    }
    footprints.push(ax, az, bx, bz, cx, cz)
  }
  return footprints
}

// ── Grid ──────────────────────────────────────────────────────────────────────

function frameAround(segments: number[], margin: number, resolution: number): FieldFrame {
  let minX = Infinity
  let maxX = -Infinity
  let minZ = Infinity
  let maxZ = -Infinity
  for (let i = 0; i < segments.length; i += 2) {
    minX = Math.min(minX, segments[i])
    maxX = Math.max(maxX, segments[i])
    minZ = Math.min(minZ, segments[i + 1])
    maxZ = Math.max(maxZ, segments[i + 1])
  }
  return {
    resolution,
    size: Math.max(maxX - minX, maxZ - minZ) + margin * 2,
    centerX: (minX + maxX) / 2,
    centerZ: (minZ + maxZ) / 2,
  }
}

function toGrid(segments: number[], frame: FieldFrame): Float64Array {
  const cellsPerUnit = frame.resolution / frame.size
  const originX = frame.centerX - frame.size / 2
  const originZ = frame.centerZ - frame.size / 2
  const gridSegments = new Float64Array(segments.length)
  for (let i = 0; i < segments.length; i += 2) {
    gridSegments[i] = (segments[i] - originX) * cellsPerUnit
    gridSegments[i + 1] = (segments[i + 1] - originZ) * cellsPerUnit
  }
  return gridSegments
}

// ── Water mask ────────────────────────────────────────────────────────────────

function markOutline(gridSegments: Float64Array, resolution: number): Uint8Array {
  const outline = new Uint8Array(resolution * resolution)
  for (let i = 0; i < gridSegments.length; i += 4) {
    const spanX = gridSegments[i + 2] - gridSegments[i]
    const spanZ = gridSegments[i + 3] - gridSegments[i + 1]
    const steps = Math.ceil(Math.hypot(spanX, spanZ) * 2) + 1
    for (let step = 0; step <= steps; step++) {
      const column = Math.floor(gridSegments[i] + (spanX * step) / steps)
      const row = Math.floor(gridSegments[i + 1] + (spanZ * step) / steps)
      if (column >= 0 && row >= 0 && column < resolution && row < resolution) {
        outline[row * resolution + column] = 1
      }
    }
  }
  return outline
}

function fillFootprints(gridFootprints: Float64Array, outline: Uint8Array, resolution: number) {
  const last = resolution - 1
  for (let i = 0; i < gridFootprints.length; i += 6) {
    const ax = gridFootprints[i]
    const az = gridFootprints[i + 1]
    const bx = gridFootprints[i + 2]
    const bz = gridFootprints[i + 3]
    const cx = gridFootprints[i + 4]
    const cz = gridFootprints[i + 5]
    const area = (bx - ax) * (cz - az) - (bz - az) * (cx - ax)
    if (area === 0) continue

    const firstColumn = clamp(Math.floor(Math.min(ax, bx, cx)), 0, last)
    const lastColumn = clamp(Math.floor(Math.max(ax, bx, cx)), 0, last)
    const firstRow = clamp(Math.floor(Math.min(az, bz, cz)), 0, last)
    const lastRow = clamp(Math.floor(Math.max(az, bz, cz)), 0, last)
    for (let row = firstRow; row <= lastRow; row++) {
      for (let column = firstColumn; column <= lastColumn; column++) {
        const x = column + 0.5
        const z = row + 0.5
        const towardA = ((bx - x) * (cz - z) - (bz - z) * (cx - x)) / area
        const towardB = ((cx - x) * (az - z) - (cz - z) * (ax - x)) / area
        if (towardA >= 0 && towardB >= 0 && towardA + towardB <= 1) {
          outline[row * resolution + column] = 1
        }
      }
    }
  }
}

function edgeCells(outline: Uint8Array, resolution: number): number[] {
  const points: number[] = []
  const last = resolution - 1
  for (let row = 0; row < resolution; row++) {
    for (let column = 0; column < resolution; column++) {
      const cell = row * resolution + column
      if (!outline[cell]) continue
      const enclosed =
        column > 0 &&
        column < last &&
        row > 0 &&
        row < last &&
        outline[cell - 1] &&
        outline[cell + 1] &&
        outline[cell - resolution] &&
        outline[cell + resolution]
      if (!enclosed) points.push(column + 0.5, row + 0.5, column + 0.5, row + 0.5)
    }
  }
  return points
}

function floodOpenWater(outline: Uint8Array, resolution: number): Uint8Array {
  const water = new Uint8Array(outline.length)
  const queue = new Int32Array(outline.length)
  let head = 0
  let tail = 0
  const fill = (cell: number) => {
    if (water[cell] || outline[cell]) return
    water[cell] = 1
    queue[tail++] = cell
  }

  const last = resolution - 1
  for (let i = 0; i < resolution; i++) {
    fill(i)
    fill(last * resolution + i)
    fill(i * resolution)
    fill(i * resolution + last)
  }
  while (head < tail) {
    const cell = queue[head++]
    const column = cell % resolution
    if (column > 0) fill(cell - 1)
    if (column < last) fill(cell + 1)
    if (cell >= resolution) fill(cell - resolution)
    if (cell < outline.length - resolution) fill(cell + resolution)
  }
  return water
}

// ── Distances ─────────────────────────────────────────────────────────────────

function squaredDistancesToOutline(
  gridSegments: Float64Array,
  resolution: number,
  farthest: number
): Float32Array {
  const squared = new Float32Array(resolution * resolution).fill(farthest * farthest)
  const last = resolution - 1

  for (let i = 0; i < gridSegments.length; i += 4) {
    const startX = gridSegments[i]
    const startZ = gridSegments[i + 1]
    const spanX = gridSegments[i + 2] - startX
    const spanZ = gridSegments[i + 3] - startZ
    const lengthSquared = spanX * spanX + spanZ * spanZ

    const firstColumn = clamp(Math.floor(Math.min(startX, startX + spanX) - farthest), 0, last)
    const lastColumn = clamp(Math.ceil(Math.max(startX, startX + spanX) + farthest), 0, last)
    const firstRow = clamp(Math.floor(Math.min(startZ, startZ + spanZ) - farthest), 0, last)
    const lastRow = clamp(Math.ceil(Math.max(startZ, startZ + spanZ) + farthest), 0, last)

    for (let row = firstRow; row <= lastRow; row++) {
      for (let column = firstColumn; column <= lastColumn; column++) {
        const offsetX = column + 0.5 - startX
        const offsetZ = row + 0.5 - startZ
        const along =
          lengthSquared > 0 ? clamp((offsetX * spanX + offsetZ * spanZ) / lengthSquared, 0, 1) : 0
        const gapX = offsetX - spanX * along
        const gapZ = offsetZ - spanZ * along
        const cell = row * resolution + column
        squared[cell] = Math.min(squared[cell], gapX * gapX + gapZ * gapZ)
      }
    }
  }
  return squared
}

function signedDistances(
  gridSegments: Float64Array,
  outline: Uint8Array,
  frame: FieldFrame,
  reach: number
): Float32Array {
  const cellSize = frame.size / frame.resolution
  const water = floodOpenWater(outline, frame.resolution)
  const squared = squaredDistancesToOutline(gridSegments, frame.resolution, reach / cellSize)

  const distances = new Float32Array(squared.length)
  for (let i = 0; i < squared.length; i++) {
    const distance = Math.sqrt(squared[i]) * cellSize
    distances[i] = water[i] ? distance : -distance
  }
  return distances
}

// ── Smoothing ─────────────────────────────────────────────────────────────────

function blurLine(
  source: Float32Array,
  target: Float32Array,
  start: number,
  step: number,
  resolution: number,
  radius: number
): void {
  const last = resolution - 1
  let sum = 0
  for (let offset = -radius; offset <= radius; offset++) {
    sum += source[start + clamp(offset, 0, last) * step]
  }
  for (let i = 0; i < resolution; i++) {
    target[start + i * step] = sum / (radius * 2 + 1)
    const entering = Math.min(i + radius + 1, last)
    const leaving = Math.max(i - radius, 0)
    sum += source[start + entering * step] - source[start + leaving * step]
  }
}

function smoothed(values: Float32Array, resolution: number, radius: number): Float32Array {
  const result = values.slice()
  const pass = new Float32Array(values.length)
  for (let repeat = 0; repeat < 2; repeat++) {
    for (let row = 0; row < resolution; row++) {
      blurLine(result, pass, row * resolution, 1, resolution, radius)
    }
    for (let column = 0; column < resolution; column++) {
      blurLine(pass, result, column, resolution, resolution, radius)
    }
  }
  return result
}

// ── Fields ────────────────────────────────────────────────────────────────────

export function buildCoastFields(
  model: THREE.Object3D,
  { waterY, margin, smoothing, resolution, collisionReach, collisionResolution }: CoastFieldSettings
): CoastFields | null {
  const triangles = readTriangles(model)
  const waterline = sliceAtWaterline(triangles, waterY)
  if (waterline.length === 0) return null

  const frame = frameAround(waterline, margin, resolution)
  const gridWaterline = toGrid(waterline, frame)
  const distances = signedDistances(
    gridWaterline,
    markOutline(gridWaterline, resolution),
    frame,
    margin
  )
  const smoothingCells = Math.round(smoothing / (frame.size / resolution))
  const shoreline = {
    ...frame,
    distances,
    smoothedDistances: smoothed(distances, resolution, smoothingCells),
  }

  const collisionFrame = frameAround(waterline, collisionReach, collisionResolution)
  const collisionWaterline = toGrid(waterline, collisionFrame)
  const overhangs = new Uint8Array(collisionResolution * collisionResolution)
  const footprints = overhangFootprints(triangles, waterY, shoreline)
  fillFootprints(toGrid(footprints, collisionFrame), overhangs, collisionResolution)
  const overhangEdges = edgeCells(overhangs, collisionResolution)

  const outline = markOutline(collisionWaterline, collisionResolution)
  for (let cell = 0; cell < outline.length; cell++) outline[cell] |= overhangs[cell]
  const features = new Float64Array(collisionWaterline.length + overhangEdges.length)
  features.set(collisionWaterline)
  features.set(overhangEdges, collisionWaterline.length)

  const collision = {
    ...collisionFrame,
    distances: signedDistances(features, outline, collisionFrame, collisionReach),
  }
  return { shoreline, collision }
}
