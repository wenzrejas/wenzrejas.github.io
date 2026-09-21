import * as THREE from 'three'
import { POD_MAX } from './constants'
import BODY_VERT_GLSL from './shaders/dolphinBody.vert.glsl'
import BODY_FRAG_GLSL from './shaders/dolphinBody.frag.glsl'

type Point = [number, number, number]

interface Vertex {
  p: Point
  up: number
}

const BACK_COLOR = new THREE.Color('#5b7089')
const BELLY_COLOR = new THREE.Color('#c9d3dc')
const RING_SEGMENTS = 6

const PROFILE: [number, number][] = [
  [0.42, 0.03],
  [0.34, 0.07],
  [0.2, 0.1],
  [0.02, 0.11],
  [-0.18, 0.08],
  [-0.34, 0.04],
  [-0.44, 0.02],
]

const instanceAttribute = () =>
  new THREE.InstancedBufferAttribute(new Float32Array(POD_MAX), 1).setUsage(THREE.DynamicDrawUsage)

// ── Geometry ──────────────────────────────────────────────────────────────────

export function buildDolphinGeometry(): THREE.BufferGeometry {
  const positions: number[] = []
  const colors: number[] = []

  const tri = (a: Vertex, b: Vertex, c: Vertex) => {
    const color = (a.up + b.up + c.up) / 3 > -0.3 ? BACK_COLOR : BELLY_COLOR
    for (const v of [a, b, c]) {
      positions.push(...v.p)
      colors.push(color.r, color.g, color.b)
    }
  }
  const fin = (a: Point, b: Point, c: Point) =>
    tri({ p: a, up: 1 }, { p: b, up: 1 }, { p: c, up: 1 })

  const rings = PROFILE.map(([z, r]) =>
    Array.from({ length: RING_SEGMENTS }, (_, k): Vertex => {
      const angle = (k / RING_SEGMENTS) * Math.PI * 2 + Math.PI / 2
      return { p: [Math.cos(angle) * r, Math.sin(angle) * r * 1.1, z], up: Math.sin(angle) }
    })
  )
  const nose: Vertex = { p: [0, 0, 0.5], up: 0 }
  const tail: Vertex = { p: [0, 0, -0.47], up: 0 }

  for (let k = 0; k < RING_SEGMENTS; k++) {
    const next = (k + 1) % RING_SEGMENTS
    tri(nose, rings[0][next], rings[0][k])
    for (let i = 0; i < rings.length - 1; i++) {
      const a = rings[i]
      const b = rings[i + 1]
      tri(a[k], a[next], b[next])
      tri(a[k], b[next], b[k])
    }
    tri(tail, rings[rings.length - 1][k], rings[rings.length - 1][next])
  }

  fin([0, 0.11, 0.08], [0, 0.11, -0.08], [0, 0.22, -0.12])
  fin([0, 0, -0.42], [0.15, 0, -0.53], [0.05, 0, -0.5])
  fin([0, 0, -0.42], [-0.15, 0, -0.53], [-0.05, 0, -0.5])
  fin([0.09, -0.05, 0.16], [0.21, -0.1, 0.05], [0.09, -0.06, 0.07])
  fin([-0.09, -0.05, 0.16], [-0.21, -0.1, 0.05], [-0.09, -0.06, 0.07])

  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
  geo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3))
  geo.setAttribute('aPhase', instanceAttribute())
  geo.setAttribute('aArch', instanceAttribute())
  geo.setAttribute('aFade', instanceAttribute())
  geo.computeVertexNormals()
  return geo
}

// ── Materials ─────────────────────────────────────────────────────────────────

export function createDolphinMaterial(): THREE.MeshLambertMaterial {
  const mat = new THREE.MeshLambertMaterial({
    vertexColors: true,
    flatShading: true,
    side: THREE.DoubleSide,
    alphaHash: true,
  })

  mat.onBeforeCompile = (shader) => {
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', `#include <common>\n${BODY_VERT_GLSL}`)
      .replace(
        '#include <begin_vertex>',
        '#include <begin_vertex>\ntransformed = deformDolphin(transformed);\nvFade = aFade;'
      )
    shader.fragmentShader = shader.fragmentShader
      .replace('#include <common>', `#include <common>\n${BODY_FRAG_GLSL}`)
      .replace(
        '#include <alphahash_fragment>',
        'diffuseColor.a *= vFade;\n#include <alphahash_fragment>'
      )
  }

  return mat
}
