import * as THREE from 'three'
import { CLOUD_PLANE_SIZE, CLOUD_TILE } from './cloudTexture'

const DRIFT_SPEED = 8
const HALF = CLOUD_PLANE_SIZE / 2
const MODEL_SHADOW_DARK = 0.5

// ── Per-pixel cloud shadow on lit models ─────────────────────────────────────

export const cloudShadowUniforms = {
  uCloudMap: { value: null as THREE.Texture | null },
  uCloudTile: { value: CLOUD_TILE },
  uCloudOffset: { value: new THREE.Vector2() },
  uCloudStrength: { value: 0 },
  uCloudGain: { value: 1 },
  uCloudBias: { value: 0 },
}

export function applyCloudShadow(material: THREE.Material): void {
  material.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, cloudShadowUniforms)

    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', '#include <common>\nvarying vec3 vCloudWorld;')
      .replace(
        '#include <project_vertex>',
        'vCloudWorld = ( modelMatrix * vec4( transformed, 1.0 ) ).xyz;\n#include <project_vertex>'
      )

    shader.fragmentShader = shader.fragmentShader
      .replace(
        '#include <common>',
        [
          '#include <common>',
          'varying vec3 vCloudWorld;',
          'uniform sampler2D uCloudMap;',
          'uniform float uCloudTile;',
          'uniform vec2 uCloudOffset;',
          'uniform float uCloudStrength;',
          'uniform float uCloudGain;',
          'uniform float uCloudBias;',
        ].join('\n')
      )
      .replace(
        '#include <tonemapping_fragment>',
        [
          '{',
          `  vec2 cuv = vec2( vCloudWorld.x + ${HALF.toFixed(1)}, ${HALF.toFixed(1)} - vCloudWorld.z ) / uCloudTile + uCloudOffset;`,
          '  float d = texture2D( uCloudMap, cuv ).a;',
          '  float cloud = clamp( d * uCloudGain + uCloudBias, 0.0, 1.0 ) * uCloudStrength;',
          `  gl_FragColor.rgb *= 1.0 - cloud * ${MODEL_SHADOW_DARK.toFixed(2)};`,
          '}',
          '#include <tonemapping_fragment>',
        ].join('\n')
      )
  }
  material.needsUpdate = true
}

// ── Scroll ────────────────────────────────────────────────────────────────────

export const cloudScroll = { x: 0, z: 0 }

export function updateCloudScroll(dt: number, dirX: number, dirZ: number): void {
  cloudScroll.x += dirX * DRIFT_SPEED * dt
  cloudScroll.z += dirZ * DRIFT_SPEED * dt
  cloudScroll.x %= CLOUD_TILE
  cloudScroll.z %= CLOUD_TILE
}

export function cloudRemap(cover: number) {
  const c = Math.max(0, cover)
  return {
    strength: c,
    gain: 1 + c * 0.85,
    bias: c * 0.14,
  }
}
