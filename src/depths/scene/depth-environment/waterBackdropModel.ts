import * as THREE from 'three'
import { RENDER_LAYER } from '@/app/experience/renderLayers'
import SCREEN_QUAD_VERT from '@/shaders/screenQuad.vert.glsl'
import { displayColorOf } from '@/utils/color'
import { floatDefines } from '@/utils/glsl'
import {
  LIGHT_COLUMN_COLOR,
  LIGHT_COLUMN_WIDTH,
  SURFACE_GLOW_COLOR,
  SURFACE_GLOW_FALLOFF,
  VIGNETTE_INNER,
  VIGNETTE_OUTER,
  WATER_SHIMMER,
  WATER_SHIMMER_RATE,
} from './constants'
import WATER_BACKDROP_FRAG from './shaders/waterBackdrop.frag.glsl'

export function buildWaterBackdrop() {
  const material = new THREE.ShaderMaterial({
    vertexShader: SCREEN_QUAD_VERT,
    fragmentShader: WATER_BACKDROP_FRAG,
    defines: floatDefines({
      VIGNETTE_INNER,
      VIGNETTE_OUTER,
      COLUMN_WIDTH: LIGHT_COLUMN_WIDTH,
      SURFACE_FALLOFF: SURFACE_GLOW_FALLOFF,
      SHIMMER: WATER_SHIMMER,
      SHIMMER_RATE: WATER_SHIMMER_RATE,
    }),
    depthTest: false,
    depthWrite: false,
    uniforms: {
      uBodyColor: { value: new THREE.Color() },
      uEdgeColor: { value: new THREE.Color() },
      uColumnColor: { value: displayColorOf(LIGHT_COLUMN_COLOR) },
      uSurfaceColor: { value: displayColorOf(SURFACE_GLOW_COLOR) },
      uColumnLevel: { value: 0 },
      uSurfaceLevel: { value: 0 },
      uAspect: { value: 1 },
      uTime: { value: 0 },
    },
  })
  const backdrop = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material)
  backdrop.frustumCulled = false
  backdrop.renderOrder = RENDER_LAYER.depthsBackdrop
  return backdrop
}
