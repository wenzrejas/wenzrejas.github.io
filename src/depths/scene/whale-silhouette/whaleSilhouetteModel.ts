import * as THREE from 'three'
import { floatDefines } from '@/utils/glsl'
import { FULL_TURN, mix } from '@/utils/math'
import { patchShader } from '@/world/islands/shared/materialPatch'
import {
  WHALE_BACK_COLOR,
  WHALE_BELLY_COLOR,
  WHALE_BELLY_LINE,
  WHALE_BEND_SPAN,
  WHALE_BEND_START,
  WHALE_DEPTH_Z,
  WHALE_FLIPPER,
  WHALE_FLIPPER_LIFT,
  WHALE_FLIPPER_RATE,
  WHALE_FLIPPER_ROOT_THICKNESS,
  WHALE_FLIPPER_SPREAD,
  WHALE_FLIPPER_SWEEP,
  WHALE_FLIPPER_TIP_THICKNESS,
  WHALE_FLUKE_NOTCH,
  WHALE_HEAD_NOD,
  WHALE_LENGTH,
  WHALE_LOWER_FLUKE,
  WHALE_PROFILE,
  WHALE_RING_ROUNDNESS,
  WHALE_RING_SEGMENTS,
  WHALE_SNOUT,
  WHALE_STROKE_LAG,
  WHALE_STROKE_RATE,
  WHALE_STROKE_SWING,
  WHALE_TAIL_END,
  WHALE_UPPER_FLUKE,
  WHALE_WATER_SHARE,
  WHALE_WIDTH_SHARE,
  type FlukeLobe,
  type OutlinePoint,
  type ShapePoint,
  type WhaleStation,
} from './constants'
import SILHOUETTE_SHADE from './shaders/silhouetteShade.frag.glsl'
import SILHOUETTE_WATER from './shaders/silhouetteWater.frag.glsl'
import WHALE_SWIM_PARS from './shaders/whaleSwimPars.vert.glsl'
import WHALE_SWIM from './shaders/whaleSwim.vert.glsl'

export interface WhaleSilhouette {
  body: THREE.Mesh
  swimTime: { value: number }
}

interface WhaleShape {
  positions: number[]
  colors: number[]
  reaches: number[]
}

interface RingVertex {
  point: ShapePoint
  up: number
}

const BACK = new THREE.Color(WHALE_BACK_COLOR)
const BELLY = new THREE.Color(WHALE_BELLY_COLOR)
const STILL = [0, 0, 0, 0]

// ── Shape ─────────────────────────────────────────────────────────────────────

function addTriangle(
  shape: WhaleShape,
  color: THREE.Color,
  corners: ShapePoint[],
  reaches: number[] = STILL
) {
  corners.forEach((corner, index) => {
    shape.positions.push(...corner)
    shape.colors.push(color.r, color.g, color.b)
    shape.reaches.push(reaches[index])
  })
}

function addQuad(
  shape: WhaleShape,
  color: THREE.Color,
  [a, b, c, d]: ShapePoint[],
  [reachA, reachB, reachC, reachD]: number[] = STILL
) {
  addTriangle(shape, color, [a, b, c], [reachA, reachB, reachC])
  addTriangle(shape, color, [a, c, d], [reachA, reachC, reachD])
}

const rounded = (value: number) => Math.sign(value) * Math.abs(value) ** WHALE_RING_ROUNDNESS

function ringOf([along, top, bottom]: WhaleStation): RingVertex[] {
  const middle = (top + bottom) / 2
  const halfHeight = (top - bottom) / 2
  const halfWidth = (top - bottom) * WHALE_WIDTH_SHARE
  return Array.from({ length: WHALE_RING_SEGMENTS }, (_, segment) => {
    const angle = (segment / WHALE_RING_SEGMENTS) * FULL_TURN
    const up = Math.cos(angle)
    return {
      point: [rounded(Math.sin(angle)) * halfWidth, middle + rounded(up) * halfHeight, along],
      up,
    }
  })
}

function addSkin(shape: WhaleShape, vertices: RingVertex[]) {
  const up = vertices.reduce((sum, vertex) => sum + vertex.up, 0) / vertices.length
  const color = up > WHALE_BELLY_LINE ? BACK : BELLY
  const points = vertices.map((vertex) => vertex.point)
  if (points.length === 3) addTriangle(shape, color, points)
  else addQuad(shape, color, points)
}

function addBody(shape: WhaleShape) {
  const rings = WHALE_PROFILE.map(ringOf)
  const last = rings[rings.length - 1]
  const snout: RingVertex = { point: WHALE_SNOUT, up: 0 }
  const tail: RingVertex = { point: WHALE_TAIL_END, up: 0 }
  for (let segment = 0; segment < WHALE_RING_SEGMENTS; segment++) {
    const next = (segment + 1) % WHALE_RING_SEGMENTS
    addSkin(shape, [snout, rings[0][next], rings[0][segment]])
    for (let station = 0; station < rings.length - 1; station++) {
      const [near, far] = [rings[station], rings[station + 1]]
      addSkin(shape, [near[segment], near[next], far[next], far[segment]])
    }
    addSkin(shape, [tail, last[segment], last[next]])
  }
}

const onMidline = ([along, height]: OutlinePoint): ShapePoint => [0, height, along]

function addFlukeLobe(shape: WhaleShape, { leading, trailing, tip }: FlukeLobe) {
  for (let step = 0; step < leading.length - 1; step++) {
    const edge = [leading[step], leading[step + 1], trailing[step + 1], trailing[step]]
    addQuad(shape, BACK, edge.map(onMidline))
  }
  const outer = [leading[leading.length - 1], tip, trailing[trailing.length - 1]]
  addTriangle(shape, BACK, outer.map(onMidline))
}

function addFlukes(shape: WhaleShape) {
  addFlukeLobe(shape, WHALE_UPPER_FLUKE)
  addFlukeLobe(shape, WHALE_LOWER_FLUKE)
  const fork = [WHALE_UPPER_FLUKE.leading[0], WHALE_LOWER_FLUKE.leading[0], WHALE_FLUKE_NOTCH]
  addTriangle(shape, BACK, fork.map(onMidline))
}

function addFlipper(shape: WhaleShape, side: number) {
  const { leading, trailing, tip } = WHALE_FLIPPER
  const rootHeight = leading[0][1]
  const reachOf = ([, height]: ShapePoint) => (rootHeight - height) / (rootHeight - tip[1])
  const onFace =
    (face: number) =>
    (point: ShapePoint): ShapePoint => {
      const [across, height, along] = point
      const thickness = mix(
        WHALE_FLIPPER_ROOT_THICKNESS,
        WHALE_FLIPPER_TIP_THICKNESS,
        reachOf(point)
      )
      return [side * (across + (face * thickness) / 2), height, along]
    }
  const addBlade = (corners: ShapePoint[]) => {
    const reaches = corners.map(reachOf)
    for (const face of [-1, 1]) {
      const placed = corners.map(onFace(face))
      if (placed.length === 3) addTriangle(shape, BELLY, placed, reaches)
      else addQuad(shape, BELLY, placed, reaches)
    }
  }
  for (let step = 0; step < leading.length - 1; step++) {
    addBlade([leading[step], leading[step + 1], trailing[step + 1], trailing[step]])
  }
  addBlade([leading[leading.length - 1], tip, trailing[trailing.length - 1]])

  const rim = [...leading, tip, ...[...trailing].reverse()]
  for (let step = 0; step < rim.length - 1; step++) {
    const [from, to] = [rim[step], rim[step + 1]]
    const edge = [onFace(1)(from), onFace(1)(to), onFace(-1)(to), onFace(-1)(from)]
    addQuad(shape, BELLY, edge, [from, to, to, from].map(reachOf))
  }
}

function buildSilhouetteGeometry() {
  const shape: WhaleShape = { positions: [], colors: [], reaches: [] }
  addBody(shape)
  addFlukes(shape)
  for (const side of [-1, 1]) addFlipper(shape, side)
  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(shape.positions, 3))
  geometry.setAttribute('color', new THREE.Float32BufferAttribute(shape.colors, 3))
  geometry.setAttribute('flipperReach', new THREE.Float32BufferAttribute(shape.reaches, 1))
  geometry.computeVertexNormals()
  return geometry
}

// ── Material ──────────────────────────────────────────────────────────────────

const createSilhouetteMaterial = (swimTime: { value: number }) =>
  patchShader(
    new THREE.MeshLambertMaterial({
      vertexColors: true,
      flatShading: true,
      side: THREE.DoubleSide,
    }),
    {
      uniforms: { uSwimTime: swimTime },
      defines: floatDefines({
        WHALE_BEND_START,
        WHALE_BEND_SPAN,
        WHALE_STROKE_RATE,
        WHALE_STROKE_LAG,
        WHALE_STROKE_SWING,
        WHALE_HEAD_NOD,
        WHALE_FLIPPER_RATE,
        WHALE_FLIPPER_SWEEP,
        WHALE_FLIPPER_LIFT,
        WHALE_FLIPPER_SPREAD,
        WHALE_WATER_SHARE,
      }),
      vertex: { common: WHALE_SWIM_PARS, begin_vertex: WHALE_SWIM },
      fragment: { colorspace_fragment: SILHOUETTE_SHADE, fog_fragment: SILHOUETTE_WATER },
    }
  )

export function buildWhaleSilhouette(): WhaleSilhouette {
  const swimTime = { value: 0 }
  const body = new THREE.Mesh(buildSilhouetteGeometry(), createSilhouetteMaterial(swimTime))
  body.scale.setScalar(WHALE_LENGTH)
  body.position.z = WHALE_DEPTH_Z
  return { body, swimTime }
}

export function disposeWhaleSilhouette({ body }: WhaleSilhouette) {
  body.geometry.dispose()
  ;(body.material as THREE.Material).dispose()
}
