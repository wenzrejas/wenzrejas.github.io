import type * as THREE from 'three'
import { FULL_TURN } from '@/utils/math'
import { meshesOf, nodeNamed } from '@/utils/meshes'
import {
  FLAG_BOUNDS_MARGIN,
  FLAG_RIPPLE_RATE,
  FLAG_RIPPLE_SHARE,
  FLAG_RIPPLE_WAVES_ALONG,
  FLAG_WAVE_RATE,
  FLAG_WAVES_ALONG,
} from './constants'

export interface WavingFlag {
  meshes: THREE.Mesh[]
  rest: Float32Array[]
  length: number
}

const wave = (along: number, wavesAlong: number, rate: number, seconds: number) =>
  Math.sin((along * wavesAlong - seconds * rate) * FULL_TURN)

export function prepareWavingFlag(model: THREE.Object3D, name: string): WavingFlag | null {
  const node = nodeNamed(model, name)
  if (!node) return null

  const meshes = meshesOf(node)
  for (const mesh of meshes) mesh.geometry = mesh.geometry.clone()
  const rest = meshes.map((mesh) => Float32Array.from(mesh.geometry.getAttribute('position').array))
  let length = 0
  for (const positions of rest) {
    for (let i = 0; i < positions.length; i += 3) length = Math.max(length, positions[i])
  }
  for (const mesh of meshes) {
    mesh.geometry.computeBoundingSphere()
    mesh.geometry.boundingSphere!.radius += length * FLAG_BOUNDS_MARGIN
  }
  return { meshes, rest, length }
}

export function waveFlag(flag: WavingFlag, seconds: number, depth: number): void {
  flag.meshes.forEach((mesh, index) => {
    const rest = flag.rest[index]
    const position = mesh.geometry.getAttribute('position') as THREE.BufferAttribute
    const positions = position.array as Float32Array
    for (let i = 0; i < positions.length; i += 3) {
      const along = rest[i] / flag.length
      const swing =
        wave(along, FLAG_WAVES_ALONG, FLAG_WAVE_RATE, seconds) +
        FLAG_RIPPLE_SHARE * wave(along, FLAG_RIPPLE_WAVES_ALONG, FLAG_RIPPLE_RATE, seconds)
      positions[i + 2] = rest[i + 2] + swing * depth * flag.length * along
    }
    position.needsUpdate = true
    mesh.geometry.computeVertexNormals()
  })
}
