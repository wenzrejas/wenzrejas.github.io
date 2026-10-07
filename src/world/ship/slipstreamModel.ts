import * as THREE from 'three'
import { stitchRibbon } from '@/utils/geometry'
import { floatDefines } from '@/utils/glsl'
import {
  SLIPSTREAM_BEAM,
  SLIPSTREAM_BOW_TAPER,
  SLIPSTREAM_BOW_Z,
  SLIPSTREAM_DASH,
  SLIPSTREAM_HEIGHTS,
  SLIPSTREAM_OPACITY,
  SLIPSTREAM_SEGMENTS,
  SLIPSTREAM_SPEED,
  SLIPSTREAM_STERN_Z,
  SLIPSTREAM_WIDTH,
} from './constants'
import SLIPSTREAM_VERT from './shaders/slipstream.vert.glsl'
import SLIPSTREAM_FRAG from './shaders/slipstream.frag.glsl'

function hullSidePath(side: number): THREE.Vector2[] {
  return Array.from({ length: SLIPSTREAM_SEGMENTS + 1 }, (_, i) => {
    const z = SLIPSTREAM_BOW_Z + (SLIPSTREAM_STERN_Z - SLIPSTREAM_BOW_Z) * (i / SLIPSTREAM_SEGMENTS)
    const taper = Math.sqrt(Math.min(1, (SLIPSTREAM_BOW_Z - z) / SLIPSTREAM_BOW_TAPER))
    return new THREE.Vector2(side * SLIPSTREAM_BEAM * taper, z)
  })
}

export function buildSlipstreamGeometry(): THREE.BufferGeometry {
  const positions: number[] = []
  const alongs: number[] = []
  const seeds: number[] = []
  const indices: number[] = []

  for (const side of [-1, 1]) {
    const path = hullSidePath(side)
    for (const y of SLIPSTREAM_HEIGHTS) {
      const first = positions.length / 3
      const seed = Math.random()
      path.forEach((point, i) => {
        const previous = path[Math.max(0, i - 1)]
        const next = path[Math.min(path.length - 1, i + 1)]
        const across = new THREE.Vector2(next.y - previous.y, previous.x - next.x)
          .normalize()
          .multiplyScalar(SLIPSTREAM_WIDTH / 2)
        positions.push(
          point.x - across.x,
          y,
          point.y - across.y,
          point.x + across.x,
          y,
          point.y + across.y
        )
        const along = i / SLIPSTREAM_SEGMENTS
        alongs.push(along, along)
        seeds.push(seed, seed)
      })
      stitchRibbon(indices, first, path.length)
    }
  }

  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
  geometry.setAttribute('along', new THREE.Float32BufferAttribute(alongs, 1))
  geometry.setAttribute('seed', new THREE.Float32BufferAttribute(seeds, 1))
  geometry.setIndex(indices)
  return geometry
}

export const createSlipstreamMaterial = () =>
  new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
    defines: floatDefines({ SLIPSTREAM_SPEED, SLIPSTREAM_DASH, SLIPSTREAM_OPACITY }),
    uniforms: {
      uTime: { value: 0 },
      uStrength: { value: 0 },
    },
    vertexShader: SLIPSTREAM_VERT,
    fragmentShader: SLIPSTREAM_FRAG,
  })
