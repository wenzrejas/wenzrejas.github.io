import * as THREE from 'three'
import { FISH_OPACITY, MAX_FISH } from './constants'
import FISH_VERT from './shaders/fish.vert.glsl'
import FISH_FRAG from './shaders/fish.frag.glsl'

type Point = [number, number]

// ── Geometry ──────────────────────────────────────────────────────────────────

export function buildFishGeometry(): THREE.BufferGeometry {
  const outline: Point[] = [
    [0, 0.5],
    [0.09, 0.4],
    [0.14, 0.2],
    [0.13, 0],
    [0.08, -0.18],
    [0.03, -0.28],
    [-0.03, -0.28],
    [-0.08, -0.18],
    [-0.13, 0],
    [-0.14, 0.2],
    [-0.09, 0.4],
  ]
  const tail: Point[] = [
    [0, -0.26],
    [0.16, -0.5],
    [0, -0.42],
    [-0.16, -0.5],
  ]

  const positions: number[] = []
  const push = ([x, z]: Point) => positions.push(x, 0, z)

  for (let i = 1; i < outline.length - 1; i++) {
    push(outline[0])
    push(outline[i])
    push(outline[i + 1])
  }
  for (const [a, b, c] of [
    [0, 1, 2],
    [0, 2, 3],
  ]) {
    push(tail[a])
    push(tail[b])
    push(tail[c])
  }

  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
  for (const name of ['aFade', 'aPhase']) {
    geo.setAttribute(
      name,
      new THREE.InstancedBufferAttribute(new Float32Array(MAX_FISH), 1).setUsage(
        THREE.DynamicDrawUsage
      )
    )
  }
  return geo
}

// ── Material ──────────────────────────────────────────────────────────────────

export function createFishMaterial(): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    vertexShader: FISH_VERT,
    fragmentShader: FISH_FRAG,
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
    uniforms: {
      uColor: { value: new THREE.Color() },
      uOpacity: { value: FISH_OPACITY },
    },
  })
}
