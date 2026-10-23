import * as THREE from 'three'
import SCREEN_QUAD_VERT from '@/shaders/screenQuad.vert.glsl'

export type VeilQuad = THREE.Mesh<THREE.BufferGeometry, THREE.ShaderMaterial>

export function buildVeilQuad(
  geometry: THREE.BufferGeometry,
  parameters: THREE.ShaderMaterialParameters,
  layer: number
): VeilQuad {
  const material = new THREE.ShaderMaterial({
    vertexShader: SCREEN_QUAD_VERT,
    transparent: true,
    depthTest: false,
    depthWrite: false,
    ...parameters,
  })
  const quad = new THREE.Mesh(geometry, material)
  quad.frustumCulled = false
  quad.renderOrder = layer
  return quad
}
