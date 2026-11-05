import * as THREE from 'three'
import { CLOUD_PLANE_SIZE, CLOUD_SHADOW_COLOR, CLOUD_TILE } from './constants'
import { createCloudTexture } from './cloudTexture'
import CLOUD_FRAG from './shaders/cloudShadow.frag.glsl'
import CLOUD_VERT from './shaders/cloudShadow.vert.glsl'

export function createCloudPlaneMaterial() {
  const repeat = CLOUD_PLANE_SIZE / CLOUD_TILE
  return new THREE.ShaderMaterial({
    vertexShader: CLOUD_VERT,
    fragmentShader: CLOUD_FRAG,
    transparent: true,
    depthWrite: false,
    uniforms: {
      uMap: { value: createCloudTexture() },
      uRepeat: { value: new THREE.Vector2(repeat, repeat) },
      uOffset: { value: new THREE.Vector2() },
      uGain: { value: 1 },
      uBias: { value: 0 },
      uOpacity: { value: 0 },
      uColor: { value: new THREE.Color(CLOUD_SHADOW_COLOR) },
    },
  })
}
