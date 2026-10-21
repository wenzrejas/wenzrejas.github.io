import * as THREE from 'three'
import SMOKE_PUFF_FRAG from '@/shaders/smokePuff.frag.glsl'
import { floatDefines } from '@/utils/glsl'
import { SMOKE_OPACITY, SMOKE_PUFF_GROWTH, SMOKE_PUFF_POOL, SMOKE_SHADE } from './constants'
import type { SmokeBuffers } from './smokePuffs'
import TRAIN_SMOKE_VERT from './shaders/trainSmoke.vert.glsl'

const dynamicAttribute = (values: Float32Array, size: number) =>
  new THREE.BufferAttribute(values, size).setUsage(THREE.DynamicDrawUsage)

export function buildSmokeGeometry(): { geometry: THREE.BufferGeometry; buffers: SmokeBuffers } {
  const buffers = {
    positions: new Float32Array(SMOKE_PUFF_POOL * 3),
    lives: new Float32Array(SMOKE_PUFF_POOL).fill(1),
    sizes: new Float32Array(SMOKE_PUFF_POOL),
  }
  const seeds = Float32Array.from({ length: SMOKE_PUFF_POOL }, () => Math.random() * Math.PI * 2)

  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', dynamicAttribute(buffers.positions, 3))
  geometry.setAttribute('aLife', dynamicAttribute(buffers.lives, 1))
  geometry.setAttribute('aSize', dynamicAttribute(buffers.sizes, 1))
  geometry.setAttribute('aSeed', new THREE.BufferAttribute(seeds, 1))
  return { geometry, buffers }
}

export function markSmokeChanged(geometry: THREE.BufferGeometry): void {
  for (const name of ['position', 'aLife', 'aSize']) geometry.getAttribute(name).needsUpdate = true
}

export const createSmokeMaterial = () =>
  new THREE.ShaderMaterial({
    vertexShader: TRAIN_SMOKE_VERT,
    fragmentShader: SMOKE_PUFF_FRAG,
    defines: floatDefines({
      GROWTH: SMOKE_PUFF_GROWTH,
      OPACITY: SMOKE_OPACITY,
      SHADE: SMOKE_SHADE,
    }),
    transparent: true,
    depthWrite: false,
    uniforms: {
      uSize: { value: 1 },
      uDrift: { value: new THREE.Vector2() },
      uPresence: { value: 1 },
      uColor: { value: new THREE.Color() },
    },
  })
