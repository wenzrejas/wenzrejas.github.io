import * as THREE from 'three'
import { floatDefines } from '../../../../utils/glsl'
import { rand } from '../../../../utils/math'
import {
  SPARKLE_DENSITY,
  SPARKLE_FLASH_SHARE,
  SPARKLE_LIFT,
  SPARKLE_MIN_COUNT,
  SPARKLE_PERIOD_MAX,
  SPARKLE_PERIOD_MIN,
  SPARKLE_RAY_WIDTH,
  SPARKLE_TINT,
} from './constants'
import type { ShrineGem } from './shrines'
import GEM_SPARKLES_VERT from './shaders/gemSparkles.vert.glsl'
import GEM_SPARKLES_FRAG from './shaders/gemSparkles.frag.glsl'

// ── Geometry ──────────────────────────────────────────────────────────────────

function edgeLengthsUpTo(edges: Float32Array): number[] {
  const reached: number[] = []
  let total = 0
  for (let i = 0; i < edges.length; i += 6) {
    total += Math.hypot(
      edges[i + 3] - edges[i],
      edges[i + 4] - edges[i + 1],
      edges[i + 5] - edges[i + 2]
    )
    reached.push(total)
  }
  return reached
}

export function buildSparkleGeometry({ edges }: ShrineGem): THREE.BufferGeometry {
  const reached = edgeLengthsUpTo(edges)
  const totalLength = reached[reached.length - 1] ?? 0
  const count = Math.max(SPARKLE_MIN_COUNT, Math.round(totalLength * SPARKLE_DENSITY))
  const starts = new Float32Array(count * 3)
  const ends = new Float32Array(count * 3)
  const seeds = new Float32Array(count * 3)

  for (let i = 0; i < count; i++) {
    const pick = Math.random() * totalLength
    const edge = Math.max(
      0,
      reached.findIndex((length) => length >= pick)
    )
    starts.set(edges.subarray(edge * 6, edge * 6 + 3), i * 3)
    ends.set(edges.subarray(edge * 6 + 3, edge * 6 + 6), i * 3)
    seeds.set([rand(SPARKLE_PERIOD_MIN, SPARKLE_PERIOD_MAX), Math.random(), Math.random()], i * 3)
  }

  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.BufferAttribute(starts, 3))
  geometry.setAttribute('aEnd', new THREE.BufferAttribute(ends, 3))
  geometry.setAttribute('aSeed', new THREE.BufferAttribute(seeds, 3))
  return geometry
}

// ── Material ──────────────────────────────────────────────────────────────────

export function createSparkleMaterial({ color }: ShrineGem): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    vertexShader: GEM_SPARKLES_VERT,
    fragmentShader: GEM_SPARKLES_FRAG,
    defines: floatDefines({
      FLASH_SHARE: SPARKLE_FLASH_SHARE,
      LIFT: SPARKLE_LIFT,
      RAY_WIDTH: SPARKLE_RAY_WIDTH,
    }),
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: {
      uTime: { value: 0 },
      uSize: { value: 1 },
      uColor: { value: new THREE.Color(1, 1, 1).lerp(color, SPARKLE_TINT) },
    },
  })
}
