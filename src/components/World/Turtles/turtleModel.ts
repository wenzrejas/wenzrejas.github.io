import * as THREE from 'three'
import { mix } from '../../../utils/math'
import { addInstancedFloats, createWildlifeMaterial } from '../Effects/wildlifeMaterial'
import { MAX_TURTLES } from './constants'
import BODY_VERT_GLSL from './shaders/turtleBody.vert.glsl'
import BODY_FRAG_GLSL from './shaders/turtleBody.frag.glsl'

type Point = [number, number, number]
type Band = readonly [number, number]

const SHELL_COLOR = new THREE.Color('#7ba85c')
const SCUTE_COLOR = new THREE.Color('#2f6b3d')
const MARGIN_COLOR = new THREE.Color('#4d8a45')
const SKIN_COLOR = new THREE.Color('#79a35f')
const BELLY_COLOR = new THREE.Color('#cbbf86')

const SHELL_RADIUS_X = 0.3
const SHELL_RADIUS_Z = 0.4
const SHELL_RIM_Y = 0.03
const SHELL_DOME = 0.15
const SHELL_FRONT_BIAS = 0.1
const SHELL_ROWS = 6
const SHELL_COLS = 6
const BELLY_Y = -0.05

const SCUTE_LIFT = 0.012
const SCUTE_GAP = 0.035
const VERTEBRAL_U = 0.3
const COSTAL_U = [0.35, 0.71] as const
const MARGINAL_U = [0.75, 0.995] as const
const VERTEBRAL_SPAN = [-0.82, 0.86] as const
const COSTAL_SPAN = [-0.78, 0.82] as const
const MARGINAL_SPAN = [-0.96, 0.96] as const
const VERTEBRAL_ROWS = 5
const COSTAL_ROWS = 4
const MARGINAL_ROWS = 6

const NO_WEIGHT = [0, 0, 0]

// ── Carapace surface ──────────────────────────────────────────────────────────

function shellPoint(across: number, along: number, lift = 0): Point {
  const halfWidth =
    SHELL_RADIUS_X * Math.sqrt(Math.max(0, 1 - along * along)) * (1 + SHELL_FRONT_BIAS * along)
  const dome = Math.max(0, 1 - across * across * 0.9 - along * along * 0.75)
  return [across * halfWidth, SHELL_RIM_Y + SHELL_DOME * dome + lift, along * SHELL_RADIUS_Z]
}

const bands = (count: number, [from, to]: Band): Band[] =>
  Array.from(
    { length: count },
    (_, i) => [mix(from, to, i / count), mix(from, to, (i + 1) / count)] as Band
  )

// ── Geometry ──────────────────────────────────────────────────────────────────

export function buildTurtleGeometry(): THREE.BufferGeometry {
  const positions: number[] = []
  const colors: number[] = []
  const front: number[] = []
  const rear: number[] = []

  const tri = (
    color: THREE.Color,
    points: Point[],
    frontWeights = NO_WEIGHT,
    rearWeights = NO_WEIGHT
  ) => {
    points.forEach((point, i) => {
      positions.push(...point)
      colors.push(color.r, color.g, color.b)
      front.push(frontWeights[i])
      rear.push(rearWeights[i])
    })
  }

  const scute = (color: THREE.Color, [u0, u1]: Band, [v0, v1]: Band) => {
    const left = u0 + SCUTE_GAP
    const right = u1 - SCUTE_GAP
    const back = v0 + SCUTE_GAP
    const fore = v1 - SCUTE_GAP
    const corners: Point[] = [
      shellPoint(left, back, SCUTE_LIFT),
      shellPoint(right, back, SCUTE_LIFT),
      shellPoint(right, fore, SCUTE_LIFT),
      shellPoint(left, fore, SCUTE_LIFT),
    ]
    const middle = shellPoint((left + right) / 2, (back + fore) / 2, SCUTE_LIFT)
    for (let i = 0; i < corners.length; i++) {
      tri(color, [middle, corners[i], corners[(i + 1) % corners.length]])
    }
  }

  const rows = bands(SHELL_ROWS, [-1, 1])
  const columns = bands(SHELL_COLS, [-1, 1])
  for (const [back, fore] of rows) {
    for (const [left, right] of columns) {
      tri(SHELL_COLOR, [shellPoint(left, back), shellPoint(right, back), shellPoint(right, fore)])
      tri(SHELL_COLOR, [shellPoint(left, back), shellPoint(right, fore), shellPoint(left, fore)])
    }
  }

  for (const span of bands(VERTEBRAL_ROWS, VERTEBRAL_SPAN)) {
    scute(SCUTE_COLOR, [-VERTEBRAL_U, VERTEBRAL_U], span)
  }
  for (const side of [-1, 1]) {
    const flank = (edges: Band): Band => (side > 0 ? edges : [-edges[1], -edges[0]])
    for (const span of bands(COSTAL_ROWS, COSTAL_SPAN)) scute(SCUTE_COLOR, flank(COSTAL_U), span)
    for (const span of bands(MARGINAL_ROWS, MARGINAL_SPAN)) {
      scute(MARGIN_COLOR, flank(MARGINAL_U), span)
    }
  }

  const belly: Point = [0, BELLY_Y, 0]
  const rim: Point[] = []
  for (const [, fore] of rows) rim.push(shellPoint(1, fore))
  for (let i = rows.length - 1; i >= 0; i--) rim.push(shellPoint(-1, rows[i][1]))
  rim.push(shellPoint(-1, -1))
  for (let i = 0; i < rim.length; i++) {
    tri(BELLY_COLOR, [rim[(i + 1) % rim.length], rim[i], belly])
  }

  const headRing = (halfX: number, halfY: number, z: number): Point[] => [
    [-halfX, 0.02, z],
    [0, 0.02 + halfY, z],
    [halfX, 0.02, z],
    [0, 0.02 - halfY, z],
  ]
  const neck = headRing(0.06, 0.055, 0.34)
  const brow = headRing(0.078, 0.062, 0.46)
  const snout: Point = [0, 0.015, 0.54]
  for (let i = 0; i < neck.length; i++) {
    const next = (i + 1) % neck.length
    tri(SKIN_COLOR, [neck[i], brow[next], brow[i]])
    tri(SKIN_COLOR, [neck[i], neck[next], brow[next]])
    tri(SKIN_COLOR, [brow[i], brow[next], snout])
  }

  const frontReach = (x: number) => THREE.MathUtils.clamp((Math.abs(x) - 0.2) / 0.3, 0, 1)
  const rearReach = (x: number) => THREE.MathUtils.clamp((Math.abs(x) - 0.13) / 0.18, 0, 1)

  for (const side of [-1, 1]) {
    const rootFront: Point = [side * 0.2, 0, 0.21]
    const rootBack: Point = [side * 0.25, 0, 0.07]
    const trailing: Point = [side * 0.39, -0.01, 0.02]
    const tip: Point = [side * 0.5, -0.02, 0.09]
    const leading: Point = [side * 0.43, -0.015, 0.19]
    for (const flipper of [
      [rootFront, rootBack, trailing],
      [rootFront, trailing, tip],
      [rootFront, tip, leading],
    ]) {
      tri(
        SKIN_COLOR,
        flipper,
        flipper.map(([x]) => frontReach(x))
      )
    }

    const hipFront: Point = [side * 0.19, 0, -0.16]
    const hipBack: Point = [side * 0.13, 0, -0.27]
    const heel: Point = [side * 0.24, -0.02, -0.35]
    const toe: Point = [side * 0.31, -0.02, -0.26]
    for (const paddle of [
      [hipFront, hipBack, heel],
      [hipFront, heel, toe],
    ]) {
      tri(
        SKIN_COLOR,
        paddle,
        NO_WEIGHT,
        paddle.map(([x]) => rearReach(x))
      )
    }
  }

  const tailBase = headRing(0.035, 0.03, -0.34)
  const tailTip: Point = [0, 0.01, -0.45]
  for (let i = 0; i < tailBase.length; i++) {
    tri(SKIN_COLOR, [tailBase[i], tailBase[(i + 1) % tailBase.length], tailTip])
  }

  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
  geo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3))
  geo.setAttribute('aFront', new THREE.Float32BufferAttribute(front, 1))
  geo.setAttribute('aRear', new THREE.Float32BufferAttribute(rear, 1))
  addInstancedFloats(geo, ['aPhase', 'aFade'], MAX_TURTLES)
  geo.computeVertexNormals()
  return geo
}

// ── Material ──────────────────────────────────────────────────────────────────

export function createTurtleMaterial(): THREE.MeshLambertMaterial {
  return createWildlifeMaterial({
    vertexGlsl: BODY_VERT_GLSL,
    fragmentGlsl: BODY_FRAG_GLSL,
    deform: 'paddleFlippers',
  })
}
