import * as THREE from 'three'
import { useWeatherStore } from '@/store/weatherStore'
import { useWindStore } from '@/store/windStore'
import { floatDefines } from '@/utils/glsl'
import {
  CLOUD_BIAS_PER_COVER,
  CLOUD_GAIN_PER_COVER,
  CLOUD_MODEL_SHADOW_DARK,
  CLOUD_PLANE_MAX_OPACITY,
  CLOUD_PLANE_SIZE,
  CLOUD_SCROLL_SPEED,
  CLOUD_TILE,
} from './constants'
import MODEL_SHADOW_FRAGMENT from './shaders/modelCloudShadow.frag.glsl'
import MODEL_SHADOW_FRAGMENT_PARS from './shaders/modelCloudShadowPars.frag.glsl'
import MODEL_SHADOW_VERTEX_PARS from './shaders/modelCloudShadowPars.vert.glsl'
import MODEL_SHADOW_WORLD_VERTEX from './shaders/modelCloudShadowWorld.vert.glsl'

const MODEL_SHADOW_DEFINES = floatDefines({
  CLOUD_HALF_PLANE: CLOUD_PLANE_SIZE / 2,
  CLOUD_MODEL_SHADOW_DARK,
})

// ── Cloud shadow ──────────────────────────────────────────────────────────────

export const cloudShadowUniforms = {
  uCloudMap: { value: null as THREE.Texture | null },
  uCloudTile: { value: CLOUD_TILE },
  uCloudOffset: { value: new THREE.Vector2() },
  uCloudStrength: { value: 0 },
  uCloudGain: { value: 1 },
  uCloudBias: { value: 0 },
}

export function applyCloudShadow(material: THREE.Material): void {
  material.defines = { ...material.defines, ...MODEL_SHADOW_DEFINES }
  material.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, cloudShadowUniforms)

    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', `#include <common>\n${MODEL_SHADOW_VERTEX_PARS}`)
      .replace(
        '#include <project_vertex>',
        `${MODEL_SHADOW_WORLD_VERTEX}\n#include <project_vertex>`
      )

    shader.fragmentShader = shader.fragmentShader
      .replace('#include <common>', `#include <common>\n${MODEL_SHADOW_FRAGMENT_PARS}`)
      .replace(
        '#include <tonemapping_fragment>',
        `${MODEL_SHADOW_FRAGMENT}\n#include <tonemapping_fragment>`
      )
  }
  material.needsUpdate = true
}

// ── Scroll ────────────────────────────────────────────────────────────────────

const cloudScroll = { x: 0, z: 0 }

function updateCloudScroll(dt: number, directionX: number, directionZ: number): void {
  cloudScroll.x += directionX * CLOUD_SCROLL_SPEED * dt
  cloudScroll.z += directionZ * CLOUD_SCROLL_SPEED * dt
  cloudScroll.x %= CLOUD_TILE
  cloudScroll.z %= CLOUD_TILE
}

export function stepCloudShadows(planeUniforms: Record<string, THREE.IUniform>, dt: number) {
  const { direction: wind } = useWindStore.getState()
  updateCloudScroll(dt, wind.x, wind.y)
  const strength = Math.max(0, useWeatherStore.getState().cloudShadow)
  const gain = 1 + strength * CLOUD_GAIN_PER_COVER
  const bias = strength * CLOUD_BIAS_PER_COVER
  const offsetU = cloudScroll.x / CLOUD_TILE
  const offsetV = cloudScroll.z / CLOUD_TILE

  planeUniforms.uOpacity.value = strength * CLOUD_PLANE_MAX_OPACITY
  planeUniforms.uGain.value = gain
  planeUniforms.uBias.value = bias
  ;(planeUniforms.uOffset.value as THREE.Vector2).set(offsetU, offsetV)

  cloudShadowUniforms.uCloudStrength.value = strength
  cloudShadowUniforms.uCloudGain.value = gain
  cloudShadowUniforms.uCloudBias.value = bias
  cloudShadowUniforms.uCloudOffset.value.set(offsetU, offsetV)
}
