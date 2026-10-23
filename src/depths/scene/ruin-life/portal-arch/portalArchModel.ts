import * as THREE from 'three'
import { onceFor } from '@/utils/cache'
import { displayColorOf } from '@/utils/color'
import { floatDefines } from '@/utils/glsl'
import { meshesOf } from '@/utils/meshes'
import { materialNameOf } from '../shared/ruinPoints'
import {
  MOTES_HIGHEST_Y,
  MOTES_LOWEST_Y,
  PORTAL_GLOW_MATERIAL,
  RING_GLOW_COLOR,
  RING_GLOW_REACH,
  RING_GLOW_WIDTH,
} from './constants'
import RING_GLOW_VERT from './shaders/ringGlow.vert.glsl'
import RING_GLOW_FRAG from './shaders/ringGlow.frag.glsl'

const trimmedGlows = new WeakMap<THREE.BufferGeometry, boolean>()
const _toRuin = new THREE.Matrix4()
const _corner = new THREE.Vector3()

function isMoteTriangle(
  positions: THREE.BufferAttribute | THREE.InterleavedBufferAttribute,
  corners: number[]
) {
  let height = 0
  for (const corner of corners)
    height += _corner.fromBufferAttribute(positions, corner).applyMatrix4(_toRuin).y
  height /= corners.length
  return height > MOTES_LOWEST_Y && height < MOTES_HIGHEST_Y
}

export function hideDancingMotes(ruin: THREE.Object3D) {
  ruin.updateWorldMatrix(true, true)
  const fromWorld = ruin.matrixWorld.clone().invert()
  for (const mesh of meshesOf(ruin)) {
    if (!materialNameOf(mesh).startsWith(PORTAL_GLOW_MATERIAL)) continue
    const { geometry } = mesh
    onceFor(trimmedGlows, geometry, () => {
      const index = geometry.index
      if (!index) return false
      _toRuin.multiplyMatrices(fromWorld, mesh.matrixWorld)
      const kept: number[] = []
      for (let start = 0; start < index.count; start += 3) {
        const corners = [index.getX(start), index.getX(start + 1), index.getX(start + 2)]
        if (!isMoteTriangle(geometry.attributes.position, corners)) kept.push(...corners)
      }
      geometry.setIndex(kept)
      return true
    })
  }
}

export function buildRingGlow(ringRadius: number) {
  const span = ringRadius * 2 * RING_GLOW_REACH
  return new THREE.PlaneGeometry(span, span).rotateX(-Math.PI / 2)
}

export const createRingGlowMaterial = () =>
  new THREE.ShaderMaterial({
    vertexShader: RING_GLOW_VERT,
    fragmentShader: RING_GLOW_FRAG,
    defines: floatDefines({ REACH: RING_GLOW_REACH, WIDTH: RING_GLOW_WIDTH }),
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
    uniforms: {
      uStrength: { value: 0 },
      uColor: { value: displayColorOf(RING_GLOW_COLOR) },
    },
  })
