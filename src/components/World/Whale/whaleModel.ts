import * as THREE from 'three'
import { createWildlifeMaterial } from '../Effects/wildlifeMaterial'
import {
  BEND_SPAN,
  BEND_START,
  FIN_AMPLITUDE,
  FIN_FREQ,
  NOSE_OFFSET,
  STROKE_AMPLITUDE,
  STROKE_LAG,
} from './constants'
import BODY_VERT_GLSL from './shaders/whaleBody.vert.glsl'
import BODY_FRAG_GLSL from './shaders/whaleBody.frag.glsl'

type Point = [number, number, number]

interface Vertex {
  p: Point
  up: number
}

const BACK_COLOR = new THREE.Color('#33475c')
const BELLY_COLOR = new THREE.Color('#c2ccd2')
const FLIPPER_COLOR = new THREE.Color('#dde5e9')
const FLUKE_COLOR = new THREE.Color('#2b3c4d')

const RING_SEGMENTS = 7
const BODY_SQUASH = 0.92
const TAIL_Z = -0.48
const NO_FIN = [0, 0, 0]

const PROFILE: [number, number][] = [
  [0.46, 0.035],
  [0.36, 0.085],
  [0.24, 0.115],
  [0.08, 0.125],
  [-0.08, 0.115],
  [-0.22, 0.085],
  [-0.34, 0.05],
  [-0.44, 0.025],
]

const flipperReach = (x: number) => THREE.MathUtils.clamp((Math.abs(x) - 0.085) / 0.28, 0, 1)

// ── Geometry ──────────────────────────────────────────────────────────────────

export function buildWhaleGeometry(): THREE.BufferGeometry {
  const positions: number[] = []
  const colors: number[] = []
  const fins: number[] = []

  const push = (point: Point, color: THREE.Color, fin: number) => {
    positions.push(...point)
    colors.push(color.r, color.g, color.b)
    fins.push(fin)
  }

  const bodyTri = (a: Vertex, b: Vertex, c: Vertex) => {
    const color = (a.up + b.up + c.up) / 3 > -0.3 ? BACK_COLOR : BELLY_COLOR
    for (const vertex of [a, b, c]) push(vertex.p, color, 0)
  }

  const plate = (color: THREE.Color, points: Point[], finWeights = NO_FIN) =>
    points.forEach((point, i) => push(point, color, finWeights[i]))

  const rings = PROFILE.map(([z, radius]) =>
    Array.from({ length: RING_SEGMENTS }, (_, k): Vertex => {
      const angle = (k / RING_SEGMENTS) * Math.PI * 2 + Math.PI / 2
      return {
        p: [Math.cos(angle) * radius, Math.sin(angle) * radius * BODY_SQUASH, z],
        up: Math.sin(angle),
      }
    })
  )
  const nose: Vertex = { p: [0, 0, NOSE_OFFSET], up: 0 }
  const tail: Vertex = { p: [0, 0, TAIL_Z], up: 0 }

  for (let k = 0; k < RING_SEGMENTS; k++) {
    const next = (k + 1) % RING_SEGMENTS
    bodyTri(nose, rings[0][next], rings[0][k])
    for (let i = 0; i < rings.length - 1; i++) {
      const near = rings[i]
      const far = rings[i + 1]
      bodyTri(near[k], near[next], far[next])
      bodyTri(near[k], far[next], far[k])
    }
    bodyTri(tail, rings[rings.length - 1][k], rings[rings.length - 1][next])
  }

  for (const side of [-1, 1]) {
    const rootFront: Point = [side * 0.085, -0.02, 0.2]
    const rootBack: Point = [side * 0.07, -0.035, 0.08]
    const midFront: Point = [side * 0.24, -0.045, 0.11]
    const midBack: Point = [side * 0.22, -0.055, 0.0]
    const tip: Point = [side * 0.36, -0.07, 0.03]
    for (const flipper of [
      [rootFront, rootBack, midBack],
      [rootFront, midBack, midFront],
      [midFront, midBack, tip],
    ]) {
      plate(
        FLIPPER_COLOR,
        flipper,
        flipper.map(([x]) => flipperReach(x))
      )
    }

    const flukeRoot: Point = [0, 0, -0.44]
    const flukeEdge: Point = [side * 0.12, 0, -0.45]
    const flukeTip: Point = [side * 0.26, 0.01, -0.6]
    const flukeNotch: Point = [0, 0, -0.54]
    plate(FLUKE_COLOR, [flukeRoot, flukeEdge, flukeTip])
    plate(FLUKE_COLOR, [flukeRoot, flukeTip, flukeNotch])
  }

  plate(BACK_COLOR, [
    [0, 0.105, -0.14],
    [0, 0.105, -0.24],
    [0, 0.16, -0.21],
  ])

  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
  geo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3))
  geo.setAttribute('aFin', new THREE.Float32BufferAttribute(fins, 1))
  geo.computeVertexNormals()
  return geo
}

// ── Material ──────────────────────────────────────────────────────────────────

export const whaleUniforms = {
  uPhase: { value: 0 },
  uFade: { value: 1 },
}

export function createWhaleMaterial(): THREE.MeshLambertMaterial {
  return createWildlifeMaterial({
    vertexGlsl: BODY_VERT_GLSL,
    fragmentGlsl: BODY_FRAG_GLSL,
    deform: 'swimWhale',
    fade: 'uFade',
    uniforms: whaleUniforms,
    defines: {
      BEND_START,
      BEND_SPAN,
      STROKE_LAG,
      STROKE_AMPLITUDE,
      FIN_FREQ,
      FIN_AMPLITUDE,
    },
  })
}
