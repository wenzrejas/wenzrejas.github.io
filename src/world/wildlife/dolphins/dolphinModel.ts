import * as THREE from 'three'
import { mix } from '@/utils/math'
import { addInstancedFloats, createWildlifeMaterial } from '../shared/wildlifeMaterial'
import { POD_MAX } from './constants'
import {
  ARCH_START,
  BACK_SEGMENTS,
  BELLY_SEGMENTS,
  BODY_STATIONS,
  DORSAL_ROWS,
  DORSAL_TIP,
  FLIPPER_ROWS,
  FLIPPER_TIP,
  FLUKE_ROWS,
  FLUKE_TIP,
  NOSE,
  REST_ARCH,
  TAIL_END,
  type BladeRow,
  type BodyStation,
  type ShapePoint,
} from './dolphinShape'
import BODY_VERT_GLSL from './shaders/dolphinBody.vert.glsl'
import BODY_FRAG_GLSL from './shaders/dolphinBody.frag.glsl'

interface Skin {
  positions: number[]
  indices: number[]
  faceColors: THREE.Color[]
}

const BACK_COLOR = new THREE.Color('#5b7089')
const BELLY_COLOR = new THREE.Color('#c9d3dc')

const LENS_CHORD = [0, 0.25, 0.5, 0.75, 1, 0.75, 0.5, 0.25]

const _sideA = new THREE.Vector3()
const _sideB = new THREE.Vector3()

// ── Loft ──────────────────────────────────────────────────────────────────────

function addLoft(skin: Skin, rings: ShapePoint[][], paint: (segment: number) => THREE.Color) {
  const count = rings[0].length
  const first = skin.positions.length / 3
  for (const ring of rings) for (const point of ring) skin.positions.push(...point)

  const at = (ring: number, segment: number) => first + ring * count + (segment % count)
  const face = (color: THREE.Color, a: number, b: number, c: number) => {
    skin.indices.push(a, b, c)
    skin.faceColors.push(color)
  }

  for (let ring = 0; ring < rings.length - 1; ring++) {
    for (let segment = 0; segment < count; segment++) {
      const color = paint(segment)
      face(color, at(ring, segment), at(ring, segment + 1), at(ring + 1, segment + 1))
      face(color, at(ring, segment), at(ring + 1, segment + 1), at(ring + 1, segment))
    }
  }
}

const pointRing = (point: ShapePoint, count: number): ShapePoint[] =>
  Array.from({ length: count }, () => point)

const mirrored = ([across, height, along]: ShapePoint): ShapePoint => [-across, height, along]

// ── Body ──────────────────────────────────────────────────────────────────────

function bodyRing({ along, top, bottom, halfWidth, bellyLine }: BodyStation): ShapePoint[] {
  const middle = (top + bottom) / 2
  const halfHeight = (top - bottom) / 2
  const seam = Math.acos(THREE.MathUtils.clamp((middle - bellyLine) / halfHeight, -1, 1))
  const place = (angle: number, side: number): ShapePoint => [
    side * Math.sin(angle) * halfWidth,
    middle - Math.cos(angle) * halfHeight,
    along,
  ]

  const rising: ShapePoint[] = []
  for (let step = 0; step < BELLY_SEGMENTS; step++) {
    rising.push(place((seam * step) / BELLY_SEGMENTS, 1))
  }
  for (let step = 0; step < BACK_SEGMENTS; step++) {
    rising.push(place(mix(seam, Math.PI, step / BACK_SEGMENTS), 1))
  }
  const falling: ShapePoint[] = []
  for (let step = 0; step < BACK_SEGMENTS; step++) {
    falling.push(place(mix(Math.PI, seam, step / BACK_SEGMENTS), -1))
  }
  for (let step = 0; step < BELLY_SEGMENTS; step++) {
    falling.push(place((seam * (BELLY_SEGMENTS - step)) / BELLY_SEGMENTS, -1))
  }
  return [...rising, ...falling]
}

function addBody(skin: Skin) {
  const ringSize = (BELLY_SEGMENTS + BACK_SEGMENTS) * 2
  const backStart = BELLY_SEGMENTS
  const backEnd = ringSize - BELLY_SEGMENTS
  addLoft(
    skin,
    [pointRing(NOSE, ringSize), ...BODY_STATIONS.map(bodyRing), pointRing(TAIL_END, ringSize)],
    (segment) => (segment >= backStart && segment < backEnd ? BACK_COLOR : BELLY_COLOR)
  )
}

// ── Fins ──────────────────────────────────────────────────────────────────────

function lensRing({ leading, trailing, thickness }: BladeRow, facing: THREE.Vector3): ShapePoint[] {
  return LENS_CHORD.map((chord, index) => {
    const side = index < LENS_CHORD.length / 2 ? 1 : -1
    const offset = side * Math.sin(chord * Math.PI) * (thickness / 2)
    return [
      mix(leading[0], trailing[0], chord) + facing.x * offset,
      mix(leading[1], trailing[1], chord) + facing.y * offset,
      mix(leading[2], trailing[2], chord) + facing.z * offset,
    ]
  })
}

function bladeFacing({ leading, trailing }: BladeRow, tip: ShapePoint): THREE.Vector3 {
  _sideA.set(trailing[0] - leading[0], trailing[1] - leading[1], trailing[2] - leading[2])
  _sideB.set(tip[0] - leading[0], tip[1] - leading[1], tip[2] - leading[2])
  return new THREE.Vector3().crossVectors(_sideA, _sideB).normalize()
}

function addBlade(skin: Skin, rows: BladeRow[], tip: ShapePoint) {
  const facing = bladeFacing(rows[0], tip)
  const rings = rows.map((row) => lensRing(row, facing))
  addLoft(skin, [...rings, pointRing(tip, LENS_CHORD.length)], () => BACK_COLOR)
}

const mirroredRow = ({ leading, trailing, thickness }: BladeRow): BladeRow => ({
  leading: mirrored(leading),
  trailing: mirrored(trailing),
  thickness,
})

function addFlukes(skin: Skin) {
  const facing = new THREE.Vector3(0, 1, 0)
  const left = [...FLUKE_ROWS].reverse().map(mirroredRow).slice(0, -1)
  const rings = [...left, ...FLUKE_ROWS].map((row) => lensRing(row, facing))
  addLoft(
    skin,
    [
      pointRing(mirrored(FLUKE_TIP), LENS_CHORD.length),
      ...rings,
      pointRing(FLUKE_TIP, LENS_CHORD.length),
    ],
    () => BACK_COLOR
  )
}

// ── Geometry ──────────────────────────────────────────────────────────────────

export function buildDolphinGeometry(): THREE.BufferGeometry {
  const skin: Skin = { positions: [], indices: [], faceColors: [] }

  addBody(skin)
  addBlade(skin, DORSAL_ROWS, DORSAL_TIP)
  addBlade(skin, FLIPPER_ROWS, FLIPPER_TIP)
  addBlade(skin, FLIPPER_ROWS.map(mirroredRow), mirrored(FLIPPER_TIP))
  addFlukes(skin)

  const smooth = new THREE.BufferGeometry()
  smooth.setAttribute('position', new THREE.Float32BufferAttribute(skin.positions, 3))
  smooth.setIndex(skin.indices)
  smooth.computeVertexNormals()

  const geo = smooth.toNonIndexed()
  smooth.dispose()
  const colors = skin.faceColors.flatMap(({ r, g, b }) => [r, g, b, r, g, b, r, g, b])
  geo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3))
  addInstancedFloats(geo, ['aPhase', 'aArch', 'aFade'], POD_MAX)
  return geo
}

// ── Materials ─────────────────────────────────────────────────────────────────

export function createDolphinMaterial(): THREE.MeshLambertMaterial {
  return createWildlifeMaterial({
    vertexGlsl: BODY_VERT_GLSL,
    fragmentGlsl: BODY_FRAG_GLSL,
    deform: 'deformDolphin',
    deformNormal: 'deformDolphinNormal',
    flatShading: false,
    defines: { ARCH_START, REST_ARCH },
  })
}
