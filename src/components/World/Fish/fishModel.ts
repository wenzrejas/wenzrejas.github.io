import * as THREE from 'three'
import { addInstancedFloats, createWildlifeMaterial } from '../Effects/wildlifeMaterial'
import { MAX_FISH, WAG_AMPLITUDE, WAG_LAG } from './constants'
import BODY_VERT_GLSL from './shaders/fishBody.vert.glsl'
import BODY_FRAG_GLSL from './shaders/fishBody.frag.glsl'

type Point = [number, number, number]

interface Vertex {
  p: Point
  up: number
}

const BACK_COLOR = new THREE.Color('#2e5666')
const BELLY_COLOR = new THREE.Color('#aebfc0')
const FIN_COLOR = new THREE.Color('#3a6576')

const RING_SEGMENTS = 6
const BODY_FLATTEN = 0.62
const NOSE_Z = 0.52
const TAIL_Z = -0.34

const PROFILE: [number, number][] = [
  [0.44, 0.045],
  [0.32, 0.1],
  [0.16, 0.13],
  [0, 0.125],
  [-0.16, 0.085],
  [-0.28, 0.045],
]

// ── Geometry ──────────────────────────────────────────────────────────────────

export function buildFishGeometry(): THREE.BufferGeometry {
  const positions: number[] = []
  const colors: number[] = []

  const push = (point: Point, color: THREE.Color) => {
    positions.push(...point)
    colors.push(color.r, color.g, color.b)
  }

  const bodyTri = (a: Vertex, b: Vertex, c: Vertex) => {
    const color = (a.up + b.up + c.up) / 3 > -0.25 ? BACK_COLOR : BELLY_COLOR
    for (const vertex of [a, b, c]) push(vertex.p, color)
  }

  const fin = (points: Point[]) => {
    for (const point of points) push(point, FIN_COLOR)
  }

  const rings = PROFILE.map(([z, radius]) =>
    Array.from({ length: RING_SEGMENTS }, (_, k): Vertex => {
      const angle = (k / RING_SEGMENTS) * Math.PI * 2 + Math.PI / 2
      return {
        p: [Math.cos(angle) * radius * BODY_FLATTEN, Math.sin(angle) * radius, z],
        up: Math.sin(angle),
      }
    })
  )
  const nose: Vertex = { p: [0, 0, NOSE_Z], up: 0 }
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

  fin([
    [0, 0, -0.3],
    [0, 0.17, -0.52],
    [0, 0, -0.42],
  ])
  fin([
    [0, 0, -0.3],
    [0, 0, -0.42],
    [0, -0.17, -0.52],
  ])
  fin([
    [0, 0.115, 0.06],
    [0, 0.25, -0.06],
    [0, 0.1, -0.16],
  ])
  fin([
    [0, -0.1, -0.02],
    [0, -0.19, -0.14],
    [0, -0.07, -0.18],
  ])

  for (const side of [-1, 1]) {
    fin([
      [side * 0.05, -0.02, 0.17],
      [side * 0.15, -0.07, 0.06],
      [side * 0.04, -0.04, 0.05],
    ])
  }

  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
  geo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3))
  addInstancedFloats(geo, ['aFade', 'aPhase'], MAX_FISH)
  geo.computeVertexNormals()
  return geo
}

// ── Material ──────────────────────────────────────────────────────────────────

export function createFishMaterial(): THREE.MeshLambertMaterial {
  return createWildlifeMaterial({
    vertexGlsl: BODY_VERT_GLSL,
    fragmentGlsl: BODY_FRAG_GLSL,
    deform: 'wagTail',
    defines: { WAG_AMPLITUDE, WAG_LAG },
  })
}
