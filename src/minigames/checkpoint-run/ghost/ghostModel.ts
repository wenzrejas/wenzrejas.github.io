import * as THREE from 'three'
import { displayColorOf } from '@/utils/color'
import { mergeParts } from '@/utils/geometry'
import { floatDefines } from '@/utils/glsl'
import { meshesOf } from '@/utils/meshes'
import { waveUniforms } from '@/world/environment/ocean/waveUniforms'
import { createDepthPass } from '@/world/ship/shipFade'
import { BEHIND_SHIP_MASK } from '@/world/ship/shipMask'
import { GHOST_COLOR, GHOST_EDGE_ANGLE, GHOST_LINE_ALPHA } from '../constants'
import GHOST_VERT from './shaders/ghost.vert.glsl'
import GHOST_FRAG from './shaders/ghost.frag.glsl'

const positionsOnly = (mesh: THREE.Mesh) => {
  const part = mesh.geometry.clone()
  for (const name of Object.keys(part.attributes)) {
    if (name !== 'position') part.deleteAttribute(name)
  }
  return part.applyMatrix4(mesh.matrixWorld)
}

export function buildGhostGeometry(model: THREE.Object3D) {
  model.updateWorldMatrix(true, true)
  return mergeParts(meshesOf(model).map(positionsOnly))
}

export const buildGhostOutline = (geometry: THREE.BufferGeometry) =>
  new THREE.EdgesGeometry(geometry, GHOST_EDGE_ANGLE)

export const createGhostMaterial = () =>
  new THREE.ShaderMaterial({
    vertexShader: GHOST_VERT,
    fragmentShader: GHOST_FRAG,
    defines: floatDefines({ GHOST_LINE_ALPHA }),
    uniforms: {
      ...waveUniforms,
      uColor: { value: displayColorOf(GHOST_COLOR) },
      uOpacity: { value: 0 },
    },
    ...BEHIND_SHIP_MASK,
    transparent: true,
    depthWrite: false,
    visible: false,
  })

export const createGhostDepthMaterial = () =>
  Object.assign(createDepthPass(THREE.DoubleSide), BEHIND_SHIP_MASK)
