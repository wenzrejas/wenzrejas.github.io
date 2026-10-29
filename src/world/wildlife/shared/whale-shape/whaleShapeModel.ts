import * as THREE from 'three'
import { FULL_TURN, mix } from '@/utils/math'
import {
  WHALE_FLIPPER,
  WHALE_FLIPPER_ROOT_THICKNESS,
  WHALE_FLIPPER_TIP_THICKNESS,
  WHALE_FLUKE_LEADING_SHARE,
  WHALE_FLUKE_NOTCH,
  WHALE_FLUKE_RIDGE_AT,
  WHALE_FLUKE_TRAILING_SHARE,
  WHALE_LOWER_FLUKE,
  WHALE_PROFILE,
  WHALE_RING_ROUNDNESS,
  WHALE_RING_SEGMENTS,
  WHALE_SNOUT,
  WHALE_TAIL_END,
  WHALE_UPPER_FLUKE,
  WHALE_WIDTH_SHARE,
  type FlukeLobe,
  type OutlinePoint,
  type ShapePoint,
  type WhaleStation,
} from './constants'

interface WhaleShapeLook {
  back: THREE.Color
  belly: THREE.Color
  flipper: THREE.Color
  fluke: THREE.Color
  bellyLine: number
}

interface FlatFlukes {
  span: number
  flareReach: number
  rootThickness: number
  tipThickness: number
  tipLift: number
}

interface WhaleShapePose {
  flipperSplay: number
  flatFlukes?: FlatFlukes
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

function addSkin(shape: WhaleShape, look: WhaleShapeLook, vertices: RingVertex[]) {
  const up = vertices.reduce((sum, vertex) => sum + vertex.up, 0) / vertices.length
  const color = up > look.bellyLine ? look.back : look.belly
  const points = vertices.map((vertex) => vertex.point)
  if (points.length === 3) addTriangle(shape, color, points)
  else addQuad(shape, color, points)
}

function addBody(shape: WhaleShape, look: WhaleShapeLook) {
  const rings = WHALE_PROFILE.map(ringOf)
  const last = rings[rings.length - 1]
  const snout: RingVertex = { point: WHALE_SNOUT, up: 0 }
  const tail: RingVertex = { point: WHALE_TAIL_END, up: 0 }
  for (let segment = 0; segment < WHALE_RING_SEGMENTS; segment++) {
    const next = (segment + 1) % WHALE_RING_SEGMENTS
    addSkin(shape, look, [snout, rings[0][next], rings[0][segment]])
    for (let station = 0; station < rings.length - 1; station++) {
      const [near, far] = [rings[station], rings[station + 1]]
      addSkin(shape, look, [near[segment], near[next], far[next], far[segment]])
    }
    addSkin(shape, look, [tail, last[segment], last[next]])
  }
}

const upright = ([along, height]: OutlinePoint): ShapePoint => [0, height, along]

const noReaches = (points: ShapePoint[]) => points.map(() => 0)

function addBand(
  shape: WhaleShape,
  color: THREE.Color,
  near: ShapePoint[],
  far: ShapePoint[],
  nearReaches = noReaches(near),
  farReaches = noReaches(far)
) {
  for (let step = 0; step < near.length - 1; step++) {
    addQuad(
      shape,
      color,
      [near[step], near[step + 1], far[step + 1], far[step]],
      [nearReaches[step], nearReaches[step + 1], farReaches[step + 1], farReaches[step]]
    )
  }
}

function addBlade(
  shape: WhaleShape,
  color: THREE.Color,
  near: ShapePoint[],
  tip: ShapePoint,
  far: ShapePoint[],
  nearReaches = noReaches(near),
  tipReach = 0,
  farReaches = noReaches(far)
) {
  addBand(shape, color, near, far, nearReaches, farReaches)
  const last = near.length - 1
  addTriangle(
    shape,
    color,
    [near[last], tip, far[last]],
    [nearReaches[last], tipReach, farReaches[last]]
  )
}

interface FlukeRow {
  points: OutlinePoint[]
  share: number
}

const lyingFlat =
  (
    { span, flareReach, rootThickness, tipThickness, tipLift }: FlatFlukes,
    side: number,
    surface: number
  ) =>
  ([along, height]: OutlinePoint): ShapePoint => {
    const reach = height / WHALE_UPPER_FLUKE.tip[1]
    const flare = THREE.MathUtils.smoothstep(reach, 0, flareReach)
    const thickness = mix(rootThickness, tipThickness, reach)
    return [
      side * height * span * flare,
      tipLift * reach * reach + (surface * thickness) / 2,
      along,
    ]
  }

function flukeRows(): FlukeRow[] {
  const { leading, trailing } = WHALE_UPPER_FLUKE
  const ridge = leading.map(
    ([along, height], index): OutlinePoint => [
      mix(along, trailing[index][0], WHALE_FLUKE_RIDGE_AT),
      mix(height, trailing[index][1], WHALE_FLUKE_RIDGE_AT),
    ]
  )
  return [
    { points: leading, share: WHALE_FLUKE_LEADING_SHARE },
    { points: ridge, share: 1 },
    { points: trailing, share: WHALE_FLUKE_TRAILING_SHARE },
  ]
}

function addFlukeLobe(
  shape: WhaleShape,
  color: THREE.Color,
  { leading, trailing, tip }: FlukeLobe,
  place: (point: OutlinePoint) => ShapePoint
) {
  addBlade(shape, color, leading.map(place), place(tip), trailing.map(place))
}

function addSolidFlukes(shape: WhaleShape, look: WhaleShapeLook, flukes: FlatFlukes) {
  const rows = flukeRows()
  const [frontRow, backRow] = [rows[0], rows[rows.length - 1]]
  const notch = WHALE_UPPER_FLUKE.trailing[0]
  const faceColor = (face: number) => (face > 0 ? look.fluke : look.belly)
  const placed = (side: number, surface: number, points: OutlinePoint[]) =>
    points.map(lyingFlat(flukes, side, surface))
  const acrossSides = (surface: number, point: OutlinePoint) =>
    [-1, 1].map((side) => lyingFlat(flukes, side, surface)(point))

  for (const side of [-1, 1]) {
    const tip = lyingFlat(flukes, side, 0)(WHALE_UPPER_FLUKE.tip)
    for (const face of [-1, 1]) {
      for (let row = 0; row < rows.length - 1; row++) {
        const [near, far] = [rows[row], rows[row + 1]]
        addBlade(
          shape,
          faceColor(face),
          placed(side, face * near.share, near.points),
          tip,
          placed(side, face * far.share, far.points)
        )
      }
    }
    for (const { points, share } of [frontRow, backRow]) {
      addBlade(shape, look.fluke, placed(side, share, points), tip, placed(side, -share, points))
    }
  }

  for (const face of [-1, 1]) {
    for (let row = 0; row < rows.length - 1; row++) {
      const [near, far] = [rows[row], rows[row + 1]]
      addBand(
        shape,
        faceColor(face),
        acrossSides(face * near.share, near.points[0]),
        acrossSides(face * far.share, far.points[0])
      )
    }
  }
  addBand(shape, look.fluke, acrossSides(backRow.share, notch), acrossSides(-backRow.share, notch))
}

function addFlukes(shape: WhaleShape, look: WhaleShapeLook, { flatFlukes }: WhaleShapePose) {
  if (flatFlukes) {
    addSolidFlukes(shape, look, flatFlukes)
    return
  }
  addFlukeLobe(shape, look.fluke, WHALE_UPPER_FLUKE, upright)
  addFlukeLobe(shape, look.fluke, WHALE_LOWER_FLUKE, upright)
  const fork = [WHALE_UPPER_FLUKE.leading[0], WHALE_LOWER_FLUKE.leading[0], WHALE_FLUKE_NOTCH]
  addTriangle(shape, look.fluke, fork.map(upright))
}

function turnedAboutRoot(
  [across, height, along]: ShapePoint,
  rootAcross: number,
  rootHeight: number,
  turn: number
): ShapePoint {
  const [offsetAcross, offsetHeight] = [across - rootAcross, height - rootHeight]
  const [cosine, sine] = [Math.cos(turn), Math.sin(turn)]
  return [
    across + (cosine - 1) * offsetAcross - sine * offsetHeight,
    height + sine * offsetAcross + (cosine - 1) * offsetHeight,
    along,
  ]
}

function addFlipper(shape: WhaleShape, look: WhaleShapeLook, splay: number, side: number) {
  const { leading, trailing, tip } = WHALE_FLIPPER
  const rootHeight = leading[0][1]
  const reachOf = ([, height]: ShapePoint) => (rootHeight - height) / (rootHeight - tip[1])
  const rootAcross = side * leading[0][0]
  const rootMiddle = (leading[0][1] + trailing[0][1]) / 2
  const onFace =
    (face: number) =>
    (point: ShapePoint): ShapePoint => {
      const [across, height, along] = point
      const thickness = mix(
        WHALE_FLIPPER_ROOT_THICKNESS,
        WHALE_FLIPPER_TIP_THICKNESS,
        reachOf(point)
      )
      return turnedAboutRoot(
        [side * (across + (face * thickness) / 2), height, along],
        rootAcross,
        rootMiddle,
        side * splay
      )
    }

  const [leadingReaches, trailingReaches] = [leading.map(reachOf), trailing.map(reachOf)]
  for (const face of [-1, 1]) {
    const place = onFace(face)
    addBlade(
      shape,
      look.flipper,
      leading.map(place),
      place(tip),
      trailing.map(place),
      leadingReaches,
      reachOf(tip),
      trailingReaches
    )
  }

  const rim = [...leading, tip, ...[...trailing].reverse()]
  const rimReaches = rim.map(reachOf)
  addBand(shape, look.flipper, rim.map(onFace(1)), rim.map(onFace(-1)), rimReaches, rimReaches)
}

// ── Geometry ──────────────────────────────────────────────────────────────────

export function buildWhaleShapeGeometry(
  look: WhaleShapeLook,
  pose: WhaleShapePose
): THREE.BufferGeometry {
  const shape: WhaleShape = { positions: [], colors: [], reaches: [] }
  addBody(shape, look)
  addFlukes(shape, look, pose)
  for (const side of [-1, 1]) addFlipper(shape, look, pose.flipperSplay, side)
  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(shape.positions, 3))
  geometry.setAttribute('color', new THREE.Float32BufferAttribute(shape.colors, 3))
  geometry.setAttribute('flipperReach', new THREE.Float32BufferAttribute(shape.reaches, 1))
  geometry.computeVertexNormals()
  return geometry
}
